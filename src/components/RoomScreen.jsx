import React, { useState } from 'react';

export default function RoomScreen({ onCreateRoom, onJoinRoom, onSoloPlay, error }) {
    const [joinCode, setJoinCode] = useState('');
    const [mode, setMode] = useState(null);

    if (!mode) return (
        <div className="screen room-screen">
            <div className="home-logo">
                <span className="logo-main">SAFE</span>
                <span className="logo-accent">WORD</span>
            </div>
            <p className="home-tagline">Play with friends <em>anywhere</em></p>
            <button className="btn btn-primary btn-xl" onClick={() => setMode('create')}>
                Create Room
            </button>
            <button className="btn btn-ghost btn-xl" onClick={() => setMode('join')}>
                Join Room
            </button>
            <button className="btn btn-ghost btn-xl" onClick={onSoloPlay}>
                🎮 Play Solo / Same Device
            </button>
        </div>
    );

    if (mode === 'create') return (
        <div className="screen room-screen">
            <h2 className="screen-title">Create Room</h2>
            <p className="room-sub">You'll get a code to share with your friend after setup.</p>
            <button className="btn btn-primary btn-xl" onClick={onCreateRoom}>
                Continue to Setup →
            </button>
            <button className="btn btn-ghost" onClick={() => setMode(null)}>
                Back
            </button>
        </div>
    );

    if (mode === 'join') return (
        <div className="screen room-screen">
            <h2 className="screen-title">Join Room</h2>
            <p className="room-sub">Enter the 4-letter code your friend shared.</p>
            <input
                className="text-input code-input"
                type="text"
                maxLength={4}
                placeholder="XXXX"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                autoCapitalize="characters"
            />
            {error && <p className="room-error">{error}</p>}
            <button
                className="btn btn-primary btn-xl"
                onClick={() => onJoinRoom(joinCode)}
                disabled={joinCode.length < 4}
            >
                Join Game
            </button>
            <button className="btn btn-ghost" onClick={() => setMode(null)}>
                Back
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