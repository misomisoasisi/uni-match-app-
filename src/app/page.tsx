import prisma from "@/lib/prisma";
import { Sparkles, Book, Utensils, User as UserIcon, Clock, MapPin, MessageCircle, Heart } from "lucide-react";
import { getAvatarUrl } from "@/lib/avatar";
import { getCurrentUserId } from "@/lib/auth";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const currentUserId = await getCurrentUserId();
  const currentUser = await prisma.user.findUnique({ 
    where: { id: currentUserId },
    include: { blocksGiven: true, blocksReceived: true }
  });

  const blockedUserIds = currentUser ? [
    ...currentUser.blocksGiven.map(b => b.blockedId),
    ...currentUser.blocksReceived.map(b => b.blockerId)
  ] : [];

  let allUsers = await prisma.user.findMany({ 
    where: { 
      id: { not: currentUserId, notIn: blockedUserIds }
    }
  });

  // Calculate common tags
  const myTags = currentUser?.tags ? currentUser.tags.split(",").map(t => t.trim()) : [];
  
  const usersWithScore = allUsers.map(user => {
    const theirTags = user.tags ? user.tags.split(",").map(t => t.trim()) : [];
    const commonTagsCount = myTags.filter(t => theirTags.includes(t)).length;
    return { ...user, commonTagsCount };
  });

  // Sort by common tags (descending)
  usersWithScore.sort((a, b) => b.commonTagsCount - a.commonTagsCount);
  const users = usersWithScore.slice(0, 3);

  const textbooks = await prisma.textbook.findMany({ 
    where: { sellerId: { notIn: blockedUserIds } },
    include: { seller: true }, 
    take: 2 
  });
  const gatherings = await prisma.gathering.findMany({ 
    where: { creatorId: { notIn: blockedUserIds } },
    include: { members: true },
    take: 2
  });

  const posts = await prisma.post.findMany({
    where: { authorId: { notIn: blockedUserIds } },
    include: { author: true },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  const now = new Date();
  const jstHour = (now.getUTCHours() + 9) % 24;
  let greeting = "こんにちは";
  if (jstHour >= 5 && jstHour < 11) {
    greeting = "おはようございます";
  } else if (jstHour >= 11 && jstHour < 18) {
    greeting = "こんにちは";
  } else {
    greeting = "こんばんは";
  }

  const funnyPhrases = [
    "今日の大学生活で新しい出会いを見つけましょう。",
    "今日は単位を落とさないように頑張りましょう！",
    "学食の限定メニューはもうチェックしましたか？",
    "全休を目指して今日も元気にいきましょう！",
    "課題は明日から本気出す予定ですよね？",
    "空きコマで一緒にサボる...いえ、勉強する仲間を探しませんか？",
    "教授の雑談からテストに出る箇所を予測するゲームの始まりです。",
    "1限がある日は自分を最大限に褒めてあげましょう。"
  ];
  const randomPhrase = funnyPhrases[Math.floor(Math.random() * funnyPhrases.length)];

  return (
    <>
      <div className="welcome-banner">
        <h2>{greeting}、{currentUser?.name || "User"}さん！</h2>
        <p>{randomPhrase}</p>
      </div>
      
      <div className="dashboard-grid">
        {/* Quick Match Section */}
        <section className="card widget">
          <div className="widget-header">
            <h3><Sparkles /> おすすめの仲間</h3>
            <button className="text-btn">すべて見る</button>
          </div>
          <div className="user-scroll-list">
            {users.map(user => (
              <Link href={`/profile/${user.id}`} key={user.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="user-card-mini">
                  <div className="avatar" style={{ backgroundColor: user.color }}>
                    <img src={getAvatarUrl(user.name, user.feature)} alt={user.name} loading="lazy" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                  </div>
                  <div>
                    <div className="item-title">
                      {user.name} <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: '#64748b' }}>{user.char}</span>
                    </div>
                    <div className="item-meta">{user.dept}</div>
                    {user.commonTagsCount > 0 && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <Heart size={12} /> 共通点 {user.commonTagsCount}個
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Textbooks */}
        <section className="card widget">
          <div className="widget-header">
            <h3><Book /> 新着の教科書</h3>
            <button className="text-btn">マルシェへ</button>
          </div>
          <div className="textbook-list">
            {textbooks.map(tb => (
              <div className="textbook-item" key={tb.id}>
                <div className="item-title">{tb.title}</div>
                <div className="item-meta">
                  <span><UserIcon /> {tb.seller.name}</span>
                  <span className={tb.price === '無料譲渡' ? 'free-tag' : 'price-tag'}>{tb.price}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming Gatherings */}
        <section className="card widget">
          <div className="widget-header">
            <h3><Utensils /> 今日のご飯・飲み会</h3>
            <button className="text-btn">募集を見る</button>
          </div>
          <div className="gathering-list">
            {gatherings.map(g => (
              <div className="gathering-item" key={g.id}>
                <div className="item-title">{g.title}</div>
                <div className="item-meta">
                  <span><Clock /> {g.date}</span>
                  <span><MapPin /> {g.place}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline Section */}
        <section className="card widget" style={{ gridColumn: '1 / -1' }}>
          <div className="widget-header">
            <h3><MessageCircle /> タイムライン</h3>
          </div>
          
          <form action={async (formData) => {
            "use server";
            const content = formData.get("content") as string;
            if (content.trim()) {
              const { createPost } = await import('@/app/actions');
              await createPost(content);
            }
          }} style={{ display: 'flex', gap: '0.5rem', padding: '1rem', borderBottom: '1px solid var(--border)' }}>
            <input 
              name="content" 
              type="text" 
              className="input-field" 
              placeholder="今何してる？（つぶやき）" 
              style={{ flex: 1 }} 
              required
            />
            <button type="submit" className="primary-btn" style={{ padding: '0.5rem 1rem' }}>投稿</button>
          </form>

          <div style={{ padding: '0.5rem' }}>
            {posts.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                まだつぶやきがありません。最初の投稿をしてみましょう！
              </div>
            )}
            {posts.map(post => (
              <div key={post.id} style={{ display: 'flex', gap: '1rem', padding: '1rem', borderBottom: '1px solid var(--border)' }}>
                <Link href={`/profile/${post.authorId}`} className="avatar" style={{ backgroundColor: post.author.color, width: '40px', height: '40px', flexShrink: 0 }}>
                  <img src={getAvatarUrl(post.author.name, post.author.feature)} alt={post.author.name} loading="lazy" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                </Link>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <Link href={`/profile/${post.authorId}`} style={{ fontWeight: 'bold', textDecoration: 'none', color: 'inherit' }}>
                      {post.author.name}
                    </Link>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {post.createdAt.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ marginTop: '0.3rem', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                    {post.content}
                  </div>
                  {post.authorId === currentUserId && (
                    <form action={async () => {
                      "use server";
                      const { deletePost } = await import('@/app/actions');
                      await deletePost(post.id);
                    }} style={{ marginTop: '0.5rem', textAlign: 'right' }}>
                      <button type="submit" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer' }}>
                        削除
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
