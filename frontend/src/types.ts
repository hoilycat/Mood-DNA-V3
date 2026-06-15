// 앱 전역에서 공유하는 데이터 타입 정의

export type DnaProfile = Record<string, number>;

// 1단계(/analyze-metrics) 응답: 수치 지표만. AI 필드는 2단계(/analyze-critique)에서 합쳐짐.
export interface MoodDnaResult {
  brightness: number;
  complexity: number;
  saliency: number;
  symmetry: number;
  space: number;
  contrast: number;
  composition: number;
  aspect_ratio: number;
  color_count: number;
  typo_score: number;
  harmony_score: number;
  colors: string[];
  ocr_text?: string;
  // ── 이하 AI 비평 필드 (2단계 로드 전엔 undefined) ──
  category?: string;
  mood?: string;
  advice?: string;
  benchmarking_point?: string;
  design_keywords?: string[];
  suggested_palette?: string[];
  reference_images?: string[];
  total_score?: number;
  evaluation?: {
    brightness: string;
    complexity: string;
    typography: string;
    composition: string;
    color_harmony: string;
  };
  competency?: {
    identity: string;
    quality: string;
    fidelity: string;
  };
  action_checklist?: string[];
  market_analysis?: {
    estimated_days: number;
    estimated_value: number;
  };
  yie_critique?: {
    answer: string;
    sections: {
      recommendation: string | null;
    };
  } | null;
}

export interface HistoryRecord {
  id: number;
  created_at: string | null;
  industry: string;
  category: string;
  total_score: number | null;
  brightness: number;
  complexity: number;
  saliency: number;
  symmetry: number;
  space: number;
  colors: string[];
  metrics: Record<string, number>;
  mood: string;
  advice: string;
}

// 로딩 중 단계별 진행 상황 표시용 descriptor
export interface LoadingStage {
  title: string;
  subtitle: string;
  steps: string[];
  /** 현재 진행 중인 단계 인덱스. 그 앞 단계는 완료(✓), 뒤 단계는 대기로 표시된다. */
  activeStep: number;
}
