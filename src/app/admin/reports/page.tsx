import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, ShieldAlert, User, Clock, AlertTriangle } from "lucide-react";
import { getAvatarUrl } from "@/lib/avatar";

export const dynamic = 'force-dynamic';

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({
    include: {
      reporter: true,
      reported: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>
          <ArrowLeft size={18} /> マイページに戻る
        </Link>
      </div>

      <div>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>
          <ShieldAlert color="#ef4444" /> 通報管理画面
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>
          ユーザーからの通報履歴一覧です。（開発用プロトタイプのためアクセス制限なし）
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {reports.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <AlertTriangle size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.2 }} />
            <p>現在、通報はありません。</p>
          </div>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #ef4444', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontWeight: 'bold', fontSize: '1.1rem' }}>
                  <AlertTriangle size={18} />
                  {report.reason}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  <Clock size={12} />
                  {new Date(report.createdAt).toLocaleString('ja-JP')}
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', backgroundColor: 'var(--surface-light)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                
                {/* 通報されたユーザー (Reported) */}
                <div style={{ flex: '1 1 200px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 'bold' }}>【通報対象者】</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: report.reported.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <img src={getAvatarUrl(report.reported.name, report.reported.feature)} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{report.reported.name} <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: '#64748b' }}>({report.reported.gender === 'male' ? '男性' : '女性'})</span></div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{report.reported.dept}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: '0.8rem' }}>
                    <Link href={`/profile/${report.reportedId}`} className="secondary-btn" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <User size={12} /> プロフィールを確認
                    </Link>
                  </div>
                </div>

                <div style={{ width: '1px', backgroundColor: 'var(--border)', minHeight: '60px' }}></div>

                {/* 通報したユーザー (Reporter) */}
                <div style={{ flex: '1 1 200px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 'bold' }}>【通報者】</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: report.reporter.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <img src={getAvatarUrl(report.reporter.name, report.reporter.feature)} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{report.reporter.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{report.reporter.dept}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: '0.8rem' }}>
                    <Link href={`/profile/${report.reporterId}`} style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none' }}>
                      通報者のプロフィールへ
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
