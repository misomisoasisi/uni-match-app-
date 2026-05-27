"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, QrCode, RefreshCw } from 'lucide-react';
import { generateMeetToken } from '../actions';

interface MeetQrModalProps {
  userId: number;
  onClose: () => void;
}

export default function MeetQrModal({ userId, onClose }: MeetQrModalProps) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(30);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchToken = async () => {
    setLoading(true);
    try {
      const newToken = await generateMeetToken();
      setToken(newToken);
      setCountdown(30);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // 初期読み込みと、30秒カウントダウンのリフレッシュ
  useEffect(() => {
    fetchToken();
  }, []);

  useEffect(() => {
    if (loading) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          fetchToken();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading]);

  if (!mounted) return null;

  // 動的なQRコードURLの生成（ローカルIPや本番ドメインに自動で追従）
  const meetUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/meet/${userId}?token=${token || ''}`
    : '';

  const qrImageUrl = token
    ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(meetUrl)}`
    : '';

  const modalContent = (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="card" style={{ 
        width: '100%', 
        maxWidth: '450px', 
        backgroundColor: '#ffffff', 
        padding: '2rem', 
        borderRadius: '24px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        position: 'relative',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        {/* Close Button */}
        <button 
          onClick={onClose} 
          style={{ 
            position: 'absolute', 
            top: '1rem', 
            right: '1rem', 
            background: 'rgba(0,0,0,0.05)', 
            border: 'none', 
            cursor: 'pointer', 
            padding: '0.5rem', 
            color: 'var(--text-muted)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'}
        >
          <X size={20} />
        </button>

        {/* Title */}
        <h2 style={{ 
          marginBottom: '0.5rem', 
          color: 'var(--text-main)', 
          fontSize: '1.4rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          fontWeight: 700 
        }}>
          <QrCode color="var(--primary)" /> 出会いを記録する
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', marginBottom: '1.5rem', lineHeight: '1.5' }}>
          対面しているお友達のスマートフォンの<br /><strong>「標準カメラアプリ」</strong>でこのQRコードを読み取ってもらってください。
        </p>

        {/* QR Code Container */}
        <div style={{ 
          position: 'relative', 
          width: '230px', 
          height: '230px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
          border: '2px solid var(--border)',
          borderRadius: '16px',
          padding: '10px',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'
        }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <RefreshCw className="animate-spin" size={32} style={{ animation: 'spin 1.5s linear infinite' }} />
              <span style={{ fontSize: '0.8rem' }}>生成中...</span>
            </div>
          ) : qrImageUrl ? (
            <img src={qrImageUrl} alt="Meet QR Code" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : null}
        </div>

        {/* Refresh Timer and Manual Button */}
        <div style={{ marginTop: '1.5rem', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
          {/* Progress Bar Timer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '80%' }}>
            <div style={{ flex: 1, height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', 
                backgroundColor: countdown < 10 ? '#ef4444' : 'var(--primary)', 
                width: `${(countdown / 30) * 100}%`,
                transition: 'width 1s linear, background-color 0.3s'
              }} />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace', fontWeight: 'bold' }}>
              {countdown}秒
            </span>
          </div>

          <button 
            className="secondary-btn" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.3rem', 
              fontSize: '0.85rem',
              padding: '0.5rem 1rem',
              borderRadius: '20px'
            }}
            onClick={fetchToken}
            disabled={loading}
          >
            <RefreshCw size={14} /> 手動で更新
          </button>
        </div>

        {/* Footer Alert */}
        <div style={{ 
          marginTop: '1.5rem', 
          padding: '0.8rem 1rem', 
          backgroundColor: '#f0fdf4', 
          border: '1px solid #bbf7d0', 
          borderRadius: '12px',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <p style={{ fontSize: '0.8rem', color: '#166534', margin: 0, textAlign: 'center', fontWeight: '500' }}>
            🔒 不正防止のため、QRコードは自動で使い捨て・定期リフレッシュされます。
          </p>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
