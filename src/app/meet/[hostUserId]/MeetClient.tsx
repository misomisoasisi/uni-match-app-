"use client";

import React, { useState, useEffect } from 'react';
import { recordMeet } from '../../actions';
import { CheckCircle2, AlertTriangle, Loader2, Award, Home } from 'lucide-react';

interface MeetClientProps {
  hostUserId: number;
  hostName: string;
  token: string;
  currentUserId: number;
}

export default function MeetClient({ hostUserId, hostName, token, currentUserId }: MeetClientProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [newTrophy, setNewTrophy] = useState<string | null>(null);
  const [isFirstMeet, setIsFirstMeet] = useState(false);

  useEffect(() => {
    let active = true;

    const processMeet = async () => {
      try {
        const result = await recordMeet(token, hostUserId);
        if (!active) return;

        if (result.error) {
          setStatus('error');
          setErrorMessage(result.error);
        } else {
          setStatus('success');
          setIsFirstMeet(result.isFirstMeet || false);
          if (result.newTrophy) {
            setNewTrophy(result.newTrophy);
          }
        }
      } catch (e) {
        if (!active) return;
        setStatus('error');
        setErrorMessage('通信中にエラーが発生しました。インターネット接続を確認し、再度スキャンしてください。');
      }
    };

    processMeet();

    return () => {
      active = false;
    };
  }, [hostUserId, token]);

  // 紙吹雪（Confetti）の生成
  const [confettis, setConfettis] = useState<any[]>([]);
  useEffect(() => {
    if (status === 'success') {
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444', '#06b6d4'];
      const generated = Array.from({ length: 80 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 2}s`,
        duration: `${Math.random() * 2.5 + 1.5}s`,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: `${Math.random() * 10 + 6}px`,
        rotation: `${Math.random() * 360}deg`,
        shape: Math.random() > 0.5 ? '50%' : '0%' // 円か四角
      }));
      setConfettis(generated);
    }
  }, [status]);

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '85vh', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      {/* Paper Confetti Style */}
      {status === 'success' && (
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes fall {
            0% {
              transform: translateY(-20px) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(90vh) rotate(720deg);
              opacity: 0;
            }
          }
          .confetti-piece {
            position: absolute;
            top: -20px;
            z-index: 100;
            animation: fall linear forwards;
          }
        `}} />
      )}

      {/* Confetti Pieces */}
      {status === 'success' && confettis.map(c => (
        <div 
          key={c.id} 
          className="confetti-piece"
          style={{
            left: c.left,
            animationDelay: c.delay,
            animationDuration: c.duration,
            backgroundColor: c.color,
            width: c.size,
            height: c.size,
            borderRadius: c.shape,
            transform: `rotate(${c.rotation})`
          }}
        />
      ))}

      {/* Loading View */}
      {status === 'loading' && (
        <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '3rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <Loader2 className="animate-spin" size={48} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
          <h2 style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>出会いを記録しています</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
            サーバーと通信中です。そのまましばらくお待ちください。
          </p>
        </div>
      )}

      {/* Error View */}
      {status === 'error' && (
        <div className="card" style={{ 
          maxWidth: '400px', 
          width: '100%', 
          padding: '2.5rem 2rem', 
          textAlign: 'center', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          gap: '1.2rem',
          borderTop: '5px solid #ef4444' 
        }}>
          <div style={{ backgroundColor: '#fee2e2', padding: '1rem', borderRadius: '50%', display: 'inline-flex' }}>
            <AlertTriangle size={40} color="#ef4444" />
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#b91c1c', margin: 0 }}>記録に失敗しました</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
            {errorMessage}
          </p>
          <a href="/" className="primary-btn" style={{ justifyContent: 'center', width: '100%', marginTop: '0.8rem' }}>
            <Home size={18} /> ホームへ戻る
          </a>
        </div>
      )}

      {/* Success View */}
      {status === 'success' && (
        <div className="card" style={{ 
          maxWidth: '450px', 
          width: '100%', 
          padding: '3rem 2rem', 
          textAlign: 'center', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          gap: '1.5rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          position: 'relative',
          zIndex: 10,
          animation: 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}>
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes fadeUp {
              0% { transform: translateY(20px); opacity: 0; }
              100% { transform: translateY(0); opacity: 1; }
            }
            @keyframes pulseGold {
              0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.5); }
              70% { box-shadow: 0 0 0 15px rgba(245, 158, 11, 0); }
              100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
            }
          `}} />

          {/* Shake emoji and Icon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '3.5rem', display: 'inline-block', animation: 'wiggle 2.5s infinite' }}>🤝</span>
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes wiggle {
                0%, 100% { transform: rotate(0); }
                15% { transform: rotate(-10deg); }
                30% { transform: rotate(10deg); }
                45% { transform: rotate(-5deg); }
                60% { transform: rotate(5deg); }
                75% { transform: rotate(0); }
              }
            `}} />
          </div>

          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>出会いを記録しました！</h2>
            <p style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '1.05rem', margin: 0 }}>
              {hostName} さん 🤝 あなた
            </p>
          </div>

          <div style={{ 
            backgroundColor: 'var(--surface-light)', 
            border: '1px solid var(--border)', 
            borderRadius: '16px', 
            padding: '1.2rem', 
            width: '100%', 
            boxSizing: 'border-box',
            fontSize: '0.9rem',
            color: 'var(--text-muted)',
            lineHeight: 1.6
          }}>
            {isFirstMeet ? (
              <span>対面での出会い実績が記録されました！お互いのマイページの「出会った人数」に反映されています。</span>
            ) : (
              <span>すでに一度出会ったことのあるお友達です！対面の記録を再度同期しました。</span>
            )}
          </div>

          {/* Trophy Release Effect */}
          {newTrophy && (
            <div style={{
              width: '100%',
              backgroundColor: '#fffbeb',
              border: '2px solid #f59e0b',
              borderRadius: '20px',
              padding: '1.5rem 1rem',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.8rem',
              animation: 'pulseGold 2s infinite',
              marginTop: '0.5rem'
            }}>
              <Award size={48} color="#f59e0b" style={{ filter: 'drop-shadow(0 4px 6px rgba(245,158,11,0.2))' }} />
              <div>
                <div style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🏆 トロフィー実績 解除！</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#78350f', marginTop: '0.2rem' }}>
                  {newTrophy}
                </div>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#b45309', margin: 0 }}>
                新しく称号を獲得しました！マイページの実績に反映されています。
              </p>
            </div>
          )}

          <a href="/" className="primary-btn" style={{ justifyContent: 'center', width: '100%', padding: '1rem', fontSize: '1.05rem', marginTop: '0.5rem' }}>
            ホームへ戻る
          </a>
        </div>
      )}
    </div>
  );
}
