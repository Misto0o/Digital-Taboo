import React from 'react';

export default function GameOverScreen({ teams, targetScore, isSingle, onPlayAgain }) {
  // Solo has no opponent — show the run, not a podium.
  if (isSingle) {
    const score = teams[0]?.score ?? 0;
    return (
      <div className="screen game-over-screen">
        <div className="winner-badge">🎯</div>
        <h2 className="winner-label">Final Score</h2>
        <div className="winner-name">{score}</div>
        <p className="solo-result-sub">
          {score >= 15
            ? 'Outstanding — that is a serious round.'
            : score >= 10
            ? 'Strong run. See if you can beat it.'
            : score >= 5
            ? 'Solid start — try another category next time.'
            : 'Warm-up done. Go again and beat it.'}
        </p>
        <button className="btn btn-primary btn-xl" onClick={onPlayAgain}>
          Play Again
        </button>
      </div>
    );
  }

  const ranked = [...teams].sort((a, b) => b.score - a.score);
  const topScore = ranked[0]?.score ?? 0;
  const leaders = ranked.filter((t) => t.score === topScore);

  // A game can end level: the tiebreak round only triggers when someone has
  // actually reached the target score, so a game that ends because the deck
  // ran out can finish tied. Sorting and taking first place would crown
  // whichever team happened to sort first, which is just wrong.
  const isDraw = leaders.length > 1;
  const winner = isDraw ? null : ranked[0];

  if (isDraw) {
    return (
      <div className="screen game-over-screen">
        <div className="winner-badge">🤝</div>
        <h2 className="winner-label">It's a Draw</h2>
        <div className="winner-name">{topScore} pts each</div>
        <div className="final-scores">
          {ranked.map((team, i) => (
            <div
              key={i}
              className={`final-score-row ${team.score === topScore ? 'winner' : ''}`}
            >
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

  return (
    <div className="screen game-over-screen">
      <div className="winner-badge">🏆</div>
      <h2 className="winner-label">Winner!</h2>
      <div className="winner-name">{winner?.name}</div>
      <div className="final-scores">
        {ranked.map((team, i) => (
          <div
            key={i}
            className={`final-score-row ${team.name === winner?.name ? 'winner' : ''}`}
          >
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