"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { sendMessage, getChatMessages, markRoomNotificationsAsRead } from "../../actions";
import { getAvatarUrl } from "@/lib/avatar";

export default function ChatUI({ room, currentUserId }: { room: any, currentUserId: number }) {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // メッセージのローカル状態管理
  const [messages, setMessages] = useState<any[]>(room.messages);

  // チャット相手（自分以外）を特定
  const partner = room.buyerId === currentUserId ? room.seller : room.buyer;

  // props が変更された場合に state に反映（自分が送信した場合など）
  useEffect(() => {
    setMessages(room.messages);
  }, [room.messages]);

  // 部屋に入ったとき、または新着メッセージ取得時に通知を既読にする
  useEffect(() => {
    markRoomNotificationsAsRead(room.id);
  }, [room.id, messages.length]);

  // 定期ポーリングによるリアルタイム更新（3秒間隔）
  useEffect(() => {
    let active = true;
    const interval = setInterval(async () => {
      try {
        const latestMessages = await getChatMessages(room.id);
        if (!active) return;

        setMessages(prevMessages => {
          const hasChanges = latestMessages.length !== prevMessages.length || 
            (latestMessages.length > 0 && prevMessages.length > 0 && 
             latestMessages[latestMessages.length - 1].id !== prevMessages[prevMessages.length - 1].id);
          
          if (hasChanges) {
            return latestMessages;
          }
          return prevMessages;
        });
      } catch (e) {
        console.error("Failed to poll messages:", e);
      }
    }, 3000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [room.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setIsSending(true);
    await sendMessage(room.id, currentUserId, content);
    setContent('');
    setIsSending(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '1rem', backgroundColor: 'white', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '1rem', color: 'var(--text)' }}>
          <ArrowLeft />
        </button>
        <div className="avatar" style={{ width: '40px', height: '40px', backgroundColor: partner.color, marginRight: '0.8rem' }}>
          <img src={getAvatarUrl(partner.name, partner.feature)} alt={partner.name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.1rem', margin: 0 }}>{partner.name}</h2>
          {room.textbook && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>教科書「{room.textbook.title}」の交渉</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
            メッセージを送って交渉を始めましょう！
          </div>
        ) : (
          messages.map((msg: any) => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div key={msg.id} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: '0.5rem' }}>
                {!isMe && (
                  <div className="avatar" style={{ width: '32px', height: '32px', backgroundColor: partner.color, flexShrink: 0 }}>
                    <img src={getAvatarUrl(partner.name, partner.feature)} alt={partner.name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                  </div>
                )}
                <div style={{
                  backgroundColor: isMe ? 'var(--primary)' : 'white',
                  color: isMe ? 'white' : 'var(--text)',
                  padding: '0.8rem 1rem',
                  borderRadius: '16px',
                  borderBottomRightRadius: isMe ? '4px' : '16px',
                  borderBottomLeftRadius: !isMe ? '4px' : '16px',
                  maxWidth: '75%',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  wordBreak: 'break-word'
                }}>
                  {msg.content}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Form */}
      <div style={{ padding: '1rem', backgroundColor: 'white', borderTop: '1px solid var(--border)', paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            type="text" 
            className="form-input" 
            style={{ flex: 1, margin: 0, borderRadius: '24px' }} 
            placeholder="メッセージを入力..." 
            value={content}
            onChange={e => setContent(e.target.value)}
            disabled={isSending}
          />
          <button type="submit" disabled={isSending || !content.trim()} style={{
            backgroundColor: content.trim() ? 'var(--primary)' : 'var(--surface-dark)',
            color: content.trim() ? 'white' : 'var(--text-muted)',
            border: 'none',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: content.trim() ? 'pointer' : 'default',
            transition: 'background-color 0.2s'
          }}>
            <Send size={18} style={{ marginLeft: '2px' }} />
          </button>
        </form>
      </div>
    </div>
  );
}
