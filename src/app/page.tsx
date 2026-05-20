import prisma from "@/lib/prisma";
import { Sparkles, Book, Utensils, User as UserIcon, Clock, MapPin } from "lucide-react";
import { getAvatarUrl } from "@/lib/avatar";
import { getCurrentUserId } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const currentUserId = await getCurrentUserId();
  const currentUser = await prisma.user.findUnique({ where: { id: currentUserId } });

  const users = await prisma.user.findMany({ take: 3 });
  const textbooks = await prisma.textbook.findMany({ include: { seller: true }, take: 2 });
  const gatherings = await prisma.gathering.findMany({ include: { members: true } });

  return (
    <>
      <div className="welcome-banner">
        <h2>こんにちは、{currentUser?.name || "User"}さん！</h2>
        <p>今日の大学生活で新しい出会いを見つけましょう。</p>
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
              <div className="user-card-mini" key={user.id}>
                <div className="avatar" style={{ backgroundColor: user.color }}>
                  <img src={getAvatarUrl(user.name, user.feature)} alt={user.name} loading="lazy" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                </div>
                <div>
                  <div className="item-title">
                    {user.name} <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: '#64748b' }}>{user.char}</span>
                  </div>
                  <div className="item-meta">{user.dept}</div>
                </div>
              </div>
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
      </div>
    </>
  );
}
