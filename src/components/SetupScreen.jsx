import React, { useState } from 'react';
import { MODES } from '../hooks/useGameState';

const MAX_TEAMS = 4;
const MIN_TEAMS = 2;

export default function SetupScreen({ mode, roomCode, onStart, categories, cardsLoading }) {
  const isSingle = mode === MODES.SINGLE;

  const [teamCount, setTeamCount] = useState(2);
  const [teamNames, setTeamNames] = useState(['Team 1', 'Team 2', 'Team 3', 'Team 4']);
  const [targetScore, setTargetScore] = useState(10);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const updateTeam = (index, value) => {
    const updated = [...teamNames];
    updated[index] = value;
    setTeamNames(updated);
  };

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleStart = () => {
    const active = teamNames
      .slice(0, teamCount)
      .map((n, i) => n.trim() || `Team ${i + 1}`);
    onStart(active, targetScore, selectedCategories);
  };

  const allSelected = selectedCategories.length === 0;

  return (
    <div className="screen setup-screen">
      <h2 className="screen-title">{isSingle ? 'Solo Challenge' : 'Game Setup'}</h2>

      {mode === MODES.HOST && roomCode && (
        <div className="room-share">
          <span className="room-share-label">Your friend can join now with this code</span>
          <span className="room-share-code">{roomCode}</span>
        </div>
      )}

      {isSingle && (
        <p className="setup-blurb">
          One 60-second turn. Get through as many cards as you can — every
          correct answer is a point, every slip costs you one.
        </p>
      )}

      {/* Online rooms are always 2 teams (one per device), and solo has no
          teams at all — so the team picker is only for Pass & Play. */}
      {mode === MODES.PASS && (
        <div className="setup-section">
          <label className="setup-label">How many teams?</label>
          <div className="score-picker">
            {Array.from({ length: MAX_TEAMS - MIN_TEAMS + 1 }, (_, i) => i + MIN_TEAMS).map((n) => (
              <button
                key={n}
                className={`score-btn ${teamCount === n ? 'active' : ''}`}
                onClick={() => setTeamCount(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {!isSingle && (
        <div className="setup-section">
          <label className="setup-label">Team Names</label>
          {teamNames.slice(0, mode === MODES.HOST ? 2 : teamCount).map((name, i) => (
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
      )}

      {!isSingle && (
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
      )}

      <div className="setup-section">
        <label className="setup-label">Categories</label>
        {cardsLoading ? (
          <p className="category-loading">Loading categories…</p>
        ) : (
          <div className="category-chips">
            <button
              className={`category-chip ${allSelected ? 'active' : ''}`}
              onClick={() => setSelectedCategories([])}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`category-chip ${selectedCategories.includes(cat) ? 'active' : ''}`}
                onClick={() => toggleCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      <button className="btn btn-primary btn-xl" onClick={handleStart} disabled={cardsLoading}>
        Start Game
      </button>
    </div>
  );
}