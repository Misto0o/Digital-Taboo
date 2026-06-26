import React from 'react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import AdminLogin from './AdminLogin';
import AdminPanel from './AdminPanel';

export default function AdminRoute() {
  const { isLoggedIn, loading, error, signIn, signOut } = useAdminAuth();

  if (loading) {
    return (
      <div className="screen admin-screen">
        <p className="admin-empty">Loading…</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <AdminLogin onSignIn={signIn} error={error} />;
  }

  return <AdminPanel onSignOut={signOut} />;
}
