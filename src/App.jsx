import React, { useState, useEffect, useRef } from 'react';
import { useGameState, SCREENS, MODES } from './hooks/useGameState';
import { useRoom } from './hooks/useRoom';
import { useCards } from './hooks/useCards';
import { track } from './lib/analytics';
import AdminRoute from './components/AdminRoute';
import RoomScreen from './components/RoomScreen';
import SetupScreen from './components/SetupScreen';
import PassDeviceScreen from './components/PassDeviceScreen';
import PlayingScreen from './components/PlayingScreen';
import RoundEndScreen from './components/RoundEndScreen';
import GameOverScreen from './components/GameOverScreen';
import './styles.css';

function RoomCodeBadge({ code }) {
  return (
    <div className="room-badge">
      Room: <strong>{code}</strong>
    </div>
  );
}

function WaitingOverlay({ teamName }) {
  return (
    <div className="guest-overlay">
      <div className="waiting-inner">
        <div className="waiting-icon">⏳</div>
        <h2>{teamName ? `${teamName} is playing` : 'Waiting for the other player'}</h2>
        <p>Your turn is next — hang tight.</p>
      </div>
    </div>
  );
}

const isAdminRoute = typeof window !== 'undefined' && window.location.pathname === '/admin';

function GameApp() {
  const { categories, loading: cardsLoading, buildDeck, buildDeckFromIds } = useCards();
  const game = useGameState(buildDeck, buildDeckFromIds);
  const room = useRoom();

  // The mode the player CHOSE, tracked from the moment they pick it on the
  // room screen. Previously this was inferred from whether a room code
  // existed, which broke "Create Room" — at setup time no code exists yet,
  // so it looked identical to solo play and the room was never created.
  const [pendingMode, setPendingMode] = useState(null);
  const [localScreen, setLocalScreen] = useState('room');

  const mode = game.mode ?? pendingMode;
  const isOnline = mode === MODES.HOST || mode === MODES.GUEST;
  const isHost = mode === MODES.HOST;

  // Offline modes always control the device. Online, only on your turn.
  const myTeamIndex = isHost ? 0 : 1;
  const isActivePlayer = !isOnline || game.currentTeamIndex === myTeamIndex;

  const activeScreen = game.screen !== SCREENS.HOME ? game.screen : localScreen;

  // ── Guest: receive host's game, then mirror whoever is active ──────────
  useEffect(() => {
    if (mode !== MODES.GUEST || !room.roomState) return;

    // Until the host starts, the room is an empty lobby — nothing to sync.
    if (game.deck.length === 0 && !room.roomState.deckIds?.length) return;

    // First sync after joining: build our copy of the host's exact deck.
    if (game.deck.length === 0 && room.roomState.deckIds?.length) {
      game.initGuestGame(
        room.roomState.teams.map((t) => t.name),
        room.roomState.targetScore ?? 10,
        room.roomState.selectedCategories ?? [],
        room.roomState.deckIds
      );
    }

    // Don't overwrite our own state while we're the one playing.
    if (game.currentTeamIndex === myTeamIndex && game.screen === SCREENS.PLAYING) return;

    game.syncFromRemote(room.roomState);
  }, [room.roomState]);

  // ── Host: mirror the guest while the guest is active ───────────────────
  useEffect(() => {
    if (mode !== MODES.HOST || !room.roomState) return;
    if (game.currentTeamIndex === myTeamIndex && game.screen === SCREENS.PLAYING) return;
    game.syncFromRemote(room.roomState);
  }, [room.roomState]);

  // ── Whoever is active pushes state up ──────────────────────────────────
  // wasActiveRef exists for the handoff moment: tapping "Next Team" flips
  // currentTeamIndex, which instantly makes this device INACTIVE — so a
  // plain isActivePlayer guard refuses to push the very state change that
  // hands the turn over. Firestore never learns about the handoff and both
  // devices sit on waiting screens forever. The device that just lost
  // active status gets exactly one more push to deliver the handoff.
  const wasActiveRef = useRef(false);
  useEffect(() => {
    if (!isOnline || !room.roomCode) return;
    if (game.screen === SCREENS.HOME) return;

    const shouldPush = isActivePlayer || wasActiveRef.current;
    wasActiveRef.current = isActivePlayer;
    if (!shouldPush) return;

    room.updateRoom({
      screen: game.screen,
      teams: game.teams,
      currentTeamIndex: game.currentTeamIndex,
      cardIndex: game.currentCardIndex,
      roundResults: game.roundResults,
      targetScore: game.targetScore,
      selectedCategories: game.selectedCategories,
      isTiebreak: game.isTiebreak,
    });
  }, [
    game.screen,
    game.teams,
    game.currentTeamIndex,
    game.currentCardIndex,
    game.roundResults,
    game.isTiebreak,
    isActivePlayer,
  ]);

  // ── Entry points ───────────────────────────────────────────────────────
  const goToSetup = (chosenMode) => {
    setPendingMode(chosenMode);
    setLocalScreen(SCREENS.SETUP);
  };

  // Create the room the moment "Create Room" is tapped, so the code is
  // visible on the setup screen and a friend can be typing it in while the
  // host is still picking categories. The room starts as an empty lobby;
  // the full game state lands in it when the host hits Start.
  const handleCreateRoomMode = async () => {
    goToSetup(MODES.HOST);
    if (!room.roomCode) await room.createRoom({ lobby: true });
  };

  const handleStartGame = async (teamNames, target, selectedCategories) => {
    const chosen = pendingMode ?? MODES.PASS;
    const deckIds = game.startGame(teamNames, target, selectedCategories, chosen);

    track('game_started', {
      categories: selectedCategories.length ? selectedCategories : ['All Categories'],
      targetScore: target,
      teamCount: chosen === MODES.SINGLE ? 1 : teamNames.length,
      mode: chosen,
    });

    // Offline modes are done — no room needed.
    if (chosen !== MODES.HOST) {
      setLocalScreen(SCREENS.HOME);
      return;
    }

    // Online host: the room already exists (created at mode selection) —
    // fill it with the game, including the deck order so the guest can
    // rebuild the identical deck.
    await room.updateRoom({
      lobby: false,
      screen: SCREENS.PASS_DEVICE,
      teams: teamNames.map((name) => ({ name, score: 0 })),
      currentTeamIndex: 0,
      cardIndex: 0,
      roundResults: [],
      targetScore: target,
      selectedCategories,
      deckIds,
      isTiebreak: false,
    });
    setLocalScreen(SCREENS.HOME);
  };

  const handleJoinRoom = async (code) => {
    const joined = await room.joinRoom(code);
    if (joined) {
      setPendingMode(MODES.GUEST);
      setLocalScreen('lobby'); // wait here until the host starts the game
    }
  };

  const handleReset = async () => {
    if (room.roomCode) await room.deleteRoom();
    game.resetGame();
    setPendingMode(null);
    setLocalScreen('room');
  };

  const otherTeamName = game.teams[game.currentTeamIndex]?.name;

  return (
    <>
      {room.roomCode && <RoomCodeBadge code={room.roomCode} />}

      {activeScreen === 'room' && (
        <RoomScreen
          onSinglePlayer={() => goToSetup(MODES.SINGLE)}
          onPassAndPlay={() => goToSetup(MODES.PASS)}
          onCreateRoom={handleCreateRoomMode}
          onJoinRoom={handleJoinRoom}
          error={room.error}
        />
      )}

      {activeScreen === 'lobby' && (
        <div className="guest-overlay">
          <div className="waiting-inner">
            <div className="waiting-icon">🔑</div>
            <h2>You're in!</h2>
            <p>Waiting for the host to start the game…</p>
          </div>
        </div>
      )}

      {activeScreen === SCREENS.SETUP && (
        <SetupScreen
          mode={pendingMode}
          roomCode={room.roomCode}
          onStart={handleStartGame}
          categories={categories}
          cardsLoading={cardsLoading}
        />
      )}

      {activeScreen === SCREENS.PASS_DEVICE &&
        (isActivePlayer ? (
          <PassDeviceScreen
            mode={mode}
            currentTeam={game.currentTeam}
            teams={game.teams}
            isTiebreak={game.isTiebreak}
            roomCode={room.roomCode}
            onReady={game.startTurn}
          />
        ) : (
          <WaitingOverlay teamName={otherTeamName} />
        ))}

      {activeScreen === SCREENS.PLAYING &&
        (isActivePlayer ? (
          <PlayingScreen
            currentCard={game.currentCard}
            timeLeft={game.timeLeft}
            turnDuration={game.TURN_DURATION}
            currentTeam={game.currentTeam}
            cardsRemaining={game.cardsRemaining}
            onCorrect={game.handleCorrect}
            onSkip={game.handleSkip}
            onPenalty={game.handlePenalty}
            onEndTurn={game.endTurn}
          />
        ) : (
          <WaitingOverlay teamName={otherTeamName} />
        ))}

      {activeScreen === SCREENS.ROUND_END && (
        <RoundEndScreen
          roundResults={game.roundResults}
          currentTeam={game.currentTeam}
          isSingle={game.isSingle}
          isTiebreak={game.isTiebreak}
          onConfirm={isActivePlayer ? game.confirmRoundResults : null}
          readOnly={!isActivePlayer}
        />
      )}

      {activeScreen === SCREENS.GAME_OVER && (
        <GameOverScreen
          teams={game.teams}
          targetScore={game.targetScore}
          isSingle={game.isSingle}
          onPlayAgain={handleReset}
        />
      )}
    </>
  );
}

export default function App() {
  if (isAdminRoute) return <AdminRoute />;
  return <GameApp />;
}