import React, { useState } from 'react';

export default function RoomScreen({
    onSinglePlayer,
    onPassAndPlay,
    onCreateRoom,
    onJoinRoom,
    error,
}) {
    const [joinCode, setJoinCode] = useState('');
    const [mode, setMode] = useState(null);

    if (!mode)
        return (
            <div className="screen room-screen">
                <div className="home-logo">
                    <span className="logo-main">SAFE</span>
                    <span className="logo-accent">WORD</span>
                    <div className="logo-rule" />
                    <div className="logo-subtitle">The Safety Game</div>
                </div>
                <p className="home-tagline">
                    Turning safety into a <em>team sport</em>
                </p>

                <div className="mode-list">
                    <button className="mode-btn primary" onClick={onPassAndPlay}>
                        <span className="mode-icon">👥</span>
                        <span className="mode-text">
                            <strong>Pass &amp; Play</strong>
                            <small>2–4 teams, one device</small>
                        </span>
                    </button>

                    <button className="mode-btn" onClick={onCreateRoom}>
                        <span className="mode-icon">📡</span>
                        <span className="mode-text">
                            <strong>Create Room</strong>
                            <small>Play across two devices</small>
                        </span>
                    </button>

                    <button className="mode-btn" onClick={() => setMode('join')}>
                        <span className="mode-icon">🔑</span>
                        <span className="mode-text">
                            <strong>Join Room</strong>
                            <small>Enter a friend's code</small>
                        </span>
                    </button>

                    <button className="mode-btn" onClick={onSinglePlayer}>
                        <span className="mode-icon">🎯</span>
                        <span className="mode-text">
                            <strong>Solo Challenge</strong>
                            <small>One minute, beat your high score</small>
                        </span>
                    </button>
                </div>

                <a className="footer-link" href="/privacy.html">
                    Privacy Policy
                </a>
            </div>
        );

    return (
        <div className="screen room-screen">
            <h2 className="screen-title">Join Room</h2>
            <p className="room-sub">Enter the 4-character code your friend shared.</p>
            <input
                className="text-input code-input"
                type="text"
                maxLength={4}
                placeholder="XXXX"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                autoCapitalize="characters"
                autoComplete="off"
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
        </div>
    );
}