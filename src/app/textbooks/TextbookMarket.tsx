"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Search, Plus, BookOpen, User, MessageSquare, X } from "lucide-react";
import { createTextbook, createOrGetChatRoom, deleteTextbook } from "../actions";
import { useRouter } from "next/navigation";

export default function TextbookMarket({ textbooks, currentUserId }: { textbooks: any[], currentUserId: number }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', className: '', price: '', note: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // 検索と削除の状態管理
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

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
    // 自分の出品した教科書でも、交渉済みのチャットルームがある場合は遷移可能にするため
    // アクションで適切に取得/作成できるよう制限はアクション側に任せます
    const roomId = await createOrGetChatRoom(currentUserId, textbook.sellerId, textbook.id);
    router.push(`/chat/${roomId}`);
  };

  const handleDeleteTextbook = async (textbookId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("本当にこの出品を削除しますか？")) return;
    setIsDeleting(textbookId);
    try {
      await deleteTextbook(textbookId);
    } catch (e) {
      console.error(e);
      alert("削除中にエラーが発生しました");
    } finally {
      setIsDeleting(null);
    }
  };

  // 検索キーワードでフィルタリング
  const filteredTextbooks = textbooks.filter(tb => 
    tb.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tb.className.toLowerCase().includes(searchQuery.toLowerCase())
  );


  return (
    <>
      <div className="action-bar">
        <div className="search-box">
          <Search />
          <input 
            type="text" 
            placeholder="授業名や教科書名で検索..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="primary-btn" onClick={() => setShowModal(true)}><Plus /> 出品する</button>
      </div>

      <div className="textbook-grid">
        {filteredTextbooks.map(tb => (
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
            
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              {tb.sellerId === currentUserId ? (
                <>
                  <button 
                    className="primary-btn" 
                    style={{ flex: 1, justifyContent: 'center', background: 'var(--surface-dark)', color: 'var(--text-muted)' }}
                    onClick={() => handleNegotiate(tb)}
                  >
                    <MessageSquare /> 交渉一覧
                  </button>
                  <button 
                    className="secondary-btn" 
                    style={{ 
                      flexShrink: 0, 
                      padding: '0 0.8rem', 
                      borderColor: '#fca5a5', 
                      color: '#ef4444', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      cursor: isDeleting === tb.id ? 'not-allowed' : 'pointer'
                    }}
                    onClick={(e) => handleDeleteTextbook(tb.id, e)}
                    disabled={isDeleting === tb.id}
                    title="出品を削除する"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  </button>
                </>
              ) : (
                <button 
                  className="primary-btn" 
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => handleNegotiate(tb)}
                >
                  <MessageSquare /> 交渉する
                </button>
              )}
            </div>
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
