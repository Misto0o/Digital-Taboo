import React, { useState, useEffect } from 'react';
import { useGameState, SCREENS } from './hooks/useGameState';
import { useRoom } from './hooks/useRoom';
import { useCards } from './hooks/useCards';
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

function GuestOverlay() {
  return (
    <div className="guest-overlay">
      <p>⏳ Waiting for host...</p>
    </div>
  );
}

// Simple client-side routing: visiting /admin shows the card manager
// instead of the game. No router library needed for one extra route.
// This check happens once at module scope (the pathname doesn't change
// during a page's lifetime), so it's safe to use to pick which component
// tree mounts, without violating Rules of Hooks inside either one.
const isAdminRoute = typeof window !== 'undefined' && window.location.pathname === '/admin';

function GameApp() {
  const { categories, loading: cardsLoading, buildDeck } = useCards();
  const game = useGameState(buildDeck);
  const room = useRoom();
  const { isHost } = room;
  const remoteTeamIndex = room.roomState?.currentTeamIndex ?? game.currentTeamIndex;
  const isLocalOnly = !room.roomCode;
  const isActivePlayer = room.roomState?.activePlayer === (isHost ? 'host' : 'guest');
  const [localScreen, setLocalScreen] = useState('room');

  const activeScreen = game.screen !== SCREENS.HOME ? game.screen : localScreen;

  useEffect(() => {
    if (!isHost && room.roomState) {
      const guestIsActive = room.roomState.activePlayer === 'guest';

      // init deck on first join if needed
      if (game.deck?.length === 0 && room.roomState.teams) {
        game.initGuestGame(
          room.roomState.teams.map((t) => t.name),
          room.roomState.targetScore ?? 10,
          room.roomState.selectedCategories ?? []
        );
      }

      // if it's the guest's turn, don't sync anything — they drive their own state
      if (guestIsActive) return;

      // only sync when host is active
      game.syncFromRemote(room.roomState);
    }
  }, [room.roomState]);

  // host pushes state to Firestore
  useEffect(() => {
    if (isHost && room.roomCode && game.screen !== SCREENS.HOME) {
      room.updateRoom({
        screen: game.screen,
        teams: game.teams,
        currentTeamIndex: game.currentTeamIndex,
        roundResults: game.roundResults,
        hostCardIndex: game.currentCardIndex ?? 0,
        targetScore: game.targetScore,
        selectedCategories: game.selectedCategories,
        activePlayer: game.currentTeamIndex === 0 ? 'host' : 'guest',
      });
    }
  }, [game.screen, game.teams, game.currentTeamIndex, game.roundResults, game.currentCardIndex]);

  // host watches for game over pushed by guest
  useEffect(() => {
    if (isHost && room.roomState?.screen === SCREENS.GAME_OVER) {
      game.syncFromRemote({
        screen: SCREENS.GAME_OVER,
        teams: room.roomState.teams,
      });
    }
  }, [room.roomState?.screen]);

  // guest pushes state when it's their turn
  useEffect(() => {
    if (!isHost && room.roomCode && game.screen !== SCREENS.HOME && isActivePlayer) {
      const timeout = setTimeout(() => {
        room.updateRoom({
          screen: game.screen,
          teams: game.teams,
          currentTeamIndex: game.currentTeamIndex,
          roundResults: game.roundResults,
          guestCardIndex: game.currentCardIndex ?? 0,
          targetScore: game.targetScore,
          selectedCategories: game.selectedCategories,
          activePlayer: game.currentTeamIndex === 0 ? 'host' : 'guest',
        });
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [game.screen, game.teams, game.currentTeamIndex, game.roundResults, game.currentCardIndex]);

  const handleCreateRoom = () => setLocalScreen(SCREENS.SETUP);

  const handleStartGame = async (teamNames, target, selectedCategories) => {
    game.startGame(teamNames, target, selectedCategories);
    const code = await room.createRoom({
      screen: SCREENS.PASS_DEVICE,
      teams: teamNames.map((name) => ({ name, score: 0 })),
      currentTeamIndex: 0,
      roundResults: [],
      currentCardIndex: 0,
      targetScore: target,
      selectedCategories,
      activePlayer: 'host', // team 1 always goes first
    });
    setLocalScreen(SCREENS.HOME);
    alert(`Your room code is: ${code}\nShare this with your friend!`);
  };

  const handleJoinRoom = async (code) => {
    const joined = await room.joinRoom(code);
    if (joined) {
      // guest needs their own deck and game initialized
      // we'll get team names from Firestore on first sync
      setLocalScreen(SCREENS.HOME);
    }
  };
  const handleReset = async () => {
    await room.deleteRoom();
    game.resetGame();
    setLocalScreen('room');
  };

  return (
    <>
      {room.roomCode && <RoomCodeBadge code={room.roomCode} />}

      {activeScreen === 'room' && (
        <RoomScreen
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          error={room.error}
        />
      )}

      {activeScreen === SCREENS.SETUP && (
        <SetupScreen
          onStart={handleStartGame}
          categories={categories}
          cardsLoading={cardsLoading}
        />
      )}

      {activeScreen === SCREENS.PASS_DEVICE &&
        (isActivePlayer ? (
          <PassDeviceScreen currentTeam={game.currentTeam} teams={game.teams} onReady={game.startTurn} />
        ) : (
          <GuestOverlay />
        ))}

      {activeScreen === SCREENS.PLAYING &&
        (isActivePlayer ? (
          <PlayingScreen
            currentCard={game.currentCard}
            timeLeft={game.timeLeft}
            turnDuration={game.TURN_DURATION}
            currentTeam={game.currentTeam}
            onCorrect={game.handleCorrect}
            onSkip={game.handleSkip}
            onPenalty={game.handlePenalty}
            onEndTurn={game.endTurn}
          />
        ) : (
          <GuestOverlay />
        ))}

      {activeScreen === SCREENS.ROUND_END &&
        (isActivePlayer ? (
          <RoundEndScreen
            roundResults={game.roundResults}
            currentTeam={game.currentTeam}
            onConfirm={game.confirmRoundResults}
          />
        ) : (
          <RoundEndScreen
            roundResults={game.roundResults}
            currentTeam={game.currentTeam}
            onConfirm={null}
            readOnly
          />
        ))}

      {activeScreen === SCREENS.GAME_OVER && (
        <GameOverScreen teams={game.teams} targetScore={game.targetScore} onPlayAgain={handleReset} />
      )}
    </>
  );
}

export default function App() {
  // No hooks here — just picks which tree to mount. GameApp and AdminRoute
  // each own their own hooks internally, so neither violates Rules of Hooks.
  if (isAdminRoute) {
    return <AdminRoute />;
  }
  return <GameApp />;
}
