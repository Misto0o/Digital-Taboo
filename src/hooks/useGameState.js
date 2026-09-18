import { useState, useEffect, useRef, useCallback } from 'react';
import { track } from '../lib/analytics';

export const SCREENS = {
  HOME: 'home',
  SETUP: 'setup',
  PASS_DEVICE: 'pass_device',
  PLAYING: 'playing',
  ROUND_END: 'round_end',
  GAME_OVER: 'game_over',
};

/**
 * How this game is being played. This is tracked explicitly rather than
 * inferred from whether a room code exists — inferring it was the cause of
 * a bug where "Create Room" silently behaved like solo play and never
 * actually created a room, so nobody could join.
 */
export const MODES = {
  SINGLE: 'single', // one player, one 60s turn, high score
  PASS: 'pass',     // one device, 2-4 teams, physically passed around
  HOST: 'host',     // online, this device controls team 0
  GUEST: 'guest',   // online, this device controls team 1
};

const TURN_DURATION = 60; // seconds

export function useGameState(buildDeck, buildDeckFromIds) {
  const [screen, setScreen] = useState(SCREENS.HOME);
  const [mode, setMode] = useState(null);
  const [teams, setTeams] = useState([]);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [deck, setDeck] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TURN_DURATION);
  const [timerRunning, setTimerRunning] = useState(false);
  const [roundResults, setRoundResults] = useState([]);
  const [targetScore, setTargetScore] = useState(10);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isTiebreak, setIsTiebreak] = useState(false);
  const timerRef = useRef(null);

  const isSingle = mode === MODES.SINGLE;
  const isOnline = mode === MODES.HOST || mode === MODES.GUEST;

  // ── Timer ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (timerRunning && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timerRunning && timeLeft === 0) {
      endTurn();
    }
    return () => clearTimeout(timerRef.current);
  }, [timerRunning, timeLeft]);

  // ── Start ──────────────────────────────────────────────────────────────
  /**
   * Starts a game. Returns the deck's card ids so the caller can push them
   * to Firestore — online guests rebuild the identical deck from this.
   */
  const startGame = useCallback(
    (teamNames, target, categories = [], gameMode = MODES.PASS) => {
      const names = gameMode === MODES.SINGLE ? ['You'] : teamNames;

      setMode(gameMode);
      setTeams(names.map((name) => ({ name, score: 0 })));
      setTargetScore(target);
      setSelectedCategories(categories);
      setIsTiebreak(false);

      // The deck is the FULL shuffled pool, not a fixed-size slice. A capped
      // deck let one team burn every card in a single turn (skips consume
      // cards but score nothing), leaving the next team with "No more cards"
      // and a game that could never reach its target — an infinite loop.
      // With the full pool, games end by target score as designed, and true
      // exhaustion (200+ cards played) is handled as a game-over below.
      const newDeck = buildDeck(categories);

      setDeck(newDeck);
      setCurrentCardIndex(0);
      setCurrentTeamIndex(0);
      setScreen(SCREENS.PASS_DEVICE);

      return newDeck.map((c) => c.id);
    },
    [buildDeck]
  );

  /**
   * Online guest: rebuild the host's exact deck from the ids they pushed,
   * so both devices are looking at the same cards in the same order.
   */
  const initGuestGame = useCallback(
    (teamNames, target, categories = [], deckIds = []) => {
      setMode(MODES.GUEST);
      setTeams(teamNames.map((name) => ({ name, score: 0 })));
      setTargetScore(target);
      setSelectedCategories(categories);
      setDeck(buildDeckFromIds(deckIds));
      setCurrentCardIndex(0);
    },
    [buildDeckFromIds]
  );

  // ── Turn ───────────────────────────────────────────────────────────────
  const startTurn = useCallback(() => {
    setRoundResults([]);
    // currentCardIndex is deliberately NOT reset — the deck is shared across
    // the whole game, so each turn continues where the last left off. That's
    // what guarantees no card repeats within a game.
    setTimeLeft(TURN_DURATION);
    setTimerRunning(true);
    setScreen(SCREENS.PLAYING);
  }, []);

  const recordResult = useCallback(
    (result) => {
      setRoundResults((r) => [...r, { card: deck[currentCardIndex], result }]);
      setCurrentCardIndex((i) => i + 1);
    },
    [deck, currentCardIndex]
  );

  const handleCorrect = useCallback(() => recordResult('correct'), [recordResult]);
  const handleSkip = useCallback(() => recordResult('skip'), [recordResult]);
  const handlePenalty = useCallback(() => recordResult('penalty'), [recordResult]);

  const endTurn = useCallback(() => {
    setTimerRunning(false);
    clearTimeout(timerRef.current);
    setScreen(SCREENS.ROUND_END);
  }, []);

  // ── Round resolution ───────────────────────────────────────────────────
  const confirmRoundResults = useCallback(() => {
    const earned = roundResults.filter((r) => r.result === 'correct').length;
    const penalized = roundResults.filter((r) => r.result === 'penalty').length;
    const delta = earned - penalized;

    const updatedTeams = teams.map((t, i) =>
      i === currentTeamIndex ? { ...t, score: Math.max(0, t.score + delta) } : t
    );
    setTeams(updatedTeams);

    // Single player: one turn and you're done. No opponent, no target.
    if (isSingle) {
      track('single_game_completed', {
        score: updatedTeams[0].score,
        cardsSeen: currentCardIndex,
        categories: selectedCategories.length ? selectedCategories : ['All Categories'],
      });
      setScreen(SCREENS.GAME_OVER);
      return;
    }

    const nextTeam = (currentTeamIndex + 1) % teams.length;
    const isEndOfRound = nextTeam === 0; // wrapped back to team 1 = everyone played
    const deckExhausted = currentCardIndex >= deck.length;

    if (isEndOfRound) {
      // Only check for a winner once every team has had an equal number of
      // turns — otherwise team 1 could win before team 2 ever answers.
      const maxScore = Math.max(...updatedTeams.map((t) => t.score));
      const atTarget = updatedTeams.filter((t) => t.score >= targetScore);

      if (atTarget.length > 0) {
        const leaders = updatedTeams.filter((t) => t.score === maxScore);

        if (leaders.length > 1 && !deckExhausted) {
          // Two or more tied at the top — play another full round.
          // (Unless there are no cards left to break the tie with.)
          setIsTiebreak(true);
          setCurrentTeamIndex(nextTeam);
          setScreen(SCREENS.PASS_DEVICE);
          return;
        }

        track('game_completed', {
          targetScore,
          winningScore: maxScore,
          cardsUsed: currentCardIndex,
          teamCount: teams.length,
          wasTiebreak: isTiebreak,
          categories: selectedCategories.length ? selectedCategories : ['All Categories'],
        });
        setScreen(SCREENS.GAME_OVER);
        return;
      }
    }

    // No cards left and nobody won by target: end the game now on current
    // scores instead of looping teams through empty turns forever.
    if (deckExhausted) {
      track('game_completed', {
        targetScore,
        winningScore: Math.max(...updatedTeams.map((t) => t.score)),
        cardsUsed: currentCardIndex,
        teamCount: teams.length,
        reason: 'deck_exhausted',
        categories: selectedCategories.length ? selectedCategories : ['All Categories'],
      });
      setScreen(SCREENS.GAME_OVER);
      return;
    }

    setCurrentTeamIndex(nextTeam);
    setScreen(SCREENS.PASS_DEVICE);
  }, [
    roundResults,
    deck,
    teams,
    currentTeamIndex,
    targetScore,
    currentCardIndex,
    selectedCategories,
    isSingle,
    isTiebreak,
  ]);

  const resetGame = useCallback(() => {
    setScreen(SCREENS.HOME);
    setMode(null);
    setTeams([]);
    setCurrentTeamIndex(0);
    setDeck([]);
    setCurrentCardIndex(0);
    setRoundResults([]);
    setTimerRunning(false);
    setTimeLeft(TURN_DURATION);
    setSelectedCategories([]);
    setIsTiebreak(false);
  }, []);

  // ── Online sync ────────────────────────────────────────────────────────
  /**
   * Mirror state pushed by whichever device is currently active.
   * The card index IS synced now: both devices share one deck, so the
   * inactive device must follow along rather than tracking its own position.
   */
  const syncFromRemote = useCallback((remote) => {
    if (remote.screen) setScreen(remote.screen);
    if (remote.teams) setTeams(remote.teams);
    if (remote.currentTeamIndex !== undefined) setCurrentTeamIndex(remote.currentTeamIndex);
    if (remote.cardIndex !== undefined) setCurrentCardIndex(remote.cardIndex);
    if (remote.roundResults) setRoundResults(remote.roundResults);
    if (remote.targetScore) setTargetScore(remote.targetScore);
    if (remote.isTiebreak !== undefined) setIsTiebreak(remote.isTiebreak);
  }, []);

  const currentCard = deck[currentCardIndex] ?? null;
  const currentTeam = teams[currentTeamIndex] ?? null;
  const cardsRemaining = Math.max(0, deck.length - currentCardIndex);

  return {
    screen,
    mode,
    isSingle,
    isOnline,
    teams,
    currentTeam,
    currentTeamIndex,
    currentCard,
    cardsRemaining,
    timeLeft,
    timerRunning,
    roundResults,
    targetScore,
    selectedCategories,
    isTiebreak,
    TURN_DURATION,
    currentCardIndex,
    deck,
    startGame,
    initGuestGame,
    startTurn,
    handleCorrect,
    handleSkip,
    handlePenalty,
    endTurn,
    confirmRoundResults,
    resetGame,
    syncFromRemote,
  };
}