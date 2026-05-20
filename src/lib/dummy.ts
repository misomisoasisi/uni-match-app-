export const dummyUsers = [
  { id: 1, name: 'Takuya', dept: '経済学部 2年', char: 'ENFP', tags: ['カフェ巡り', '映画鑑賞'], color: '#e0f2fe', avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=Takuya&backgroundColor=transparent' },
  { id: 2, name: 'Saki', dept: '文学部 1年', char: 'ISFJ', tags: ['読書', '写真'], color: '#ffe4e6', avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=Saki&hair=pixie&backgroundColor=transparent' },
  { id: 3, name: 'Kenji', dept: '工学部 3年', char: 'INTP', tags: ['ゲーム', 'プログラミング'], color: '#dcfce7', avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=Kenji&glasses=round&backgroundColor=transparent' },
  { id: 4, name: 'Yui', dept: '商学部 2年', char: 'ESFP', tags: ['旅行', 'K-POP'], color: '#ede9fe', avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=Yui&hair=full&backgroundColor=transparent' },
  { id: 5, name: 'Daiki', dept: '理学部 4年', char: 'INTJ', tags: ['アニメ', 'ガジェット'], color: '#fef3c7', avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=Daiki&facialHair=beard&backgroundColor=transparent' }
];

export const dummyTextbooks = [
  { id: 1, title: 'ミクロ経済学 第3版', class: '経済学基礎', seller: 'Takuya (経2)', price: '¥1,500', note: '書き込み少しあります。過去問のコツ教えます！' },
  { id: 2, title: '基礎線形代数', class: '線形代数I', seller: 'Kenji (工3)', price: '無料譲渡', note: 'もう使わないので差し上げます。' },
  { id: 3, title: '心理学概論', class: '心理学A', seller: 'Saki (文1)', price: '¥800', note: 'ほぼ新品です。' },
];

export const dummyGatherings = [
  { id: 1, title: '【新入生歓迎】駅前のイタリアンでランチ🍽️', date: '今日 12:30', place: 'サイゼリヤ 駅前店', type: 'ご飯', members: [dummyUsers[1], dummyUsers[3]], tags: ['気軽', '初対面歓迎', '女子多め'] },
  { id: 2, title: '金曜夜！学部問わずボードゲームしながら飲み会🍻', date: '明日 19:00', place: 'HUB 大学前店', type: '飲み会', members: [dummyUsers[0], dummyUsers[2], dummyUsers[4]], tags: ['ボドゲ', 'お酒好き', 'ワイワイ'] }
];
