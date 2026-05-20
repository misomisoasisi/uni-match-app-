"use client";

import { useState, useMemo } from "react";
import { MessageCircle, Search, Tag } from "lucide-react";
import { getAvatarUrl } from "@/lib/avatar";
import { createOrGetMatchChatRoom } from "../actions";
import { useRouter } from "next/navigation";

export default function MatchFeed({ users, currentUserId }: { users: any[], currentUserId: number }) {
  const router = useRouter();
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMbti, setSelectedMbti] = useState('all');
  const [isFocused, setIsFocused] = useState(false);

  // Extract all unique tags for autocomplete
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    users.forEach(u => {
      if (u.tags) {
        u.tags.split(',').forEach((t: string) => {
          const trimmed = t.trim();
          if (trimmed) tags.add(trimmed);
        });
      }
    });
    return Array.from(tags);
  }, [users]);

  // Find matching tags based on search query
  const matchingTags = useMemo(() => {
    if (!searchQuery) return allTags.slice(0, 6); // 空のときは最初のいくつかを表示
    const query = searchQuery.toLowerCase();
    return allTags.filter(tag => tag.toLowerCase().includes(query));
  }, [searchQuery, allTags]);

  // 自分自身は一覧から除外する
  let otherUsers = users.filter(u => u.id !== currentUserId);

  // 異性のみを表示するフィルタリング
  const me = users.find(u => u.id === currentUserId);
  if (me) {
    if (me.gender === '男性') {
      otherUsers = otherUsers.filter(u => u.gender === '女性');
    } else if (me.gender === '女性') {
      otherUsers = otherUsers.filter(u => u.gender === '男性');
    }
  }

  let filteredUsers = otherUsers;
  
  if (filterType === 'same-dept') {
    if (me) {
      filteredUsers = filteredUsers.filter(u => u.dept.split(' ')[0] === me.dept.split(' ')[0]);
    }
  } else if (filterType === 'hobby') {
    if (me) {
      const myTags = me.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
      filteredUsers = filteredUsers.filter(u => {
        const theirTags = u.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
        return myTags.some((t: string) => theirTags.includes(t));
      });
    }
  }

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredUsers = filteredUsers.filter(u => 
      u.name.toLowerCase().includes(query) || 
      u.dept.toLowerCase().includes(query) || 
      u.tags.toLowerCase().includes(query)
    );
  }

  if (selectedMbti !== 'all') {
    filteredUsers = filteredUsers.filter(u => u.char === selectedMbti || u.char.includes(selectedMbti));
  }

  const handleTalk = async (userId: number) => {
    const roomId = await createOrGetMatchChatRoom(currentUserId, userId);
    router.push(`/chat/${roomId}`);
  };

  return (
    <>
      <div style={{ padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1rem' }}>
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} size={20} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="キーワードや趣味タグで検索" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            autoComplete="off"
            style={{ paddingLeft: '2.5rem' }}
          />

          {isFocused && (searchQuery || allTags.length > 0) && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              zIndex: 50,
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
            }}>
              {!searchQuery ? (
                <div style={{ padding: '1rem' }}>
                  <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.8rem', fontWeight: 'bold' }}>
                    既存のタグから探す
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {allTags.map(tag => (
                      <span 
                        key={tag}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setSearchQuery(tag);
                          setIsFocused(false);
                        }}
                        style={{
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          color: '#334155',
                          padding: '0.4rem 0.8rem',
                          borderRadius: '20px',
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          transition: 'all 0.2s'
                        }}
                      >
                        <Tag size={14} color="#94a3b8" /> {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {matchingTags.length > 0 ? matchingTags.slice(0, 5).map((tag, index) => (
                    <div 
                      key={tag}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSearchQuery(tag);
                        setIsFocused(false);
                      }}
                      className="dropdown-suggest-item"
                      style={{
                        padding: '0.9rem 1.2rem',
                        borderBottom: index === matchingTags.slice(0, 5).length - 1 ? 'none' : '1px solid #f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        gap: '1rem',
                      }}
                    >
                      <Search size={18} color="#94a3b8" />
                      <span style={{ flex: 1, color: '#1e293b', fontSize: '1.05rem' }}>{tag}</span>
                    </div>
                  )) : (
                    <div style={{ padding: '1rem', color: '#64748b', textAlign: 'center', fontSize: '0.95rem' }}>
                      一致するタグがありません
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <select className="form-input" value={selectedMbti} onChange={e => setSelectedMbti(e.target.value)}>
          <option value="all">すべてのMBTI</option>
          <option value="INTJ">INTJ (建築家)</option>
          <option value="INTP">INTP (論理学者)</option>
          <option value="ENTJ">ENTJ (指揮官)</option>
          <option value="ENTP">ENTP (討論者)</option>
          <option value="INFJ">INFJ (提唱者)</option>
          <option value="INFP">INFP (仲介者)</option>
          <option value="ENFJ">ENFJ (主人公)</option>
          <option value="ENFP">ENFP (広報運動家)</option>
          <option value="ISTJ">ISTJ (管理者)</option>
          <option value="ISFJ">ISFJ (擁護者)</option>
          <option value="ESTJ">ESTJ (幹部)</option>
          <option value="ESFJ">ESFJ (領事)</option>
          <option value="ISTP">ISTP (巨匠)</option>
          <option value="ISFP">ISFP (冒険家)</option>
          <option value="ESTP">ESTP (起業家)</option>
          <option value="ESFP">ESFP (エンターテイナー)</option>
        </select>
      </div>

      <div className="filter-bar">
        <span className={`badge ${filterType === 'all' ? 'active' : ''}`} onClick={() => setFilterType('all')}>すべて</span>
        <span className={`badge ${filterType === 'same-dept' ? 'active' : ''}`} onClick={() => setFilterType('same-dept')}>同じ学部</span>
        <span className={`badge ${filterType === 'hobby' ? 'active' : ''}`} onClick={() => setFilterType('hobby')}>趣味が合う</span>
      </div>
      <div className="match-grid">
        {filteredUsers.map(user => (
          <div className="card match-card" key={user.id}>
            <div className="avatar" style={{ backgroundColor: user.color }}>
              <img src={getAvatarUrl(user.name, user.feature)} alt={user.name} loading="lazy" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
            </div>
            <h3>{user.name} <span style={{ fontSize: '0.9rem', color: '#64748b' }}>({user.char})</span></h3>
            <div className="dept">{user.dept}</div>
            <div className="tags-container">
              {user.tags.split(',').filter((t: string) => t.trim()).map((tag: string) => <span className="tag" key={tag}>{tag.trim()}</span>)}
            </div>
            <button 
              className="primary-btn" 
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => handleTalk(user.id)}
            >
              <MessageCircle /> 話しかける
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
