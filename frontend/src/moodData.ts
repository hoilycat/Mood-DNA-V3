// 무드 DNA 프리셋·라벨 데이터와 순수 계산 헬퍼 모음 (UI 비종속)
import type { DnaProfile } from './types';

export const industries = [
  'IT / 테크 스타트업',
  '카페 / 베이커리',
  '의료 / 제약',
  '하이엔드 패션 / 명품',
  '영화 / 엔터테인먼트',
  '박물관 / 예술 전시',
  '기타 (직접 입력)',
];

export const DNA_LABELS: Record<string, { label: string; short: string; desc: string }> = {
  brightness: { label: '밝기', short: 'Light', desc: '이미지가 얼마나 밝고 산뜻하게 느껴지는지' },
  complexity: { label: '복잡도', short: 'Dense', desc: '요소와 정보량이 얼마나 많은지' },
  saliency: { label: '주목도', short: 'Focus', desc: '시선이 한 지점으로 얼마나 강하게 모이는지' },
  symmetry: { label: '대칭성', short: 'Order', desc: '레이아웃이 얼마나 정돈되고 안정적인지' },
  space: { label: '여백', short: 'Space', desc: '숨 쉴 공간과 간격이 얼마나 충분한지' },
  contrast: { label: '대비', short: 'Edge', desc: '색과 명암 차이가 얼마나 또렷한지' },
  composition: { label: '구도', short: 'Frame', desc: '화면 배치와 균형이 얼마나 자연스러운지' },
  typo_score: { label: '타이포', short: 'Type', desc: '글자 위계와 읽기 흐름이 얼마나 좋은지' },
  harmony_score: { label: '조화도', short: 'Tone', desc: '색, 형태, 분위기가 얼마나 잘 어울리는지' },
};

export const VIBE_KEYWORDS: Record<string, DnaProfile> = {
  '#따뜻한': { brightness: 80, complexity: 30, saliency: 40, symmetry: 50, space: 75 },
  '#차가운': { brightness: 30, complexity: 40, saliency: 60, symmetry: 80, space: 50 },
  '#힙한': { brightness: 40, complexity: 85, saliency: 90, symmetry: 30, space: 25 },
  '#깔끔한': { brightness: 70, complexity: 15, saliency: 30, symmetry: 90, space: 90 },
  '#화려한': { brightness: 60, complexity: 95, saliency: 85, symmetry: 50, space: 20 },
  '#절제된': { brightness: 50, complexity: 10, saliency: 20, symmetry: 95, space: 95 },
  '#강렬한': { brightness: 45, complexity: 75, saliency: 95, symmetry: 40, space: 30 },
  '#친근한': { brightness: 85, complexity: 40, saliency: 45, symmetry: 55, space: 60 },
  '#미래적인': { brightness: 50, complexity: 70, saliency: 80, symmetry: 60, space: 40 },
  '#고전적인': { brightness: 40, complexity: 60, saliency: 50, symmetry: 85, space: 55 },
};

