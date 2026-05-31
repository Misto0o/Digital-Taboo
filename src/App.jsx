import React, { useState, useEffect } from 'react';
import { useGameState, SCREENS } from './hooks/useGameState';
import { useRoom } from './hooks/useRoom';
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

export default function App() {
  const game = useGameState();
  const room = useRoom();
  const { isHost } = room;
  const remoteTeamIndex = room.roomState?.currentTeamIndex ?? game.currentTeamIndex;
  const isActivePlayer = isHost
    ? remoteTeamIndex === 0
    : remoteTeamIndex === 1;
  const [localScreen, setLocalScreen] = useState('room');

  const activeScreen = game.screen !== SCREENS.HOME ? game.screen : localScreen;

  // guest always syncs screen from host, only syncs full state when it's NOT their turn
  useEffect(() => {
    if (!isHost && room.roomState) {
      const remoteIndex = room.roomState.currentTeamIndex ?? 0;
      const guestIsActive = remoteIndex === 1;

      if (!guestIsActive) {
        // host's turn — sync everything
        game.syncFromRemote(room.roomState);
      } else {
        // guest's turn — only sync the screen transition so they get unblocked
        if (room.roomState.screen) game.syncFromRemote({ screen: room.roomState.screen, currentTeamIndex: remoteIndex, teams: room.roomState.teams });
      }
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
        currentCardIndex: game.currentCardIndex ?? 0,
      });
    }
  }, [game.screen, game.teams, game.currentTeamIndex, game.roundResults, game.currentCardIndex]);

  // guest pushes state when it's their turn
  useEffect(() => {
    if (!isHost && room.roomCode && game.screen !== SCREENS.HOME && isActivePlayer) {
      room.updateRoom({
        screen: game.screen,
        teams: game.teams,
        currentTeamIndex: game.currentTeamIndex,
        roundResults: game.roundResults,
        currentCardIndex: game.currentCardIndex ?? 0,
      });
    }
  }, [game.screen, game.teams, game.currentTeamIndex, game.roundResults, game.currentCardIndex]);

  const handleCreateRoom = () => setLocalScreen(SCREENS.SETUP);

  const handleStartGame = async (teamNames, target) => {
    game.startGame(teamNames, target);
    const code = await room.createRoom({
      screen: SCREENS.PASS_DEVICE,
      teams: teamNames.map((name) => ({ name, score: 0 })),
      currentTeamIndex: 0,
      roundResults: [],
      currentCardIndex: 0,
    });
    setLocalScreen(SCREENS.HOME);
    alert(`Your room code is: ${code}\nShare this with your friend!`);
  };

  const handleJoinRoom = async (code) => {
    const joined = await room.joinRoom(code);
    if (joined) setLocalScreen(SCREENS.HOME);
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
        <SetupScreen onStart={handleStartGame} />
      )}

      {activeScreen === SCREENS.PASS_DEVICE && (
        isActivePlayer
          ? <PassDeviceScreen currentTeam={game.currentTeam} teams={game.teams} onReady={game.startTurn} />
          : <GuestOverlay />
      )}

      {activeScreen === SCREENS.PLAYING && (
        isActivePlayer
          ? <PlayingScreen
            currentCard={game.currentCard}
            timeLeft={game.timeLeft}
            turnDuration={game.TURN_DURATION}
            currentTeam={game.currentTeam}
            onCorrect={game.handleCorrect}
            onSkip={game.handleSkip}
            onPenalty={game.handlePenalty}
            onEndTurn={game.endTurn}
          />
          : <GuestOverlay />
      )}

      {activeScreen === SCREENS.ROUND_END && (
        isActivePlayer
          ? <RoundEndScreen roundResults={game.roundResults} currentTeam={game.currentTeam} onConfirm={game.confirmRoundResults} />
          : <RoundEndScreen roundResults={game.roundResults} currentTeam={game.currentTeam} onConfirm={null} readOnly />
      )}

      {activeScreen === SCREENS.GAME_OVER && (
        <GameOverScreen
          teams={game.teams}
          targetScore={game.targetScore}
          onPlayAgain={handleReset}
        />
      )}
    </>
  );
}