import React, { useState } from 'react';

export default function SetupScreen({ onStart }) {
  const [teamNames, setTeamNames] = useState(['Team 1', 'Team 2']);
  const [targetScore, setTargetScore] = useState(10);

  const updateTeam = (index, value) => {
    const updated = [...teamNames];
    updated[index] = value;
    setTeamNames(updated);
  };

  const handleStart = () => {
    const sanitized = teamNames.map((n) => n.trim() || `Team ${teamNames.indexOf(n) + 1}`);
    onStart(sanitized, targetScore);
  };

  return (
    <div className="screen setup-screen">
      <h2 className="screen-title">Game Setup</h2>

      <div className="setup-section">
        <label className="setup-label">Team Names</label>
        {teamNames.map((name, i) => (
          <input
            key={i}
            className="text-input"
            type="text"
            value={name}
            maxLength={20}
            onChange={(e) => updateTeam(i, e.target.value)}
            placeholder={`Team ${i + 1}`}
          />
        ))}
      </div>

      <div className="setup-section">
        <label className="setup-label">Points to Win</label>
        <div className="score-picker">
          {[5, 10, 15, 20].map((n) => (
            <button
              key={n}
              className={`score-btn ${targetScore === n ? 'active' : ''}`}
              onClick={() => setTargetScore(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <button className="btn btn-primary btn-xl" onClick={handleStart}>
        Start Game
      </button>
    </div>
  );
}
