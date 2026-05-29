import prisma from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { getAvatarUrl } from "@/lib/avatar";
import { createOrGetMatchChatRoom, checkMatchStatus, sendLike, blockUser } from "@/app/actions";
import { MessageSquare, Award, ArrowLeft, Heart, ShieldAlert } from "lucide-react";
import Link from "next/link";
import ReportModal from "@/components/ReportModal";

export const dynamic = 'force-dynamic';

export default async function UserProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const currentUserId = await getCurrentUserId();
  
  const resolvedParams = await params;
  const targetUserId = parseInt(resolvedParams.userId);

  if (isNaN(targetUserId)) {
    notFound();
  }

  // 自分自身へのアクセスなら、マイページへリダイレクト
  if (currentUserId === targetUserId) {
    redirect('/profile');
  }

  const user = await prisma.user.findUnique({
    where: { id: targetUserId }
  });

  if (!user) {
    notFound();
  }

  const meetsCount = await prisma.meet.count({
    where: {
      OR: [
        { user1Id: targetUserId },
        { user2Id: targetUserId }
      ]
    }
  });

  const trophies = [
    { id: "first_meet", title: "ファーストコンタクト", icon: "🥉", target: 1, unlocked: meetsCount >= 1 },
    { id: "meet_5", title: "キャンパスの社交家", icon: "🥈", target: 5, unlocked: meetsCount >= 5 },
    { id: "meet_10", title: "うにばのスター", icon: "🥇", target: 10, unlocked: meetsCount >= 10 },
    { id: "meet_20", title: "レジェンド・オブ・うにば", icon: "🏆", target: 20, unlocked: meetsCount >= 20 }
  ];

  async function startChat() {
    "use server";
    const roomId = await createOrGetMatchChatRoom(currentUserId, targetUserId);
    redirect(`/chat/${roomId}`);
  }

  const { hasLiked, isMatch } = await checkMatchStatus(targetUserId);

  async function handleLike() {
    "use server";
    await sendLike(targetUserId);
  }

  async function handleBlock() {
    "use server";
    await blockUser(targetUserId);
    redirect('/');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>
          <ArrowLeft size={18} /> ホームに戻る
        </Link>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <ReportModal targetUserId={targetUserId} targetUserName={user.name} />
          <form action={handleBlock}>
            <button type="submit" style={{ background: 'none', border: 'none', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', cursor: 'pointer' }}>
              <ShieldAlert size={14} /> ブロック
            </button>
          </form>
        </div>
      </div>

      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
        <div className="profile-avatar large" style={{ width: '80px', height: '80px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: user.color }}>
          <img src={getAvatarUrl(user.name, user.feature)} alt={`${user.name}'s Avatar`} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
        </div>
        <div className="profile-info">
          <h2 style={{ marginBottom: '0.2rem' }}>{user.name} <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 'normal' }}>{user.char}</span></h2>
          <p className="subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{user.dept}</p>
          <div className="tags-container" style={{ justifyContent: 'flex-start', marginBottom: 0 }}>
            {user.tags.split(',').filter((t: string) => t.trim()).map((tag: string) => (
              <span className="tag" key={tag}>{tag.trim()}</span>
            ))}
          </div>
        </div>
      </div>

      {user.bio && (
        <div className="card" style={{ padding: '1.2rem', backgroundColor: 'var(--surface-light)', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>自己紹介</h3>
          <p style={{ whiteSpace: 'pre-wrap', margin: 0, lineHeight: '1.5', fontSize: '0.95rem' }}>{user.bio}</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
        {!hasLiked && !isMatch && (
          <form action={handleLike}>
            <button 
              type="submit" 
              style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '1rem', fontSize: '1.1rem', backgroundColor: '#fdf2f8', color: '#db2777', border: '1px solid #fbcfe8', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              <Heart /> 気になってる👋
            </button>
          </form>
        )}
        
        {isMatch && (
          <div style={{ textAlign: 'center', color: '#db2777', fontWeight: 'bold', padding: '0.5rem' }}>
            🎉 マッチング成立！
          </div>
        )}

        {hasLiked && !isMatch && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '0.5rem', fontSize: '0.9rem' }}>
            いいね送信済みです👋
          </div>
        )}

        <form action={startChat}>
          <button 
            type="submit" 
            className="primary-btn" 
            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '1rem', fontSize: '1.1rem' }}
          >
            <MessageSquare /> トーク画面に移る
          </button>
        </form>
      </div>

      <div className="card" style={{ marginTop: '0.5rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem' }}>
          <Award color="var(--primary)" /> 獲得したトロフィー
        </h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', backgroundColor: 'var(--surface-light)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '1.2rem' }}>
          <div style={{ fontSize: '1.8rem' }}>👥</div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>これまでに出会ったユニーク人数</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{meetsCount} 人</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
          {trophies.filter(t => t.unlocked).map(trophy => (
            <div key={trophy.id} style={{ 
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '1.2rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              backgroundColor: 'rgba(59, 130, 246, 0.04)',
              gap: '0.5rem' 
            }}>
              <div style={{ fontSize: '2.5rem' }}>{trophy.icon}</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{trophy.title}</div>
            </div>
          ))}
          {trophies.filter(t => t.unlocked).length === 0 && (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', gridColumn: '1 / -1', padding: '1rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '12px' }}>まだトロフィーがありません</div>
          )}
        </div>
      </div>
    </div>
  );
}
