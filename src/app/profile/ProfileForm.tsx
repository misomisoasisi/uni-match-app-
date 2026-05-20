"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Check, User as UserIcon, Shirt } from "lucide-react";
import { updateProfile } from "../actions";
import { getAvatarUrl } from "@/lib/avatar";
import TagSelector from "@/components/TagSelector";

export default function ProfileForm({ initialProfile }: { initialProfile: any }) {
  const [profile, setProfile] = useState(initialProfile);
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
      feature: JSON.stringify(avatarFeatures)
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
                  <label>髪型</label>
                  <select className="form-input" value={avatarFeatures.top || ''} onChange={e => handleFeatureChange('top', e.target.value)}>
                    <option value="">おまかせ</option>
                    <option value="shortFlat">ショートヘア</option>
                    <option value="straight01">ロングヘアー</option>
                    <option value="curly">カーリーヘア</option>
                    <option value="dreads">ドレッド</option>
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
