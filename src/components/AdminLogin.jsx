import React, { useState } from 'react';

export default function AdminLogin({ onSignIn, error }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onSignIn(email, password);
    setSubmitting(false);
  };

  return (
    <div className="screen admin-screen">
      <div className="home-logo">
        <span className="logo-main">SAFE</span>
        <span className="logo-accent">WORD</span>
      </div>
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <label className="setup-label">Admin Login</label>
        <input
          className="text-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          required
        />
        <input
          className="text-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
        {error && <p className="admin-error">{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