export const MOOD_DATABASE = {
  Natural_Soft: {
    Eco_Friendly: { brightness: 70, complexity: 30, saliency: 40, symmetry: 50, space: 70 },
    Beauty_Care: { brightness: 85, complexity: 20, saliency: 50, symmetry: 60, space: 85 },
    Cute_Kids: { brightness: 90, complexity: 50, saliency: 70, symmetry: 40, space: 40 },
    Healthcare: { brightness: 80, complexity: 25, saliency: 60, symmetry: 70, space: 75 },
    Travel_Nature: { brightness: 65, complexity: 40, saliency: 80, symmetry: 50, space: 60 },
    Vintage_Retro: { brightness: 55, complexity: 65, saliency: 50, symmetry: 45, space: 50 },
    Home_Living: { brightness: 75, complexity: 30, saliency: 40, symmetry: 80, space: 80 },
    Naive_Handcrafted: { brightness: 80, complexity: 25, saliency: 40, symmetry: 35, space: 80, saturation: 45, contrast: 40, roundness: 90, straightness: 10, smoothness: 15 },
  },
  Impact_Dynamic: {
    Gaming_Ent: { brightness: 40, complexity: 90, saliency: 90, symmetry: 30, space: 30 },
    Street_Fashion: { brightness: 30, complexity: 95, saliency: 80, symmetry: 20, space: 20 },
    Tech_AI: { brightness: 50, complexity: 70, saliency: 85, symmetry: 50, space: 50 },
    Street_Food: { brightness: 60, complexity: 80, saliency: 95, symmetry: 30, space: 30 },
    Avant_Garde: { brightness: 45, complexity: 85, saliency: 70, symmetry: 20, space: 45 },
    Sporty: { brightness: 55, complexity: 60, saliency: 85, symmetry: 40, space: 40 },
    Mobility: { brightness: 45, complexity: 75, saliency: 80, symmetry: 50, space: 50 },
  },
  Rational_Stable: {
    Education: { brightness: 60, complexity: 30, saliency: 40, symmetry: 95, space: 65 },
    Finance_Fintech: { brightness: 55, complexity: 35, saliency: 50, symmetry: 98, space: 70 },
    Luxury_HighEnd: { brightness: 40, complexity: 15, saliency: 30, symmetry: 90, space: 95 },
    RealEstate: { brightness: 50, complexity: 45, saliency: 40, symmetry: 95, space: 60 },
    Magazine: { brightness: 65, complexity: 50, saliency: 60, symmetry: 80, space: 80 },
    Minimal_Casual: { brightness: 70, complexity: 10, saliency: 20, symmetry: 85, space: 90 },
  },
  Artistic_Luxury: {
    Luxury_Classic: { brightness: 40, complexity: 15, saliency: 30, symmetry: 90, space: 95, saturation: 10, contrast: 90 },
    Museum_Exhibition: { brightness: 50, complexity: 40, saliency: 50, symmetry: 85, space: 80, saturation: 15, contrast: 75 },
    Magazine_Editorial: { brightness: 65, complexity: 50, saliency: 60, symmetry: 80, space: 80, saturation: 15, contrast: 85 },
    Minimal_Modern: { brightness: 70, complexity: 10, saliency: 20, symmetry: 85, space: 90, saturation: 10, contrast: 60 },
  },
  Retro_Vintage: {
    Y2K_Vibe: { brightness: 80, complexity: 85, saliency: 90, symmetry: 40, space: 30, saturation: 90, contrast: 80, roundness: 70, straightness: 30, smoothness: 20 },
    Classic_Film: { brightness: 50, complexity: 60, saliency: 50, symmetry: 70, space: 50, saturation: 40, contrast: 45, roundness: 50, straightness: 40, smoothness: 10 },
    Industrial_Rough: { brightness: 40, complexity: 90, saliency: 60, symmetry: 50, space: 40, saturation: 30, contrast: 70, roundness: 20, straightness: 80, smoothness: 5 },
  },
  Official_Standard: {
    Government: { brightness: 60, complexity: 20, saliency: 40, symmetry: 100, space: 70, saturation: 40, contrast: 70, roundness: 30, straightness: 90, smoothness: 95 },
    Law_Expert: { brightness: 30, complexity: 30, saliency: 50, symmetry: 95, space: 80, saturation: 20, contrast: 90, roundness: 10, straightness: 95, smoothness: 98 },
    Medical_Pro: { brightness: 85, complexity: 25, saliency: 60, symmetry: 90, space: 75, saturation: 30, contrast: 60, roundness: 60, straightness: 70, smoothness: 95 },
  },
  Commercial_Retail: {
    E_Commerce: { brightness: 90, complexity: 70, saliency: 95, symmetry: 80, space: 40, saturation: 85, contrast: 90, roundness: 50, straightness: 80, smoothness: 95 },
    Luxury_Mall: { brightness: 40, complexity: 15, saliency: 40, symmetry: 90, space: 95, saturation: 10, contrast: 95, roundness: 20, straightness: 85, smoothness: 98 },
    Food_Delivery: { brightness: 75, complexity: 65, saliency: 98, symmetry: 50, space: 30, saturation: 98, contrast: 85, roundness: 80, straightness: 20, smoothness: 90 },
  },
};

