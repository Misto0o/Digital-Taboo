import React from 'react';
import { MODES } from '../hooks/useGameState';

export default function PassDeviceScreen({
  mode,
  currentTeam,
  teams,
  isTiebreak,
  roomCode,
  onReady,
}) {
  const isSingle = mode === MODES.SINGLE;
  const isPass = mode === MODES.PASS;
  const isHost = mode === MODES.HOST;

  if (isSingle) {
    return (
      <div className="screen pass-screen">
        <div className="pass-prompt">
          <div className="pass-icon">🎯</div>
          <h2>Ready?</h2>
          <div className="pass-team-name">Solo Challenge</div>
          <p className="pass-sub">
            You have <strong>60 seconds</strong>. Describe each safe word
            without saying any of the forbidden words.
          </p>
        </div>
        <button className="btn btn-primary btn-xl" onClick={onReady}>
          Start the Clock
        </button>
      </div>
    );
  }

  return (
    <div className="screen pass-screen">
      <div className="scoreboard">
        {teams.map((team, i) => (
          <div
            key={i}
            className={`score-chip ${team.name === currentTeam?.name ? 'active' : ''}`}
          >
            <span className="score-team">{team.name}</span>
            <span className="score-val">{team.score}</span>
          </div>
        ))}
      </div>

      {isTiebreak && (
        <div className="tiebreak-banner">
          <strong>Tiebreak Round</strong>
          <span>Scores are level at the top — play on until someone leads alone.</span>
        </div>
      )}

      <div className="pass-prompt">
        {/* Pass & Play is a physical handoff — make that unmistakable.
            Online play isn't; the other player is on their own device. */}
        <div className="pass-icon">{isPass ? '📱' : '🎮'}</div>
        <h2>{isPass ? 'Pass the device to' : 'Now playing'}</h2>
        <div className="pass-team-name">{currentTeam?.name}</div>

        {isPass && (
          <p className="pass-handoff">
            Hand the phone over before you tap start — whoever holds it gives
            the clues.
          </p>
        )}

        <p className="pass-sub">
          <strong>60 seconds</strong> to give clues to your teammates.
          <br />
          Don't say the Can't Say words!
        </p>
      </div>

      {isHost && roomCode && (
        <div className="room-share">
          <span className="room-share-label">Share this code to let someone join</span>
          <span className="room-share-code">{roomCode}</span>
        </div>
      )}

      <button className="btn btn-primary btn-xl" onClick={onReady}>
        {isPass ? "We're Ready — Start!" : 'Start My Turn'}
      </button>
    </div>
  );
}