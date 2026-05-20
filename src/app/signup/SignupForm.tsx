"use client";

import { useState } from "react";
import { registerUser, loginAsGuest } from "../actions";
import Link from "next/link";
import TagSelector from "@/components/TagSelector";

const tduData: Record<string, string[]> = {
  "システムデザイン工学部": ["情報システム工学科", "デザイン工学科"],
  "未来科学部": ["建築学科", "情報メディア学科", "ロボット・メカトロニクス学科"],
  "工学部": ["電気電子工学科", "電子システム工学科", "応用化学科", "機械工学科", "先端機械工学科", "情報通信工学科"],
  "工学部第二部": ["電気電子工学科", "機械工学科", "情報通信工学科"],
  "理工学部": ["理学系", "生命科学系", "情報システムデザイン学系", "電子・機械工学系", "建築・都市環境学系"],
  "情報環境学部": ["情報環境学科"]
};

const years = ["1年", "2年", "3年", "4年", "修士1年", "修士2年", "博士", "卒業生"];

export default function SignupForm() {
  const [formData, setFormData] = useState({ name: '', email: '', pass: '' });
  const [faculty, setFaculty] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [gender, setGender] = useState("");
  const [tags, setTags] = useState("");

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !faculty || !department || !year || !formData.email || !formData.pass || !gender) {
      setError('すべての項目を入力してください。');
      return;
    }
    setLoading(true);
    const combinedDept = `${faculty} ${department} ${year}`;
    
    const res = await registerUser({
      name: formData.name,
      email: formData.email,
      pass: formData.pass,
      dept: combinedDept,
      gender,
      tags
    });

    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
      <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>うにばーしてぃ</h1>
      <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>新規アカウント登録</p>
      
      <form onSubmit={handleSubmit} className="card" style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem' }}>
        {error && <div style={{ color: 'red', fontSize: '0.9rem', marginBottom: '1rem' }}>{error}</div>}
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>表示名（ニックネーム可）</label>
          <input 
            type="text" 
            className="input-field" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            placeholder="例: たくや"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>学部</label>
          <select 
            className="input-field"
            value={faculty}
            onChange={(e) => {
              setFaculty(e.target.value);
              setDepartment(""); // 学部が変わったら学科をリセット
            }}
          >
            <option value="">選択してください</option>
            {Object.keys(tduData).map(fac => (
              <option key={fac} value={fac}>{fac}</option>
            ))}
          </select>
        </div>

        {faculty && (
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>学科・学系</label>
            <select 
              className="input-field"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="">選択してください</option>
              {tduData[faculty].map(dep => (
                <option key={dep} value={dep}>{dep}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>学年</label>
          <select 
            className="input-field"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <option value="">選択してください</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>性別</label>
          <select 
            className="input-field"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="">選択してください</option>
            <option value="男性">男性</option>
            <option value="女性">女性</option>
            <option value="その他・回答しない">その他・回答しない</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>趣味タグ</label>
          <TagSelector value={tags} onChange={setTags} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>メールアドレス</label>
          <input 
            type="email" 
            className="input-field" 
            value={formData.email} 
            onChange={e => setFormData({...formData, email: e.target.value})} 
            placeholder="example@dendai.ac.jp"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>パスワード</label>
          <input 
            type="password" 
            className="input-field" 
            value={formData.pass} 
            onChange={e => setFormData({...formData, pass: e.target.value})} 
            placeholder="8文字以上推奨"
          />
        </div>

        <button type="submit" className="primary-btn" disabled={loading} style={{ marginTop: '1rem', justifyContent: 'center' }}>
          {loading ? '登録中...' : 'アカウントを作成'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', margin: '0.5rem 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }}></div>
          <span style={{ padding: '0 1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>または</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }}></div>
        </div>

        <button 
          type="button" 
          onClick={async () => {
            setLoading(true);
            await loginAsGuest();
            window.location.href = "/";
          }}
          disabled={loading} 
          style={{ 
            padding: '0.8rem', 
            borderRadius: '8px', 
            border: '1px solid var(--border)', 
            backgroundColor: 'var(--surface)', 
            color: 'var(--text)', 
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          アカウントを作らずにゲストでログイン
        </button>

        <p style={{ marginTop: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>
          すでにアカウントをお持ちですか？ <Link href="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>ログイン</Link>
        </p>
      </form>
    </div>
  );
}
