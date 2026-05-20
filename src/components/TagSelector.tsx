"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";

const TAG_CATEGORIES = [
  {
    name: "性格・スタイル",
    tags: ["ENFP", "INFP", "ESFJ", "INTJ", "マイペース", "インドア派", "アウトドア派", "聞き上手", "寂しがりや", "フットワーク軽め", "朝型", "夜行性", "HSP", "ポジティブ", "のんびり", "好奇心旺盛"]
  },
  {
    name: "アニメ・漫画",
    tags: ["鬼滅の刃", "呪術廻戦", "進撃の巨人", "ハイキュー!!", "ヒロアカ", "ワンピース", "名探偵コナン", "スパイファミリー", "推しの子", "葬送のフリーレン", "チェンソーマン", "ブルーロック", "薬屋のひとりごと", "エヴァンゲリオン", "ジブリ", "マッシュル", "怪獣8号"]
  },
  {
    name: "ゲーム",
    tags: ["原神", "APEX", "Valorant", "スプラトゥーン3", "モンハン", "ポケモン", "あつ森", "スマブラ", "マイクラ", "プロセカ", "第五人格", "LoL", "荒野行動"]
  },
  {
    name: "趣味・好き",
    tags: ["カフェ巡り", "映画鑑賞", "読書", "音楽鑑賞", "旅行", "カメラ・写真", "料理", "筋トレ", "カラオケ", "ドライブ", "古着巡り", "散歩", "サウナ", "ショッピング", "美術館巡り", "スポーツ観戦", "キャンプ", "麻雀", "猫好き", "犬好き", "甘党", "辛党", "お酒好き"]
  },
  {
    name: "音楽",
    tags: ["J-POP", "K-POP", "邦ロック", "ボカロ", "洋楽", "HipHop", "クラシック", "アイドル推し", "ライブ好き", "フェス好き"]
  },
  {
    name: "大学生活",
    tags: ["一人暮らし", "実家暮らし", "サークル探し中", "バイト探し中", "フル単目指す", "ぼっち回避", "一緒に全休したい", "図書館の民", "学食大好き", "課題に追われてる"]
  }
];

interface TagSelectorProps {
  value: string; // カンマ区切りの文字列
  onChange: (value: string) => void;
}

export default function TagSelector({ value, onChange }: TagSelectorProps) {
  const [activeCategory, setActiveCategory] = useState(0);
  const [customTag, setCustomTag] = useState("");

  const currentTags = value ? value.split(",").map(t => t.trim()).filter(Boolean) : [];

  const addTag = (tag: string) => {
    if (!tag) return;
    if (currentTags.includes(tag)) {
      removeTag(tag); // すでにあれば削除（トグル）
      return;
    }
    const newTags = [...currentTags, tag];
    onChange(newTags.join(", "));
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = currentTags.filter(tag => tag !== tagToRemove);
    onChange(newTags.join(", "));
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTag.trim()) {
      addTag(customTag.trim());
      setCustomTag("");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* 選択済みタグの表示エリア */}
      <div style={{ 
        minHeight: '40px', 
        padding: '0.5rem', 
        border: '1px solid var(--border)', 
        borderRadius: '8px', 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '0.5rem',
        backgroundColor: 'var(--surface)'
      }}>
        {currentTags.length === 0 && (
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '0.2rem' }}>
            まだタグがありません。下から選ぶか、入力して追加してください！
          </span>
        )}
        {currentTags.map(tag => (
          <span key={tag} style={{ 
            backgroundColor: 'var(--primary)', 
            color: 'white', 
            padding: '0.3rem 0.6rem', 
            borderRadius: '16px', 
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}>
            #{tag}
            <X size={14} style={{ cursor: 'pointer', opacity: 0.8 }} onClick={() => removeTag(tag)} />
          </span>
        ))}
      </div>

      {/* 自由入力エリア */}
      <form onSubmit={handleCustomSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
        <input 
          type="text" 
          className="input-field" 
          placeholder="自分でタグを入力してEnter" 
          value={customTag}
          onChange={(e) => setCustomTag(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit" className="icon-btn" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}>
          <Plus size={20} />
        </button>
      </form>

      {/* カテゴリ別プリセット選択エリア */}
      <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
        {/* カテゴリタブ */}
        <div style={{ display: 'flex', overflowX: 'auto', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--background)' }}>
          {TAG_CATEGORIES.map((cat, idx) => (
            <button 
              key={cat.name}
              type="button"
              onClick={() => setActiveCategory(idx)}
              style={{
                padding: '0.6rem 1rem',
                border: 'none',
                borderBottom: activeCategory === idx ? '2px solid var(--primary)' : '2px solid transparent',
                backgroundColor: 'transparent',
                color: activeCategory === idx ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: activeCategory === idx ? 'bold' : 'normal',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontSize: '0.85rem'
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* タグチップ一覧 */}
        <div style={{ padding: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
          {TAG_CATEGORIES[activeCategory].tags.map(tag => {
            const isSelected = currentTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '16px',
                  border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)',
                  backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'var(--background)',
                  color: isSelected ? 'var(--primary)' : 'var(--text)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                #{tag}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