export type MoodEnergy = keyof typeof MOOD_DATABASE;

export const energyLabels: Record<MoodEnergy, string> = {
  Natural_Soft: 'Natural & Soft',
  Impact_Dynamic: 'Impact & Dynamic',
  Rational_Stable: 'Rational & Stable',
  Artistic_Luxury: 'Artistic & Luxury',
  Retro_Vintage: 'Retro & Vintage',
  Official_Standard: 'Official & Standard',
  Commercial_Retail: 'Commercial & Retail',
};

export const subMoodLabels: Record<string, string> = {
  Eco_Friendly: 'Eco Friendly',
  Beauty_Care: 'Beauty / Care',
  Cute_Kids: 'Cute / Kids',
  Healthcare: 'Healthcare',
  Travel_Nature: 'Travel / Nature',
  Vintage_Retro: 'Vintage / Retro',
  Home_Living: 'Home / Living',
  Naive_Handcrafted: 'Naive / Handcrafted',
  Gaming_Ent: 'Gaming / Entertainment',
  Street_Fashion: 'Street Fashion',
  Tech_AI: 'Tech / AI',
  Street_Food: 'Street Food',
  Avant_Garde: 'Avant-garde',
  Sporty: 'Sporty',
  Mobility: 'Mobility',
  Education: 'Education',
  Finance_Fintech: 'Finance / Fintech',
  Luxury_HighEnd: 'Luxury / High-end',
  RealEstate: 'Real Estate',
  Magazine: 'Magazine',
  Minimal_Casual: 'Minimal Casual',
  Luxury_Classic: 'Luxury Classic',
  Museum_Exhibition: 'Museum / Exhibition',
  Magazine_Editorial: 'Magazine Editorial',
  Minimal_Modern: 'Minimal Modern',
  Y2K_Vibe: 'Y2K Vibe',
  Classic_Film: 'Classic Film',
  Industrial_Rough: 'Industrial Rough',
  Government: 'Government',
  Law_Expert: 'Law / Expert',
  Medical_Pro: 'Medical Pro',
  E_Commerce: 'E-Commerce',
  Luxury_Mall: 'Luxury Mall',
  Food_Delivery: 'Food Delivery',
};

// 값을 0~100 척도로 정규화 (밝기는 0~255 입력이므로 max=255로 환산)
export const normalizeScore = (value?: number, max = 100) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  const normalized = max === 255 ? (value / 255) * 100 : value;
  return Math.max(0, Math.min(100, normalized));
};

// 기준 DNA에 선택된 바이브 태그들을 60:40 비율로 블렌딩
export const blendDNA = (baseDNA: DnaProfile, selectedTags: string[]) => {
  if (selectedTags.length === 0) return baseDNA;

  const averaged = selectedTags.reduce<DnaProfile>(
    (acc, tag) => {
      const vibe = VIBE_KEYWORDS[tag];
      Object.keys(vibe).forEach((key) => {
        acc[key] = (acc[key] || 0) + vibe[key];
      });
      return acc;
    },
    {}
  );

  Object.keys(averaged).forEach((key) => {
    averaged[key] = averaged[key] / selectedTags.length;
  });

  return Object.fromEntries(
    Object.entries(baseDNA).map(([key, value]) => [
      key,
      Math.round(value * 0.6 + (averaged[key] ?? value) * 0.4),
    ])
  );
};

// 브랜드 설명 텍스트에서 바이브 키워드를 추출
export const extractKeywords = (text: string) =>
  Object.keys(VIBE_KEYWORDS).filter((keyword) => text.includes(keyword.replace('#', '')));
