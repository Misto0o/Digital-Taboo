import React from 'react';

export default function RoundEndScreen({ roundResults, currentTeam, onConfirm, readOnly }) {
  const correct = roundResults.filter((r) => r.result === 'correct').length;
  const skipped = roundResults.filter((r) => r.result === 'skip').length;
  const penalties = roundResults.filter((r) => r.result === 'penalty').length;
  const net = correct - penalties;

  return (
    <div className="screen round-end-screen">
      <h2 className="screen-title">Time's Up!</h2>
      <div className="round-team">{currentTeam.name}</div>

      <div className="round-stats">
        <div className="stat correct">
          <span className="stat-num">{correct}</span>
          <span className="stat-label">Correct</span>
        </div>
        <div className="stat skip">
          <span className="stat-num">{skipped}</span>
          <span className="stat-label">Skipped</span>
        </div>
        <div className="stat penalty">
          <span className="stat-num">{penalties}</span>
          <span className="stat-label">Penalties</span>
        </div>
      </div>

      <div className="net-points">
        <span className={net >= 0 ? 'positive' : 'negative'}>
          {net >= 0 ? '+' : ''}{net} points
        </span>
        <span className="net-label">this round</span>
      </div>

      {roundResults.length > 0 && (
        <div className="results-list">
          {roundResults.map((r, i) => (
            <div key={i} className={`result-row ${r.result}`}>
              <span className="result-icon">
                {r.result === 'correct' ? '✓' : r.result === 'skip' ? '→' : '✗'}
              </span>
              <span className="result-word">{r.card.safeWord}</span>
            </div>
          ))}
        </div>
      )}

      {!readOnly && (
        <button className="btn btn-primary btn-xl" onClick={onConfirm}>
          Next Team →
        </button>
      )}
      {readOnly && (
        <p className="guest-waiting">⏳ Waiting for host to continue...</p>
      )}
    </div>
  );
}
