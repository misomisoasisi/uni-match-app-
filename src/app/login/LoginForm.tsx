"use client";

import { useState } from "react";
import { loginWithEmail, loginAsGuest } from "../actions";
import Link from "next/link";

export default function LoginForm() {
  const [formData, setFormData] = useState({ email: '', pass: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.pass) {
      setError('メールアドレスとパスワードを入力してください。');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const redirectTo = searchParams.get('redirectTo') || '/';
      
      const res = await loginWithEmail(formData.email, formData.pass);
      if (res && res.error) {
        setError(res.error);
        setLoading(false);
      } else {
        window.location.href = redirectTo;
      }
    } catch (err) {
      console.error(err);
      setError('ログイン中にエラーが発生しました。時間を置いて再度お試しください。');
      setLoading(false);
    }
  };
 
  const handleGuestLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const redirectTo = searchParams.get('redirectTo') || '/';

      const res = await loginAsGuest();
      if (res && res.success) {
        window.location.href = redirectTo;
      } else {
        setError('ゲストログインに失敗しました。');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('接続エラーが発生しました。通信環境を確認してください。');
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
      <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>うにばーしてぃ</h1>
      <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>ログイン</p>
      
      <form className="card" style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem' }}>
        {error && <div style={{ color: 'red', fontSize: '0.9rem', marginBottom: '1rem' }}>{error}</div>}

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>メールアドレス</label>
          <input 
            type="email" 
            name="email"
            className="input-field" 
            value={formData.email} 
            onChange={e => setFormData({...formData, email: e.target.value})} 
            placeholder="example@univ.ac.jp"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>パスワード</label>
          <input 
            type="password" 
            name="pass"
            className="input-field" 
            value={formData.pass} 
            onChange={e => setFormData({...formData, pass: e.target.value})} 
            placeholder="パスワードを入力"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit(e);
            }}
          />
        </div>

        <button 
          type="button" 
          onClick={handleSubmit}
          className="primary-btn" 
          disabled={loading} 
          style={{ marginTop: '1rem', justifyContent: 'center' }}
        >
          {loading ? 'ログイン中...' : 'ログイン'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', margin: '0.5rem 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }}></div>
          <span style={{ padding: '0 1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>または</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }}></div>
        </div>

        <button 
          type="button" 
          onClick={handleGuestLogin}
          disabled={loading} 
          style={{ 
            padding: '0.8rem', 
            borderRadius: '8px', 
            border: '1px solid var(--border)', 
            backgroundColor: 'var(--surface)', 
            color: 'var(--text)', 
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'ログイン中...' : 'ゲストとしてお試しログイン'}
        </button>

        <p style={{ marginTop: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>
          アカウントをお持ちでないですか？ <Link href="/signup" style={{ color: 'var(--primary)', textDecoration: 'none' }}>新規登録</Link>
        </p>

        <div style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
          <strong>【テスト用アカウント】</strong><br/>
          takuya@example.com (pass: password123)<br/>
          saki@example.com (pass: password123)
        </div>
      </form>
    </div>
  );
}
