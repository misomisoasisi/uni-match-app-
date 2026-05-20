"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Search, Plus, BookOpen, User, MessageSquare, X } from "lucide-react";
import { createTextbook, createOrGetChatRoom } from "../actions";
import { useRouter } from "next/navigation";

export default function TextbookMarket({ textbooks, currentUserId }: { textbooks: any[], currentUserId: number }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', className: '', price: '', note: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleListTextbook = async () => {
    if (!formData.title || !formData.className) return;
    setIsSubmitting(true);
    await createTextbook(currentUserId, formData);
    setShowModal(false);
    setFormData({ title: '', className: '', price: '', note: '' });
    setIsSubmitting(false);
  };

  const handleNegotiate = async (textbook: any) => {
    if (textbook.sellerId === currentUserId) {
      alert("自分の出品した教科書です");
      return;
    }
    const roomId = await createOrGetChatRoom(currentUserId, textbook.sellerId, textbook.id);
    router.push(`/chat/${roomId}`);
  };

  return (
    <>
      <div className="action-bar">
        <div className="search-box">
          <Search />
          <input type="text" placeholder="授業名や教科書名で検索..." />
        </div>
        <button className="primary-btn" onClick={() => setShowModal(true)}><Plus /> 出品する</button>
      </div>

      <div className="textbook-grid">
        {textbooks.map(tb => (
          <div className="card textbook-card" key={tb.id}>
            <div className="card-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(56, 189, 248, 0.1)', height: '120px', borderRadius: '8px' }}>
              <BookOpen style={{ width: '48px', height: '48px', color: 'var(--primary)' }} />
            </div>
            <h3 style={{ marginTop: '0.8rem' }}>{tb.title}</h3>
            <div className="item-meta" style={{ marginTop: '0.5rem' }}>授業: {tb.className}</div>
            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', flexGrow: 1 }}>{tb.note}</p>
            <div className="card-footer" style={{ marginTop: '1rem', paddingTop: '0.8rem', borderTop: '1px solid var(--border)' }}>
              <div className="item-meta" style={{ margin: 0 }}>
                <User size={14} /> {tb.seller.name}
              </div>
              <div className={tb.price === '無料譲渡' ? 'free-tag' : 'price-tag'}>{tb.price}</div>
            </div>
            <button 
              className="primary-btn" 
              style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', background: tb.sellerId === currentUserId ? 'var(--surface-dark)' : 'var(--primary)', color: tb.sellerId === currentUserId ? 'var(--text-muted)' : 'white' }}
              onClick={() => handleNegotiate(tb)}
            >
              <MessageSquare /> {tb.sellerId === currentUserId ? '自分の出品' : '交渉する'}
            </button>
          </div>
        ))}
      </div>

      {showModal && mounted && createPortal(
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', zIndex: 10, padding: '0.5rem' }}>
              <X />
            </button>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', paddingRight: '2rem' }}><BookOpen /> 新しく出品する</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>教科書名</label>
                <input type="text" className="form-input" placeholder="例: マクロ経済学 第3版" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="form-group">
                <label>対象の授業名</label>
                <input type="text" className="form-input" placeholder="例: 経済学基礎A" value={formData.className} onChange={e => setFormData({...formData, className: e.target.value})} />
              </div>
              <div className="form-group">
                <label>価格（または無料）</label>
                <input type="text" className="form-input" placeholder="例: ¥1,500 または 無料譲渡" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              </div>
              <div className="form-group">
                <label>ひとことメモ・状態</label>
                <textarea className="form-input" rows={3} placeholder="例: 少し書き込みがありますが綺麗です。" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})}></textarea>
              </div>
              
              <button className="primary-btn" style={{ justifyContent: 'center', marginTop: '1rem', padding: '1rem', fontSize: '1.1rem' }} onClick={handleListTextbook} disabled={isSubmitting}>
                {isSubmitting ? '登録中...' : '出品を完了する'}
              </button>
            </div>
          </div>
        </div>,
        document.getElementById('app-main')!
      )}
    </>
  );
}
