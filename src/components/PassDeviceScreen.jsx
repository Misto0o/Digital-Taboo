import React from 'react';

export default function PassDeviceScreen({ currentTeam, teams, onReady }) {
  return (
    <div className="screen pass-screen">
      <div className="scoreboard">
        {teams.map((team, i) => (
          <div key={i} className={`score-chip ${team.name === currentTeam.name ? 'active' : ''}`}>
            <span className="score-team">{team.name}</span>
            <span className="score-val">{team.score}</span>
          </div>
        ))}
      </div>

      <div className="pass-prompt">
        <div className="pass-icon">📱</div>
        <h2>Pass the device to</h2>
        <div className="pass-team-name">{currentTeam.name}</div>
        <p className="pass-sub">
          You'll have <strong>60 seconds</strong> to give clues to your teammates.
          <br />
          Don't say the Can't Say words!
        </p>
      </div>

      <button className="btn btn-primary btn-xl" onClick={onReady}>
        We're Ready — Start!
      </button>
    </div>
  );
}
