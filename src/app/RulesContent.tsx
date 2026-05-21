import React from 'react';
import { Shield, MessageSquare, BookOpen, Utensils, AlertTriangle } from 'lucide-react';

export default function RulesContent() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        うにばーしてぃを安全で楽しくご利用いただくためのルールです。必ずご確認ください。
      </p>

      <section>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
          <Shield size={18} color="var(--primary)" /> 1. 基本ルール
        </h4>
        <ul style={{ paddingLeft: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <li>本サービスは大学生専用のコミュニティです。</li>
          <li>登録情報は正確に入力してください。</li>
          <li>特定の個人へのなりすましは禁止です（※ネカマなど架空のペルソナによる利用は許可されています）。</li>
        </ul>
      </section>

      <section>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
          <MessageSquare size={18} color="var(--primary)" /> 2. コミュニケーション
        </h4>
        <ul style={{ paddingLeft: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <li>他のユーザーへの誹謗中傷、嫌がらせ、脅迫行為は禁止します。</li>
          <li>本アプリはマッチングアプリとしての側面を持つため、出会い目的での利用は許可されています。お互いの同意のもと、節度ある交流をお願いします。</li>
          <li>宗教、マルチ商法、その他ビジネスへの勧誘行為は固く禁じます。</li>
        </ul>
      </section>

      <section>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
          <BookOpen size={18} color="var(--primary)" /> 3. 教科書マルシェ
        </h4>
        <ul style={{ paddingLeft: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <li>持っていない教科書を出品するなどの虚偽出品は禁止です。</li>
          <li>受け渡しはキャンパス内など、安全な公共の場所で行うことを推奨します。</li>
          <li>金銭のやり取りは当事者間で責任を持って行ってください。トラブルについて運営は責任を負いかねます。</li>
        </ul>
      </section>

      <section>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
          <Utensils size={18} color="var(--primary)" /> 4. ご飯・飲み会
        </h4>
        <ul style={{ paddingLeft: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <li>未成年者の飲酒・喫煙は法律で禁止されています。絶対にやめましょう。</li>
          <li>参加をキャンセルする場合は、必ず事前に主催者に連絡してください。</li>
          <li>飲酒の強要やイッキ飲みなど、危険な行為は禁止です。</li>
        </ul>
      </section>

      <section>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
          <AlertTriangle size={18} color="var(--primary)" /> 5. その他・規約の改定
        </h4>
        <ul style={{ paddingLeft: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <li>連絡先（LINE等）の交換は自己責任で行ってください。</li>
          <li><strong>【重要】本ルールおよび利用規約は、今後のサービス拡充に伴い、予告なく追加・変更される場合があります。</strong></li>
        </ul>
      </section>
    </div>
  );
}
