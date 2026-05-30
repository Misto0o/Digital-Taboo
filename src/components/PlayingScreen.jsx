import React from 'react';

export default function PlayingScreen({
  currentCard,
  timeLeft,
  turnDuration,
  currentTeam,
  onCorrect,
  onSkip,
  onPenalty,
  onEndTurn,
}) {
  if (!currentCard) {
    return (
      <div className="screen playing-screen">
        <p className="no-cards">No more cards! Great job!</p>
        <button className="btn btn-primary" onClick={onEndTurn}>
          End Turn
        </button>
      </div>
    );
  }

  const timerPct = (timeLeft / turnDuration) * 100;
  const timerWarning = timeLeft <= 10;

  return (
    <div className="screen playing-screen">
      {/* Timer bar */}
      <div className="timer-bar-wrap">
        <div
          className={`timer-bar ${timerWarning ? 'warning' : ''}`}
          style={{ width: `${timerPct}%` }}
        />
      </div>

      <div className={`timer-display ${timerWarning ? 'warning' : ''}`}>
        {timeLeft}s — {currentTeam.name}
      </div>

      {/* Card */}
      <div className="card">
        <div className="card-safe-word">{currentCard.safeWord}</div>
        <div className="card-divider">
          <span>Can't Say</span>
        </div>
        <ul className="cant-say-list">
          {currentCard.cantSay.map((word, i) => (
            <li key={i}>{word.toUpperCase()}</li>
          ))}
        </ul>
      </div>

      {/* Action buttons */}
      <div className="action-buttons">
        <button className="btn btn-correct" onClick={onCorrect}>
          ✓ Correct
        </button>
        <button className="btn btn-skip" onClick={onSkip}>
          → Skip
        </button>
        <button className="btn btn-penalty" onClick={onPenalty}>
          ✗ Said It
        </button>
      </div>

      <button className="btn btn-ghost btn-sm end-turn-btn" onClick={onEndTurn}>
        End Turn Early
      </button>
    </div>
  );
}
