"use client";

import { useState, useEffect } from "react";
import { Search, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getChatRooms } from "../actions";
import { getAvatarUrl } from "@/lib/avatar";

export default function ChatListClient({ initialRooms, currentUserId }: { initialRooms: any[], currentUserId: number }) {
  const router = useRouter();
  const [rooms, setRooms] = useState(initialRooms);
  const [searchQuery, setSearchQuery] = useState("");

  // 3秒に一回チャットルーム一覧をポーリングして更新
  useEffect(() => {
    let active = true;
    const interval = setInterval(async () => {
      try {
        const latestRooms = await getChatRooms();
        if (!active) return;
        setRooms(latestRooms);
      } catch (e) {
        console.error("Failed to poll chat rooms:", e);
      }
    }, 3000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const filteredRooms = rooms.filter(room => {
    const partnerName = room.partner.name.toLowerCase();
    const lastMsgContent = room.lastMessage ? room.lastMessage.content.toLowerCase() : "";
    const textbookTitle = room.textbook ? room.textbook.title.toLowerCase() : "";
    const query = searchQuery.toLowerCase();

    return partnerName.includes(query) || lastMsgContent.includes(query) || textbookTitle.includes(query);
  });

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    
    const isToday = date.toDateString() === now.toDateString();
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (isYesterday) {
      return '昨日';
    } else {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--bg-color)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '1rem 1.5rem', backgroundColor: 'white', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={22} />
        </button>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', flex: 1 }}>トーク一覧</h2>
      </div>

      {/* Search Bar */}
      <div style={{ padding: '0.8rem 1rem', backgroundColor: 'white', borderBottom: '1px solid var(--border)' }}>
        <div className="search-box" style={{ borderRadius: '24px', backgroundColor: '#f1f5f9', padding: '0.4rem 1rem' }}>
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="トーク相手やメッセージを検索..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ fontSize: '0.9rem' }}
          />
        </div>
      </div>

      {/* Chat List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0 1.5rem' }}>
        {filteredRooms.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '4rem', padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
            {searchQuery ? (
              <p>検索結果が見つかりませんでした。</p>
            ) : (
              <>
                <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>トーク履歴がありません</p>
                <p style={{ fontSize: '0.85rem' }}>マッチング画面や教科書マルシェから<br/>気になる人にメッセージを送ってみましょう！</p>
              </>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredRooms.map((room) => (
              <Link 
                key={room.id} 
                href={`/chat/${room.id}`}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '0.9rem 1.2rem', 
                  backgroundColor: 'white', 
                  borderBottom: '1px solid #f1f5f9',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'background-color 0.2s',
                  position: 'relative'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                {/* Avatar */}
                <div className="avatar" style={{ width: '48px', height: '48px', backgroundColor: room.partner.color, flexShrink: 0, marginRight: '0.9rem', position: 'relative' }}>
                  <img src={getAvatarUrl(room.partner.name, room.partner.feature)} alt={room.partner.name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '0.95rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {room.partner.name}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0, marginLeft: '0.5rem' }}>
                      {room.lastMessage ? formatTime(room.lastMessage.createdAt) : ''}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ 
                      fontSize: '0.85rem', 
                      color: room.unreadCount > 0 ? 'var(--text-main)' : 'var(--text-muted)', 
                      margin: 0, 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      fontWeight: room.unreadCount > 0 ? '600' : 'normal',
                      flex: 1
                    }}>
                      {room.lastMessage ? room.lastMessage.content : 'メッセージはありません'}
                    </p>
                    
                    {/* Unread Badge */}
                    {room.unreadCount > 0 && (
                      <span style={{ 
                        backgroundColor: '#f43f5e', 
                        color: 'white', 
                        borderRadius: '50%', 
                        minWidth: '18px', 
                        height: '18px', 
                        padding: '0 5px',
                        fontSize: '0.7rem', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontWeight: 'bold',
                        marginLeft: '0.5rem',
                        flexShrink: 0
                      }}>
                        {room.unreadCount}
                      </span>
                    )}
                  </div>

                  {/* Textbook Tag if applicable */}
                  {room.textbook && (
                    <div style={{ marginTop: '0.1rem' }}>
                      <span style={{ 
                        fontSize: '0.7rem', 
                        backgroundColor: 'rgba(37, 99, 235, 0.08)', 
                        color: 'var(--primary)', 
                        padding: '2px 8px', 
                        borderRadius: '10px',
                        fontWeight: 600,
                        display: 'inline-block'
                      }}>
                        📖 {room.textbook.title}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
