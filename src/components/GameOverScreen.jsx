import React from 'react';

export default function GameOverScreen({ teams, targetScore, onPlayAgain }) {
  const winner = [...teams].sort((a, b) => b.score - a.score)[0];
  return (
    <div className="screen game-over-screen">
      <div className="winner-badge">🏆</div>
      <h2 className="winner-label">Winner!</h2>
      <div className="winner-name">{winner.name}</div>
      <div className="final-scores">
        {[...teams]
          .sort((a, b) => b.score - a.score)
          .map((team, i) => (
            <div key={i} className={`final-score-row ${team.name === winner.name ? 'winner' : ''}`}>
              <span className="final-team">{team.name}</span>
              <span className="final-pts">{team.score} pts</span>
            </div>
          ))}
      </div>
      <button className="btn btn-primary btn-xl" onClick={onPlayAgain}>
        Play Again
      </button>
    </div>
  );
}
