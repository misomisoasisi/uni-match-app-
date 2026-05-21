"use client";

import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import RulesContent from '../RulesContent';

export default function HelpModalButton() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <button 
        onClick={() => setShowHelp(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '1rem',
          backgroundColor: 'var(--surface-light)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          cursor: 'pointer',
          width: '100%',
          justifyContent: 'center',
          color: 'var(--text-main)',
          fontSize: '1rem',
          fontWeight: 500,
          marginBottom: '1rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}
      >
        <HelpCircle size={20} color="var(--primary)" />
        ヘルプ・利用規約を見る
      </button>

      {showHelp && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', backgroundColor: '#ffffff', padding: '2rem', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <button onClick={() => setShowHelp(false)} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', color: 'var(--text-muted)' }}>
              <X />
            </button>
            <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', color: 'var(--text-main)' }}>ヘルプ・利用規約</h2>
            
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1.5rem' }}>
              <RulesContent />
            </div>
            
            <button className="primary-btn" style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }} onClick={() => setShowHelp(false)}>
              閉じる
            </button>
          </div>
        </div>
      )}
    </>
  );
}
