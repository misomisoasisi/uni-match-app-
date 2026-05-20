export const getAvatarUrl = (name: string, featureStr: string | null) => {
  let features: any = {};
  
  // JSON形式で保存されている場合のパース処理
  try {
    if (featureStr && featureStr.startsWith('{')) {
      features = JSON.parse(featureStr);
    }
  } catch (e) {
    console.error("Avatar feature parse error", e);
  }

  // 以前の古い形式（"&top=..."）の互換性サポート
  if (featureStr && !featureStr.startsWith('{')) {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=BaseAvatar${featureStr}&backgroundColor=transparent&accessoriesProbability=100&facialHairProbability=100`;
  }

  const params = new URLSearchParams();
  // 名前で顔が変わらないように固定のseedを使用する
  params.append('seed', 'BaseAvatar');
  params.append('backgroundColor', 'transparent');
  
  if (features.top) params.append('top', features.top);
  
  if (features.accessories) {
    params.append('accessories', features.accessories);
    // DiceBearの仕様で10%になってしまうのを100%に強制する
    params.append('accessoriesProbability', '100');
  }
  
  if (features.clothing) {
    params.append('clothing', features.clothing);
  }
  
  if (features.facialHair) {
    params.append('facialHair', features.facialHair);
    // DiceBearの仕様で確率を100%に強制する
    params.append('facialHairProbability', '100');
  }

  // 顔のカスタマイズ（肌、目、口、眉毛）
  if (features.skinColor) params.append('skinColor', features.skinColor);
  if (features.eyes) params.append('eyes', features.eyes);
  if (features.mouth) params.append('mouth', features.mouth);
  if (features.eyebrows) params.append('eyebrows', features.eyebrows);

  return `https://api.dicebear.com/7.x/avataaars/svg?${params.toString()}`;
};
