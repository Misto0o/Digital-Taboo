import React, { useState } from 'react';
import { useGameState, SCREENS } from './hooks/useGameState';
import HomeScreen from './components/HomeScreen';
import SetupScreen from './components/SetupScreen';
import PassDeviceScreen from './components/PassDeviceScreen';
import PlayingScreen from './components/PlayingScreen';
import RoundEndScreen from './components/RoundEndScreen';
import GameOverScreen from './components/GameOverScreen';
import './styles.css';

export default function App() {
  const game = useGameState();
  const [localScreen, setLocalScreen] = useState(SCREENS.HOME);

  // game.screen drives things once a game is active; localScreen handles pre-game nav
  const activeScreen = game.screen !== SCREENS.HOME ? game.screen : localScreen;

  const handleStartGame = (teamNames, target) => {
    game.startGame(teamNames, target);
    setLocalScreen(SCREENS.HOME);
  };

  const handleReset = () => {
    game.resetGame();
    setLocalScreen(SCREENS.HOME);
  };

  switch (activeScreen) {
    case SCREENS.HOME:
      return <HomeScreen onSetup={() => setLocalScreen(SCREENS.SETUP)} />;
    case SCREENS.SETUP:
      return <SetupScreen onStart={handleStartGame} />;
    case SCREENS.PASS_DEVICE:
      return (
        <PassDeviceScreen
          currentTeam={game.currentTeam}
          teams={game.teams}
          onReady={game.startTurn}
        />
      );
    case SCREENS.PLAYING:
      return (
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
      );
    case SCREENS.ROUND_END:
      return (
        <RoundEndScreen
          roundResults={game.roundResults}
          currentTeam={game.currentTeam}
          onConfirm={game.confirmRoundResults}
        />
      );
    case SCREENS.GAME_OVER:
      return (
        <GameOverScreen
          teams={game.teams}
          targetScore={game.targetScore}
          onPlayAgain={handleReset}
        />
      );
    default:
      return null;
  }
}
