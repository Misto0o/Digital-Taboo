import { useState, useEffect, useRef, useCallback } from 'react';
import { cards, shuffleCards } from '../data/cards';

export const SCREENS = {
  HOME: 'home',
  SETUP: 'setup',
  PASS_DEVICE: 'pass_device',
  PLAYING: 'playing',
  ROUND_END: 'round_end',
  GAME_OVER: 'game_over',
};

const TURN_DURATION = 60; // seconds

export function useGameState() {
  const [screen, setScreen] = useState(SCREENS.HOME);
  const [teams, setTeams] = useState([
    { name: 'Team 1', score: 0 },
    { name: 'Team 2', score: 0 },
  ]);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [deck, setDeck] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TURN_DURATION);
  const [timerRunning, setTimerRunning] = useState(false);
  const [roundResults, setRoundResults] = useState([]); // {card, result: 'correct'|'skip'|'penalty'}
  const [targetScore, setTargetScore] = useState(10);
  const timerRef = useRef(null);

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (timerRunning && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timerRunning && timeLeft === 0) {
      endTurn();
    }
    return () => clearTimeout(timerRef.current);
  }, [timerRunning, timeLeft]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const startGame = useCallback((teamNames, target) => {
    setTeams(teamNames.map((name) => ({ name, score: 0 })));
    setTargetScore(target);
    const enriched = cards.map((card) => {
      const wordParts = card.safeWord.toLowerCase().split(' ').filter((w) => w.length > 2);
      const allForbidden = [...new Set([...card.cantSay, ...wordParts])];
      return { ...card, cantSay: allForbidden };
    });
    setDeck(shuffleCards(enriched)); setCurrentCardIndex(0);
    setCurrentTeamIndex(0);
    setScreen(SCREENS.PASS_DEVICE);
  }, []);

  const startTurn = useCallback(() => {
    setRoundResults([]);
    setTimeLeft(TURN_DURATION);
    setTimerRunning(true);
    setScreen(SCREENS.PLAYING);
  }, []);

  const handleCorrect = useCallback(() => {
    setRoundResults((r) => [...r, { card: deck[currentCardIndex], result: 'correct' }]);
    setCurrentCardIndex((i) => i + 1);
  }, [deck, currentCardIndex]);

  const handleSkip = useCallback(() => {
    setRoundResults((r) => [...r, { card: deck[currentCardIndex], result: 'skip' }]);
    setCurrentCardIndex((i) => i + 1);
  }, [deck, currentCardIndex]);

  const handlePenalty = useCallback(() => {
    // Said a forbidden word — lose a point
    setRoundResults((r) => [...r, { card: deck[currentCardIndex], result: 'penalty' }]);
    setCurrentCardIndex((i) => i + 1);
  }, [deck, currentCardIndex]);

  const endTurn = useCallback(() => {
    setTimerRunning(false);
    clearTimeout(timerRef.current);
    setScreen(SCREENS.ROUND_END);
  }, []);

  const confirmRoundResults = useCallback(() => {
    const earned = roundResults.filter((r) => r.result === 'correct').length;
    const penalized = roundResults.filter((r) => r.result === 'penalty').length;
    const delta = earned - penalized;

    const updatedTeams = teams.map((t, i) =>
      i === currentTeamIndex ? { ...t, score: Math.max(0, t.score + delta) } : t
    );
    setTeams(updatedTeams);

    const winner = updatedTeams.find((t) => t.score >= targetScore);
    if (winner) {
      setScreen(SCREENS.GAME_OVER);
    } else {
      const nextTeam = (currentTeamIndex + 1) % teams.length;
      setCurrentTeamIndex(nextTeam);
      setScreen(SCREENS.PASS_DEVICE);
    }
  }, [roundResults, teams, currentTeamIndex, targetScore]);

  const resetGame = useCallback(() => {
    setScreen(SCREENS.HOME);
    setTeams([{ name: 'Team 1', score: 0 }, { name: 'Team 2', score: 0 }]);
    setCurrentTeamIndex(0);
    setDeck([]);
    setCurrentCardIndex(0);
    setRoundResults([]);
    setTimerRunning(false);
    setTimeLeft(TURN_DURATION);
  }, []);

  const currentCard = deck[currentCardIndex] ?? null;
  const currentTeam = teams[currentTeamIndex];

  const syncFromRemote = useCallback((remoteState) => {
    if (remoteState.screen) setScreen(remoteState.screen);
    if (remoteState.teams) setTeams(remoteState.teams);
    if (remoteState.currentTeamIndex !== undefined) setCurrentTeamIndex(remoteState.currentTeamIndex);
  }, []);

  return {
    screen,
    teams,
    currentTeam,
    currentTeamIndex,
    currentCard,
    timeLeft,
    timerRunning,
    roundResults,
    targetScore,
    TURN_DURATION,
    currentCardIndex,
    syncFromRemote,
    startGame,
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
