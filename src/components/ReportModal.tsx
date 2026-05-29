"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Flag, X, AlertTriangle } from "lucide-react";
import { reportUser } from "@/app/actions";

export default function ReportModal({ targetUserId, targetUserName }: { targetUserId: number, targetUserName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const reasons = [
    "スパム・宣伝目的",
    "嫌がらせ・誹謗中傷",
    "出会い目的（規約違反の過度なものなど）",
    "不適切なプロフィールや画像",
    "なりすまし",
    "その他"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) {
      alert("通報の理由を選択してください。");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await reportUser(targetUserId, selectedReason);
      if (res.error) {
        alert(res.error);
      } else {
        setSubmitted(true);
        setTimeout(() => {
          setIsOpen(false);
          setSubmitted(false);
          setSelectedReason("");
        }, 2000);
      }
    } catch (err) {
      alert("エラーが発生しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = isOpen && (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '450px', backgroundColor: '#ffffff', padding: '2rem', display: 'flex', flexDirection: 'column', position: 'relative', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
        <button onClick={() => setIsOpen(false)} style={{ position: 'absolute', top: '1.2rem', right: '1.2rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <X size={22} />
        </button>
        
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', marginBottom: '1rem' }}>
            <AlertTriangle size={28} />
          </div>
          <h2 style={{ color: 'var(--text-main)', fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>ユーザーの通報</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            <strong>{targetUserName}</strong> さんを運営に通報します。該当する理由を選択してください。
          </p>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: '#059669', fontWeight: 'bold' }}>
            通報を受け付けました。ご協力ありがとうございます。
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {reasons.map((reason) => (
                <label key={reason} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem 1rem', border: `1px solid ${selectedReason === reason ? 'var(--primary)' : 'var(--border)'}`, borderRadius: '12px', cursor: 'pointer', backgroundColor: selectedReason === reason ? 'rgba(37, 99, 235, 0.05)' : 'transparent', transition: 'all 0.2s' }}>
                  <input 
                    type="radio" 
                    name="reportReason" 
                    value={reason} 
                    checked={selectedReason === reason} 
                    onChange={(e) => setSelectedReason(e.target.value)}
                    style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--primary)' }}
                  />
                  <span style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: selectedReason === reason ? 600 : 400 }}>{reason}</span>
                </label>
              ))}
            </div>
            
            <button 
              type="submit" 
              className="primary-btn" 
              style={{ width: '100%', justifyContent: 'center', padding: '1rem', borderRadius: '12px', backgroundColor: '#ef4444', opacity: isSubmitting ? 0.7 : 1 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? '送信中...' : '通報を送信する'}
            </button>
          </form>
        )}
      </div>
    </div>
  );

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', cursor: 'pointer', transition: 'color 0.2s' }}
        onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
        onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        <Flag size={14} /> 通報
      </button>

      {mounted && typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null}
    </>
  );
}
