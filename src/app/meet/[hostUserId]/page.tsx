import React from 'react';
import prisma from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { redirect } from "next/navigation";
import MeetClient from "./MeetClient";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ hostUserId: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function MeetPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const hostUserId = parseInt(resolvedParams.hostUserId);
  const token = resolvedSearchParams.token;

  if (isNaN(hostUserId) || !token) {
    redirect('/');
  }

  // 1. 認証チェック
  let currentUserId: number | null = null;
  try {
    currentUserId = await getCurrentUserId();
  } catch (e) {
    // 未ログイン
  }

  // 未ログインの場合は、ログイン後にこのページに戻るようにリダイレクト
  if (!currentUserId) {
    const currentUrl = `/meet/${hostUserId}?token=${token}`;
    redirect(`/login?redirectTo=${encodeURIComponent(currentUrl)}`);
  }

  // 2. 自分同士の検証
  if (currentUserId === hostUserId) {
    return (
      <div style={{ display: 'flex', minHeight: '80vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '400px', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>自分自身とは出会えません</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            出会いを記録するには、お友達の画面に表示されたQRコードをスキャンする必要があります。
          </p>
          <a href="/" className="primary-btn" style={{ justifyContent: 'center', display: 'flex' }}>ホームへ戻る</a>
        </div>
      </div>
    );
  }

  // 3. ホストが存在するか確認
  const hostUser = await prisma.user.findUnique({
    where: { id: hostUserId },
    select: { name: true }
  });

  if (!hostUser) {
    redirect('/');
  }

  return (
    <MeetClient 
      hostUserId={hostUserId} 
      hostName={hostUser.name} 
      token={token} 
      currentUserId={currentUserId} 
    />
  );
}
