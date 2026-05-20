"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, Calendar, MapPin, Users, X } from "lucide-react";
import { createGathering, joinGathering, leaveGathering } from "../actions";
import { getAvatarUrl } from "@/lib/avatar";

export default function GatheringFeed({ gatherings, currentUserId }: { gatherings: any[], currentUserId: number }) {
  const [filterType, setFilterType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', date: '', place: '', type: 'ご飯 (ランチ/ディナー)', tags: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredGatherings = filterType === 'all' 
    ? gatherings 
    : gatherings.filter(g => g.type.includes(filterType));

  const handleCreate = async () => {
    if (!formData.title || !formData.date || !formData.place) return;
    setIsSubmitting(true);
    await createGathering(currentUserId, formData);
    setShowModal(false);
    setFormData({ title: '', date: '', place: '', type: 'ご飯 (ランチ/ディナー)', tags: '' });
    setIsSubmitting(false);
  };

  const handleToggleJoin = async (gathering: any) => {
    const isJoined = gathering.members.some((m: any) => m.id === currentUserId);
    if (isJoined) {
      await leaveGathering(currentUserId, gathering.id);
    } else {
      await joinGathering(currentUserId, gathering.id);
    }
  };

  return (
    <>
      <div className="action-bar">
        <div className="filter-tabs">
          <button className={`tab ${filterType === 'all' ? 'active' : ''}`} onClick={() => setFilterType('all')}>すべて</button>
          <button className={`tab ${filterType === 'ご飯' ? 'active' : ''}`} onClick={() => setFilterType('ご飯')}>ご飯 (ランチ/ディナー)</button>
          <button className={`tab ${filterType === '飲み会' ? 'active' : ''}`} onClick={() => setFilterType('飲み会')}>飲み会</button>
        </div>
        <button className="primary-btn" onClick={() => setShowModal(true)}><Plus /> 募集する</button>
      </div>
      
      <div className="gathering-feed">
        {filteredGatherings.map(g => {
          const isJoined = g.members.some((m: any) => m.id === currentUserId);
          const isCreator = g.members.length > 0 && g.members[0].id === currentUserId;

          return (
            <div className="card gathering-full-card" key={g.id}>
              <div className="gathering-header">
                <div>
                  <h2>{g.title}</h2>
                  <div className="tags-container" style={{ justifyContent: 'flex-start', marginTop: '0.5rem', marginBottom: 0 }}>
                    {g.tags.split(',').filter((t: string) => t.trim()).map((tag: string) => <span className="tag" key={tag}>{tag.trim()}</span>)}
                  </div>
                </div>
                <span className="badge active">{g.type}</span>
              </div>
              
              <div className="gathering-details">
                <div><Calendar /> {g.date}</div>
                <div><MapPin /> {g.place}</div>
                <div><Users /> {g.members.length}人が参加予定</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                <div className="members-preview">
                  {g.members.map((m: any) => (
                    <div className="avatar" style={{ backgroundColor: m.color }} key={m.id}>
                      <img src={getAvatarUrl(m.name, m.feature)} alt={m.name} loading="lazy" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                    </div>
                  ))}
                  {g.members.length > 0 && (
                    <span>主催者の趣味: {g.members[0].tags.split(',')[0]}</span>
                  )}
                </div>
                
                <button 
                  className="primary-btn" 
                  style={{ 
                    background: isJoined ? 'var(--surface-dark)' : 'var(--primary)', 
                    color: isJoined ? 'var(--text-muted)' : 'white' 
                  }}
                  onClick={() => handleToggleJoin(g)}
                >
                  {isJoined ? '参加キャンセル' : '参加する'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && mounted && createPortal(
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', zIndex: 10, padding: '0.5rem' }}>
              <X />
            </button>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', paddingRight: '2rem' }}><Users /> 新しく募集する</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>募集タイトル</label>
                <input type="text" className="form-input" placeholder="例: 経済学部でランチ行ける人！" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="form-group">
                <label>種類</label>
                <select className="form-input" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="ご飯 (ランチ/ディナー)">ご飯 (ランチ/ディナー)</option>
                  <option value="飲み会">飲み会</option>
                  <option value="カフェ">カフェ</option>
                </select>
              </div>
              <div className="form-group">
                <label>日時</label>
                <input type="text" className="form-input" placeholder="例: 10/25(水) 12:15〜" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              <div className="form-group">
                <label>場所</label>
                <input type="text" className="form-input" placeholder="例: 学食 または 駅前食堂" value={formData.place} onChange={e => setFormData({...formData, place: e.target.value})} />
              </div>
              <div className="form-group">
                <label>対象となる趣味や条件タグ (カンマ区切り)</label>
                <input type="text" className="form-input" placeholder="例: 経済学部, ラーメン好き" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} />
              </div>
              
              <button className="primary-btn" style={{ justifyContent: 'center', marginTop: '1rem', padding: '1rem', fontSize: '1.1rem' }} onClick={handleCreate} disabled={isSubmitting}>
                {isSubmitting ? '登録中...' : '募集を完了する'}
              </button>
            </div>
          </div>
        </div>,
        document.getElementById('app-main')!
      )}
    </>
  );
}
