"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Check, User as UserIcon, Shirt, QrCode, Award } from "lucide-react";
import { updateProfile } from "../actions";
import { getAvatarUrl } from "@/lib/avatar";
import TagSelector from "@/components/TagSelector";
import MeetQrModal from "./MeetQrModal";

export default function ProfileForm({ initialProfile, meetsCount }: { initialProfile: any, meetsCount: number }) {
  const [profile, setProfile] = useState(initialProfile);
  const [showQrModal, setShowQrModal] = useState(false);

  const trophies = [
    {
      id: "first_meet",
      title: "ファーストコンタクト",
      description: "初めて誰かと出会う",
      icon: "🥉",
      target: 1,
      unlocked: meetsCount >= 1,
      color: "#d97706",
      bgColor: "rgba(217, 119, 6, 0.08)"
    },
    {
      id: "meet_5",
      title: "キャンパスの社交家",
      description: "5人のユーザーと出会う",
      icon: "🥈",
      target: 5,
      unlocked: meetsCount >= 5,
      color: "#94a3b8",
      bgColor: "rgba(148, 163, 184, 0.08)"
    },
    {
      id: "meet_10",
      title: "うにばのスター",
      description: "10人のユーザーと出会う",
      icon: "🥇",
      target: 10,
      unlocked: meetsCount >= 10,
      color: "#f59e0b",
      bgColor: "rgba(245, 158, 11, 0.08)"
    },
    {
      id: "meet_20",
      title: "レジェンド・オブ・うにば",
      description: "20人のユーザーと出会う",
      icon: "🏆",
      target: 20,
      unlocked: meetsCount >= 20,
      color: "#3b82f6",
      bgColor: "rgba(59, 130, 246, 0.08)"
    }
  ];


  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('face');
  const [avatarFeatures, setAvatarFeatures] = useState<any>({});

  useEffect(() => {
    try {
      if (initialProfile.feature && initialProfile.feature.startsWith('{')) {
        setAvatarFeatures(JSON.parse(initialProfile.feature));
      } else {
        // legacy support or default
        setAvatarFeatures({ top: 'shortFlat' });
      }
    } catch(e) {}
  }, [initialProfile.feature]);

  const handleFeatureChange = (key: string, value: string) => {
    const newFeatures = { ...avatarFeatures, [key]: value };
    if (!value) delete newFeatures[key];
    setAvatarFeatures(newFeatures);
    setProfile({ ...profile, feature: JSON.stringify(newFeatures) });
  };

  const handleSave = async () => {
    await updateProfile(profile.id, {
      name: profile.name,
      dept: profile.dept,
      tags: profile.tags,
      color: profile.color,
      feature: JSON.stringify(avatarFeatures),
      bio: profile.bio || ''
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const getBtnStyle = (clothingType: string) => ({
    border: '1px solid var(--border)', 
    padding: '0.8rem', 
    borderRadius: '8px',
    cursor: 'pointer',
    backgroundColor: avatarFeatures.clothing === clothingType ? 'var(--primary)' : 'transparent',
    color: avatarFeatures.clothing === clothingType ? 'white' : 'var(--text)',
    transition: 'all 0.2s',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: avatarFeatures.clothing === clothingType ? 'bold' : 'normal'
  });


  return (
    <>
      <div className="profile-header card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div className="profile-avatar large" style={{ width: '80px', height: '80px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: profile.color }}>
          <img src={getAvatarUrl(profile.name, JSON.stringify(avatarFeatures))} alt="My Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
        </div>
        <div className="profile-info">
          <h2>{profile.name}</h2>
          <p className="subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{profile.dept}</p>
          <div className="tags-container" style={{ justifyContent: 'flex-start', marginBottom: 0 }}>
            {profile.tags.split(',').filter((t: string) => t.trim()).map((tag: string) => (
              <span className="tag" key={tag}>{tag.trim()}</span>
            ))}
          </div>
        </div>
      </div>

      <button 
        onClick={() => setShowQrModal(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '1.1rem',
          backgroundColor: 'var(--primary)',
          color: 'white',
          border: 'none',
          borderRadius: '16px',
          cursor: 'pointer',
          width: '100%',
          justifyContent: 'center',
          fontSize: '1.05rem',
          fontWeight: 600,
          boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}
      >
        <QrCode size={22} />
        対面で出会いを記録（QRコード表示）
      </button>

      {showQrModal && (
        <MeetQrModal userId={profile.id} onClose={() => setShowQrModal(false)} />
      )}

      {/* トロフィー実績セクション */}
      <div className="card" style={{ marginTop: '1rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem' }}>
          <Award color="var(--primary)" /> 獲得したトロフィー ({trophies.filter(t => t.unlocked).length} / {trophies.length})
        </h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', backgroundColor: 'var(--surface-light)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '1.2rem' }}>
          <div style={{ fontSize: '1.8rem' }}>👥</div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>これまでに出会ったユニーク人数</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{meetsCount} 人</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {trophies.map(trophy => (
            <div 
              key={trophy.id} 
              style={{
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '1.2rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: trophy.unlocked ? trophy.bgColor : '#f8fafc',
                opacity: trophy.unlocked ? 1 : 0.6,
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: trophy.unlocked ? '0 4px 12px rgba(0,0,0,0.03)' : 'none'
              }}
            >
              {/* アイコン */}
              <div style={{ 
                fontSize: '2.5rem', 
                marginBottom: '0.5rem',
                filter: trophy.unlocked ? 'none' : 'grayscale(1) contrast(0.5)'
              }}>
                {trophy.icon}
              </div>
              
              <div style={{ 
                fontWeight: 'bold', 
                fontSize: '0.9rem', 
                color: trophy.unlocked ? 'var(--text-main)' : '#64748b',
                marginBottom: '0.25rem' 
              }}>
                {trophy.title}
              </div>
              
              <div style={{ 
                fontSize: '0.75rem', 
                color: 'var(--text-muted)',
                lineHeight: '1.3'
              }}>
                {trophy.description}
              </div>

              {/* 進行状況（未アンロック時） */}
              {!trophy.unlocked && (
                <div style={{ 
                  marginTop: '0.5rem', 
                  fontSize: '0.7rem', 
                  backgroundColor: '#e2e8f0', 
                  color: '#475569', 
                  padding: '2px 8px', 
                  borderRadius: '10px',
                  fontWeight: 'bold'
                }}>
                  {meetsCount} / {trophy.target} 人
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Settings /> プロフィール編集</h3>
        
        {/* Avatar Builder Section */}
        <div style={{ marginTop: '1.5rem', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem 1rem', backgroundColor: 'rgba(56, 189, 248, 0.1)', textAlign: 'center' }}>
            <div style={{ width: '140px', height: '140px', margin: '0 auto', backgroundColor: profile.color, borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <img src={getAvatarUrl(profile.name, JSON.stringify(avatarFeatures))} alt="Preview" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
            </div>
            <p style={{ marginTop: '0.8rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>アバタープレビュー</p>
          </div>

          <div className="filter-tabs" style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border)' }}>
            <button className={`tab ${activeTab === 'face' ? 'active' : ''}`} onClick={() => setActiveTab('face')}><UserIcon size={16} /> かお・髪型</button>
            <button className={`tab ${activeTab === 'clothes' ? 'active' : ''}`} onClick={() => setActiveTab('clothes')}><Shirt size={16} /> 服装（着せ替え）</button>
          </div>

          <div style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {activeTab === 'face' && (
              <>
                <div className="form-group">
                  <label>肌の色</label>
                  <select className="form-input" value={avatarFeatures.skinColor || ''} onChange={e => handleFeatureChange('skinColor', e.target.value)}>
                    <option value="">おまかせ</option>
                    <option value="ffdbb4">明るい肌色 (Light)</option>
                    <option value="edb98a">標準の肌色 (Medium)</option>
                    <option value="ae5d29">褐色 (Dark)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>目 (表情)</label>
                  <select className="form-input" value={avatarFeatures.eyes || ''} onChange={e => handleFeatureChange('eyes', e.target.value)}>
                    <option value="">おまかせ</option>
                    <option value="default">普通</option>
                    <option value="happy">笑顔</option>
                    <option value="wink">ウィンク</option>
                    <option value="hearts">ハート</option>
                    <option value="surprised">驚き</option>
                    <option value="squint">細目</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>口 (表情)</label>
                  <select className="form-input" value={avatarFeatures.mouth || ''} onChange={e => handleFeatureChange('mouth', e.target.value)}>
                    <option value="">おまかせ</option>
                    <option value="default">普通</option>
                    <option value="smile">微笑み</option>
                    <option value="twinkle">にっこり</option>
                    <option value="serious">真顔</option>
                    <option value="tongue">あっかんべー</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>眉毛</label>
                  <select className="form-input" value={avatarFeatures.eyebrows || ''} onChange={e => handleFeatureChange('eyebrows', e.target.value)}>
                    <option value="">おまかせ</option>
                    <option value="default">普通</option>
                    <option value="angry">怒り</option>
                    <option value="flatNatural">並行</option>
                    <option value="raisedExcited">ワクワク</option>
                    <option value="sad">困り眉</option>
                    <option value="unibrowNatural">つながり眉</option>
                    <option value="upDown">ちぐはぐ</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>髪型</label>
                  <select className="form-input" value={avatarFeatures.top || ''} onChange={e => handleFeatureChange('top', e.target.value)}>
                    <option value="">おまかせ</option>
                    <option value="shortFlat">ショートヘア</option>
                    <option value="straight01">ロングヘアー</option>
                    <option value="curly">カーリーヘア</option>
                    <option value="dreads">ドレッド</option>
                    <option value="bun">お団子</option>
                    <option value="straight02">ショートボブ</option>
                    <option value="shortRound">マッシュ</option>
                    <option value="shortWaved">ウェーブショート</option>
                    <option value="hat">キャップ</option>
                    <option value="hijab">ヒジャブ</option>
                    <option value="turban">ターバン</option>
                    <option value="winterHat01">ニット帽</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>メガネ・アクセサリー</label>
                  <select className="form-input" value={avatarFeatures.accessories || ''} onChange={e => handleFeatureChange('accessories', e.target.value)}>
                    <option value="">なし</option>
                    <option value="round">丸メガネ</option>
                    <option value="wayfarers">スクエアメガネ</option>
                    <option value="sunglasses">サングラス</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>ひげ</label>
                  <select className="form-input" value={avatarFeatures.facialHair || ''} onChange={e => handleFeatureChange('facialHair', e.target.value)}>
                    <option value="">なし</option>
                    <option value="beardMedium">あごひげ</option>
                    <option value="moustacheFancy">おしゃれヒゲ</option>
                  </select>
                </div>
              </>
            )}

            {activeTab === 'clothes' && (
              <>
                <div className="form-group">
                  <label>服装を選ぶ</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginTop: '0.5rem' }}>
                    <button style={getBtnStyle('shirtCrewNeck')} onClick={() => handleFeatureChange('clothing', 'shirtCrewNeck')}>
                      Tシャツ
                    </button>
                    <button style={getBtnStyle('blazerAndShirt')} onClick={() => handleFeatureChange('clothing', 'blazerAndShirt')}>
                      ブレザー
                    </button>
                    <button style={getBtnStyle('hoodie')} onClick={() => handleFeatureChange('clothing', 'hoodie')}>
                      パーカー 👑
                    </button>
                    <button style={getBtnStyle('overall')} onClick={() => handleFeatureChange('clothing', 'overall')}>
                      オーバーオール 👑
                    </button>
                    <button style={getBtnStyle('collarAndSweater')} onClick={() => handleFeatureChange('clothing', 'collarAndSweater')}>
                      セーター
                    </button>
                    <button style={getBtnStyle('graphicShirt')} onClick={() => handleFeatureChange('clothing', 'graphicShirt')}>
                      柄シャツ
                    </button>
                    <button style={getBtnStyle('shirtVNeck')} onClick={() => handleFeatureChange('clothing', 'shirtVNeck')}>
                      Vネック
                    </button>
                  </div>
                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label>服の色</label>
                    <input type="color" className="form-input" style={{ height: '40px', padding: '0.2rem', cursor: 'pointer' }} value={avatarFeatures.clothesColor ? `#${avatarFeatures.clothesColor.replace('#', '')}` : '#ffffff'} onChange={e => handleFeatureChange('clothesColor', e.target.value)} />
                  </div>
                  <div style={{ padding: '0.8rem', backgroundColor: 'rgba(251, 191, 36, 0.1)', borderRadius: '8px', marginTop: '1rem', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                    <p style={{ fontSize: '0.8rem', color: '#b45309', margin: 0 }}>👑 プレミアムアイテム（お試し期間中）<br/>将来的に課金やアプリ内コインで解放される特別な衣装のプロトタイプです。</p>
                  </div>
                </div>
              </>
            )}
            
            <div className="form-group" style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <label>背景色</label>
              <input type="color" className="form-input" style={{ height: '40px', padding: '0.2rem', cursor: 'pointer' }} value={profile.color} onChange={e => setProfile({...profile, color: e.target.value})} />
            </div>
          </div>
        </div>

        <form style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }} onSubmit={e => e.preventDefault()}>
          <div className="form-group">
            <label>なまえ</label>
            <input type="text" className="form-input" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label>学部・学年</label>
            <input type="text" className="form-input" value={profile.dept} onChange={e => setProfile({...profile, dept: e.target.value})} />
          </div>
          <div className="form-group">
            <label>自己紹介文</label>
            <textarea 
              className="form-input" 
              style={{ minHeight: '100px', resize: 'vertical' }} 
              value={profile.bio || ''} 
              onChange={e => setProfile({...profile, bio: e.target.value})} 
              placeholder="よろしくお願いします！"
            />
          </div>
          <div className="form-group">
            <label>趣味・性格タグ</label>
            <TagSelector value={profile.tags} onChange={tags => setProfile({...profile, tags})} />
          </div>
          
          <button type="button" className="primary-btn" style={{ justifyContent: 'center', marginTop: '1rem', padding: '1rem', fontSize: '1.1rem' }} onClick={handleSave}>
            {saved ? <><Check /> 保存しました！</> : <><Save /> アバターとプロフィールを保存</>}
          </button>
        </form>
      </div>
    </>
  );
}

