import prisma from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import Link from "next/link";
import { Bell, MessageCircle, Users } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const currentUserId = await getCurrentUserId();

  const notifications = await prisma.notification.findMany({
    where: { userId: currentUserId },
    orderBy: { createdAt: 'desc' }
  });

  if (notifications.some(n => !n.isRead)) {
    await prisma.notification.updateMany({
      where: { userId: currentUserId, isRead: false },
      data: { isRead: true }
    });
  }

  const getIcon = (type: string) => {
    if (type === 'NEW_MESSAGE') return <MessageCircle size={20} color="#3b82f6" />;
    if (type === 'GATHERING_JOIN') return <Users size={20} color="#10b981" />;
    return <Bell size={20} color="#64748b" />;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
  };

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
      {notifications.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#64748b', padding: '3rem 0' }}>
          <Bell size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <p>新しい通知はありません</p>
        </div>
      ) : (
        notifications.map((n) => {
          const ContentWrapper = n.link ? Link : 'div';
          return (
            <ContentWrapper 
              key={n.id} 
              href={n.link || '#'}
              style={{ 
                display: 'flex', 
                gap: '1rem', 
                padding: '1rem', 
                backgroundColor: n.isRead ? '#ffffff' : '#f0fdf4',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              <div style={{ padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: '50%', height: 'fit-content' }}>
                {getIcon(n.type)}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.4' }}>{n.content}</p>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem', display: 'block' }}>
                  {formatDate(n.createdAt)}
                </span>
              </div>
            </ContentWrapper>
          );
        })
      )}
    </div>
  );
}
