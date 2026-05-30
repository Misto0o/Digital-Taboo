import React from 'react';

export default function HomeScreen({ onSetup }) {
  return (
    <div className="screen home-screen">
      <div className="home-logo">
        <span className="logo-main">SAFE</span>
        <span className="logo-accent">WORD</span>
      </div>
      <p className="home-tagline">Say anything. Just not <em>those</em> words.</p>
      <button className="btn btn-primary btn-xl" onClick={onSetup}>
        New Game
      </button>
      <div className="home-rules">
        <h3>How to Play</h3>
        <ol>
          <li>Divide into teams</li>
          <li>Give clues to get your team to say the <strong>Safe Word</strong></li>
          <li>Avoid the <strong>Can't Say</strong> words — say one and lose a point</li>
          <li>Score the most points before time runs out!</li>
        </ol>
      </div>
    </div>
  );
}
