"use client";

import { useState } from "react";
import { Plus, Calendar, MapPin, Users, X } from "lucide-react";
import { createGathering, joinGathering, leaveGathering, deleteGathering } from "../actions";
import { getAvatarUrl } from "@/lib/avatar";

export default function GatheringFeed({ gatherings, currentUserId }: { gatherings: any[], currentUserId: number }) {
  const [filterType, setFilterType] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedGathering, setSelectedGathering] = useState<any>(null);
  const [formData, setFormData] = useState({ title: '', date: '', place: '', type: 'ご飯 (ランチ/ディナー)', tags: '', deadline: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const now = new Date();
  
  const processedGatherings = gatherings.filter(g => {
    if (!g.deadline) return true;
    const deadline = new Date(g.deadline);
    const msSinceDeadline = now.getTime() - deadline.getTime();
    const hoursSinceDeadline = msSinceDeadline / (1000 * 60 * 60);
    // 期限から24時間以上経ったものは除外
    if (hoursSinceDeadline >= 24) return false;
    return true;
  }).map(g => {
    let isEnded = false;
    if (g.deadline) {
      const deadline = new Date(g.deadline);
      isEnded = now.getTime() > deadline.getTime();
    }
    return { ...g, isEnded };
  });

  const filteredGatherings = processedGatherings.filter(g => {
    if (filterType !== 'all' && !g.type.includes(filterType)) return false;
    
    if (statusFilter === 'active' && g.isEnded) return false;
    if (statusFilter === 'ended' && !g.isEnded) return false;
    
    return true;
  }).sort((a, b) => {
    if (a.isEnded === b.isEnded) {
       return b.id - a.id; 
    }
    return a.isEnded ? 1 : -1;
  });

  const activeGathering = selectedGathering 
    ? processedGatherings.find(g => g.id === selectedGathering.id) 
    : null;

  const handleCreate = async () => {
    if (!formData.title || !formData.date || !formData.place) return;
    setIsSubmitting(true);
    try {
      await createGathering(currentUserId, formData);
      setShowModal(false);
      setFormData({ title: '', date: '', place: '', type: 'ご飯 (ランチ/ディナー)', tags: '', deadline: '' });
    } catch (e) {
      console.error(e);
      alert("エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    if (dateString.includes("T")) {
      const d = new Date(dateString);
      return `${d.getMonth()+1}月${d.getDate()}日 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}〜`;
    }
    return dateString;
  };

  const handleToggleJoin = async (gathering: any) => {
    const isJoined = gathering.members.some((m: any) => m.id === currentUserId);
    if (isJoined) {
      await leaveGathering(currentUserId, gathering.id);
    } else {
      await joinGathering(currentUserId, gathering.id);
    }
  };

  const handleDelete = async (gatheringId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("本当にこの募集を削除しますか？")) return;
    setIsDeleting(true);
    try {
      await deleteGathering(gatheringId);
      if (selectedGathering?.id === gatheringId) {
        setSelectedGathering(null);
      }
    } catch (e) {
      console.error(e);
      alert("削除中にエラーが発生しました");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="action-bar" style={{ justifyContent: 'space-between' }}>
        <button className="text-btn" onClick={() => setIsFilterOpen(!isFilterOpen)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', color: 'var(--text-main)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg> 
          絞り込み
        </button>
        <button className="primary-btn" onClick={() => setShowModal(true)}><Plus /> 募集する</button>
      </div>

      <div className={`filter-panel-wrapper ${isFilterOpen ? 'open' : 'closed'}`}>
        <div className="filter-header">
          <h3>絞り込み</h3>
          <button className="filter-clear-btn" onClick={() => { setFilterType('all'); setStatusFilter('all'); }}>クリア</button>
        </div>
        
        <div className="filter-section">
          <div className="filter-section-title">カテゴリー</div>
          <div className="filter-options">
            <label className="custom-radio">
              <input type="radio" name="category" checked={filterType === 'all'} onChange={() => setFilterType('all')} />
              すべて
            </label>
            <label className="custom-radio">
              <input type="radio" name="category" checked={filterType === 'ご飯'} onChange={() => setFilterType('ご飯')} />
              ご飯 (ランチ/ディナー)
            </label>
            <label className="custom-radio">
              <input type="radio" name="category" checked={filterType === '飲み会'} onChange={() => setFilterType('飲み会')} />
              飲み会
            </label>
          </div>
        </div>

        <div className="filter-section">
          <div className="filter-section-title">販売状況 (募集状況)</div>
          <div className="filter-options">
            <label className="custom-radio">
              <input type="checkbox" checked={statusFilter === 'all'} onChange={() => setStatusFilter('all')} />
              すべて
            </label>
            <label className="custom-radio">
              <input type="checkbox" checked={statusFilter === 'active'} onChange={() => setStatusFilter('active')} />
              募集中
            </label>
            <label className="custom-radio">
              <input type="checkbox" checked={statusFilter === 'ended'} onChange={() => setStatusFilter('ended')} />
              募集終了
            </label>
          </div>
        </div>
      </div>
      
      <div className="gathering-feed">
        {filteredGatherings.map(g => {
          const isJoined = g.members.some((m: any) => m.id === currentUserId);
          const isCreator = g.creatorId === currentUserId || (g.members.length > 0 && g.members[0].id === currentUserId);

          return (
            <div 
              className="card gathering-full-card" 
              key={g.id}
              onClick={() => setSelectedGathering(g)}
              style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
            >
              <div className="gathering-header">
                <div>
                  <h2 style={{ color: g.isEnded ? 'var(--text-muted)' : 'inherit' }}>
                    {g.title} {g.isEnded && <span style={{ fontSize: '0.9rem', color: '#dc2626', fontWeight: 'bold', marginLeft: '0.5rem' }}>募集終了</span>}
                  </h2>
                  <div className="tags-container" style={{ justifyContent: 'flex-start', marginTop: '0.5rem', marginBottom: 0 }}>
                    {g.tags.split(',').filter((t: string) => t.trim()).map((tag: string) => <span className="tag" key={tag} style={{ opacity: g.isEnded ? 0.6 : 1 }}>{tag.trim()}</span>)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className={`badge ${g.isEnded ? '' : 'active'}`} style={{ backgroundColor: g.isEnded ? '#e2e8f0' : undefined, color: g.isEnded ? '#64748b' : undefined }}>{g.type}</span>
                  {isCreator && (
                    <button 
                      onClick={(e) => handleDelete(g.id, e)} 
                      disabled={isDeleting}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="この募集を削除する"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                  )}
                </div>
              </div>
              
              <div className="gathering-details" style={{ opacity: g.isEnded ? 0.6 : 1 }}>
                <div><Calendar /> {formatDate(g.date)} {g.deadline && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>(期限: {new Date(g.deadline).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })})</span>}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <MapPin /> 
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(g.place)}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    onClick={(e) => e.stopPropagation()}
                    style={{ color: 'var(--primary)', textDecoration: 'underline', fontWeight: 500 }}
                  >
                    {g.place} 🗺️
                  </a>
                </div>
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
                    <span>主催者: {g.members[0].name} ({g.members[0].tags.split(',')[0]})</span>
                  )}
                </div>
                
                <button 
                  className="primary-btn" 
                  style={{ 
                    background: g.isEnded && !isJoined ? 'var(--surface-dark)' : (isJoined ? 'var(--surface-dark)' : 'var(--primary)'), 
                    color: g.isEnded && !isJoined ? 'var(--text-muted)' : (isJoined ? 'var(--text-muted)' : 'white'),
                    cursor: g.isEnded && !isJoined ? 'not-allowed' : 'pointer'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleJoin(g);
                  }}
                  disabled={g.isEnded && !isJoined}
                >
                  {isJoined ? '参加キャンセル' : (g.isEnded ? '終了しました' : '参加する')}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
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
                <label>開催日時</label>
                <input type="datetime-local" className="form-input" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              <div className="form-group">
                <label>場所</label>
                <input type="text" className="form-input" placeholder="例: 学食 または 駅前食堂" value={formData.place} onChange={e => setFormData({...formData, place: e.target.value})} />
              </div>
              <div className="form-group">
                <label>募集期限 (任意)</label>
                <input type="datetime-local" className="form-input" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
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
        </div>
      )}

      {activeGathering && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={() => setSelectedGathering(null)}
        >
          <div 
            className="card" 
            style={{ width: '100%', maxWidth: '550px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', padding: '2rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedGathering(null)} 
              style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', padding: '0.5rem' }}
            >
              <X />
            </button>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
              <span className={`badge active`} style={{ alignSelf: 'flex-start' }}>{activeGathering.type}</span>
              {activeGathering.isEnded && <span style={{ fontSize: '0.9rem', color: '#dc2626', fontWeight: 'bold' }}>募集終了</span>}
            </div>

            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-main)' }}>{activeGathering.title}</h2>
            
            <div className="tags-container" style={{ justifyContent: 'flex-start', marginBottom: '1.5rem' }}>
              {activeGathering.tags.split(',').filter((t: string) => t.trim()).map((tag: string) => (
                <span className="tag" key={tag}>{tag.trim()}</span>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', padding: '1.25rem', backgroundColor: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Calendar style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>開催日時</div>
                  <div style={{ fontWeight: 'bold' }}>{formatDate(activeGathering.date)}</div>
                  {activeGathering.deadline && (
                    <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }}>
                      募集期限: {new Date(activeGathering.deadline).toLocaleString('ja-JP')}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <MapPin style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>開催場所</div>
                  <div style={{ fontWeight: 'bold' }}>
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeGathering.place)}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: 'var(--primary)', textDecoration: 'underline' }}
                    >
                      {activeGathering.place} 🗺️ (地図を表示)
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} /> 参加予定のメンバー ({activeGathering.members.length}人)
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '0.25rem' }}>
              {activeGathering.members.map((m: any, idx: number) => {
                const isHost = idx === 0;
                return (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', borderRadius: '8px', backgroundColor: isHost ? 'rgba(59, 130, 246, 0.05)' : 'transparent', border: isHost ? '1px dashed rgba(59, 130, 246, 0.2)' : 'none' }}>
                    <div className="avatar" style={{ backgroundColor: m.color, width: '40px', height: '40px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={getAvatarUrl(m.name, m.feature)} alt={m.name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {m.name}
                        {isHost && <span style={{ fontSize: '0.7rem', color: 'var(--primary)', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>主催者</span>}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.dept} • {m.tags.split(',')[0]}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              {(activeGathering.creatorId === currentUserId || (activeGathering.members.length > 0 && activeGathering.members[0].id === currentUserId)) && (
                <button 
                  className="secondary-btn" 
                  style={{ color: '#ef4444', borderColor: '#fca5a5', display: 'flex', alignItems: 'center', gap: '0.5rem' }} 
                  onClick={(e) => handleDelete(activeGathering.id, e)}
                  disabled={isDeleting}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  この募集を削除
                </button>
              )}
              
              <button 
                className="primary-btn" 
                style={{ 
                  background: activeGathering.isEnded && !activeGathering.members.some((m: any) => m.id === currentUserId) ? 'var(--surface-dark)' : (activeGathering.members.some((m: any) => m.id === currentUserId) ? 'var(--surface-dark)' : 'var(--primary)'), 
                  color: activeGathering.isEnded && !activeGathering.members.some((m: any) => m.id === currentUserId) ? 'var(--text-muted)' : (activeGathering.members.some((m: any) => m.id === currentUserId) ? 'var(--text-muted)' : 'white'),
                  cursor: activeGathering.isEnded && !activeGathering.members.some((m: any) => m.id === currentUserId) ? 'not-allowed' : 'pointer'
                }}
                onClick={() => {
                  handleToggleJoin(activeGathering);
                }}
                disabled={activeGathering.isEnded && !activeGathering.members.some((m: any) => m.id === currentUserId)}
              >
                {activeGathering.members.some((m: any) => m.id === currentUserId) ? '参加キャンセル' : (activeGathering.isEnded ? '終了しました' : '参加する')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
