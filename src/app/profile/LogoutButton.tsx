"use client";

import { logout } from "../actions";

export default function LogoutButton() {
  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  return (
    <button 
      onClick={handleLogout}
      className="card"
      style={{ 
        width: '100%', 
        marginTop: '2rem', 
        padding: '1rem', 
        color: 'var(--accent)', 
        fontWeight: 'bold', 
        border: 'none', 
        cursor: 'pointer',
        textAlign: 'center'
      }}
    >
      ログアウトして別のアカウントに切り替える
    </button>
  );
}
