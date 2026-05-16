import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from 'react';
import axios from 'axios';
import {
  Activity,
  Briefcase,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Grid,
  ImageIcon,
  Info,
  Loader2,
  Maximize,
  Moon,
  Palette,
  Sparkles,
  Sun,
  Target,
  Upload,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import {
  PolarAngleAxis,
  PolarGrid,
  Radar as RechartsRadar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';

interface MoodDnaResult {
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
  category: string;
  mood: string;
  advice: string;
  benchmarking_point: string;
  design_keywords: string[];
  suggested_palette: string[];
  reference_images: string[];
  total_score: number;
  evaluation: {
    brightness: string;
    complexity: string;
    typography: string;
    composition: string;
    color_harmony: string;
  };
  competency: {
    identity: string;
    quality: string;
    fidelity: string;
  };
  action_checklist: string[];
  market_analysis?: {
    estimated_days: number;
    estimated_value: number;
  };
}

type DnaProfile = Record<string, number>;

const industries = [
  'IT / 테크 스타트업',
  '카페 / 베이커리',
  '의료 / 제약',
  '하이엔드 패션 / 명품',
  '영화 / 엔터테인먼트',
  '박물관 / 예술 전시',
  '기타 (직접 입력)',
];

const DNA_LABELS: Record<string, { label: string; short: string; desc: string }> = {
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

const VIBE_KEYWORDS: Record<string, DnaProfile> = {
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

const MOOD_DATABASE = {
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

const energyLabels: Record<keyof typeof MOOD_DATABASE, string> = {
  Natural_Soft: 'Natural & Soft',
  Impact_Dynamic: 'Impact & Dynamic',
  Rational_Stable: 'Rational & Stable',
  Artistic_Luxury: 'Artistic & Luxury',
  Retro_Vintage: 'Retro & Vintage',
  Official_Standard: 'Official & Standard',
  Commercial_Retail: 'Commercial & Retail',
};

const subMoodLabels: Record<string, string> = {
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

const normalizeScore = (value?: number, max = 100) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  const normalized = max === 255 ? (value / 255) * 100 : value;
  return Math.max(0, Math.min(100, normalized));
};

const blendDNA = (baseDNA: DnaProfile, selectedTags: string[]) => {
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

const extractKeywords = (text: string) =>
  Object.keys(VIBE_KEYWORDS).filter((keyword) => text.includes(keyword.replace('#', '')));

const DnaRadarChart = ({
  data,
  targetData,
  height = 260,
}: {
  data: DnaProfile;
  targetData?: DnaProfile;
  height?: number;
}) => {
  const chartData = Object.entries(DNA_LABELS)
    .filter(([key]) => typeof data[key] === 'number' || typeof targetData?.[key] === 'number')
    .map(([key, meta]) => ({
      subject: meta.label,
      short: meta.short,
      actual: normalizeScore(data[key], key === 'brightness' ? 255 : 100),
      target: targetData ? normalizeScore(targetData[key], key === 'brightness' ? 255 : 100) : undefined,
    }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="72%">
        <PolarGrid stroke="var(--color-border)" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fontSize: 12, fontWeight: 700, fill: 'var(--color-muted)' }}
        />
        {targetData && (
          <RechartsRadar
            name="Target"
            dataKey="target"
            stroke="var(--color-primary)"
            fill="var(--color-primary)"
            fillOpacity={0.08}
            strokeDasharray="4 4"
          />
        )}
        <RechartsRadar
          name="Actual"
          dataKey="actual"
          stroke="var(--color-primary-strong)"
          fill="var(--color-primary)"
          fillOpacity={0.28}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};

const StatBar = ({ label, value, max = 100 }: { label: string; value: number; max?: number }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-semibold text-muted-custom">{label}</span>
      <span className="font-mono text-sm font-bold text-primary-custom">{Math.round(normalizeScore(value, max))}</span>
    </div>
    <div className="stat-bar-container">
      <div className="stat-bar-fill" style={{ width: `${normalizeScore(value, max)}%` }} />
    </div>
  </div>
);

const StatCard = ({ label, value, max = 100, icon: Icon }: { label: string; value: number; max?: number; icon: LucideIcon }) => (
  <div className="stat-card">
    <div className="flex items-center justify-between">
      <span className="text-label flex items-center gap-2 normal-case tracking-normal">
        <Icon size={14} /> {label}
      </span>
      <span className="font-mono text-xl font-black text-primary-custom">{Math.round(normalizeScore(value, max))}</span>
    </div>
    <div className="stat-bar-container">
      <div className="stat-bar-fill" style={{ width: `${normalizeScore(value, max)}%` }} />
    </div>
  </div>
);

function App() {
  const [context, setContext] = useState({
    industry: 'IT / 테크 스타트업',
    mainMood: 'Rational_Stable' as keyof typeof MOOD_DATABASE,
    subMood: 'Finance_Fintech',
    description: '',
  });
  const [targets, setTargets] = useState<DnaProfile>(MOOD_DATABASE.Rational_Stable.Finance_Fintech);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [preview2, setPreview2] = useState<string | null>(null);
  const [batchFiles, setBatchFiles] = useState<FileList | null>(null);
  const [batchPreviews, setBatchPreviews] = useState<Record<string, string>>({});
  const [result, setResult] = useState<MoodDnaResult | null>(null);
  const [compResult, setCompResult] = useState<any | null>(null);
  const [batchResult, setBatchResult] = useState<any>(null);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [removeBg, setRemoveBg] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);

  const currentBaseDna = useMemo(
    () => (MOOD_DATABASE as any)[context.mainMood][context.subMood] as DnaProfile,
    [context.mainMood, context.subMood]
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  useEffect(() => {
    const detectedTags = extractKeywords(context.description);
    setTargets(blendDNA(currentBaseDna, Array.from(new Set([...selectedTags, ...detectedTags]))));
  }, [context.description, currentBaseDna, selectedTags]);

  const switchMode = (mode: 'single' | 'compare' | 'batch') => {
    setIsCompareMode(mode === 'compare');
    setIsBatchMode(mode === 'batch');
    setResult(null);
    setCompResult(null);
    setBatchResult(null);
  };

  const handleEnergySelect = (energy: keyof typeof MOOD_DATABASE) => {
    const firstSubMood = Object.keys(MOOD_DATABASE[energy])[0];
    setContext((prev) => ({ ...prev, mainMood: energy, subMood: firstSubMood }));
    setSelectedTags([]);
  };

  const handleSubMoodSelect = (subMood: string) => {
    setContext((prev) => ({ ...prev, subMood }));
    setSelectedTags([]);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) return prev.filter((item) => item !== tag);
      if (prev.length >= 3) return prev;
      return [...prev, tag];
    });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, id: number) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (id === 1) {
      if (preview) URL.revokeObjectURL(preview);
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      if (preview2) URL.revokeObjectURL(preview2);
      setFile2(selectedFile);
      setPreview2(URL.createObjectURL(selectedFile));
    }
    setResult(null);
    setCompResult(null);
  };

  const handleBatchFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    Object.values(batchPreviews).forEach(URL.revokeObjectURL);
    const nextPreviews: Record<string, string> = {};
    Array.from(e.target.files).forEach((batchFile) => {
      nextPreviews[batchFile.name] = URL.createObjectURL(batchFile);
    });
    setBatchFiles(e.target.files);
    setBatchPreviews(nextPreviews);
    setBatchResult(null);
  };

  const analyzeMood = async () => {
    if (isLoading) return;
    if (isCompareMode ? !file || !file2 : !file) {
      alert('이미지를 선택해주세요.');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('target_dna', JSON.stringify(targets));
    formData.append('brand_context', JSON.stringify(context));

    try {
      if (isCompareMode) {
        formData.append('file1', file);
        formData.append('file2', file2 as File);
        const response = await axios.post('http://127.0.0.1:8000/compare', formData);
        setCompResult(response.data);
      } else {
        formData.append('file', file);
        formData.append('remove_bg', String(removeBg));
        const response = await axios.post('http://127.0.0.1:8000/analyze', formData);
        setResult(response.data);
      }
    } catch {
      alert('분석 실패 또는 API 할당량을 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeBatch = async () => {
    if (!batchFiles || batchFiles.length === 0) {
      alert('파일들을 선택해주세요.');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    Array.from(batchFiles).forEach((batchFile) => formData.append('files', batchFile));
    formData.append('target_dna', JSON.stringify(targets));
    formData.append('brand_context', JSON.stringify(context));

    try {
      const response = await axios.post('http://127.0.0.1:8000/analyze-batch', formData);
      setBatchResult(response.data);
    } catch {
      alert('폴더 분석에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const canAnalyze = isBatchMode ? Boolean(batchFiles?.length) : isCompareMode ? Boolean(file && file2) : Boolean(file);

  return (
    <div className="flex h-screen min-h-[680px] flex-col overflow-hidden bg-background text-foreground">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-panel px-5">
        <div className="flex items-center gap-3">
          <svg className="h-8 w-8" viewBox="-100 -100 200 200" aria-hidden="true">
            <circle cx="0" cy="0" r="98" fill="var(--color-primary)" />
            <path d="M-24,-78 C-50,-39 50,0 24,0" fill="none" stroke="white" strokeWidth="8" strokeLinecap="round" />
            <path d="M24,0 C50,0 -50,39 -24,78" fill="none" stroke="white" strokeWidth="8" strokeLinecap="round" />
            <circle cx="-24" cy="-78" r="10" fill="white" />
            <circle cx="-24" cy="78" r="10" fill="white" />
            <circle cx="0" cy="0" r="12" fill="white" />
          </svg>
          <div>
            <h1 className="text-base font-black leading-none tracking-tight">Mood-DNA</h1>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-custom">Visual analysis studio</p>
          </div>
        </div>

        <div className="segmented">
          <button className={!isCompareMode && !isBatchMode ? 'active' : ''} onClick={() => switchMode('single')}>Single</button>
          <button className={isCompareMode ? 'active' : ''} onClick={() => switchMode('compare')}>A/B Test</button>
          <button className={isBatchMode ? 'active' : ''} onClick={() => switchMode('batch')}>Batch</button>
        </div>

        <div className="flex items-center gap-2">
          <button className="icon-button" onClick={() => setIsDark((prev) => !prev)} aria-label="Toggle theme">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div className="hidden rounded-md border border-border bg-card px-2 py-1 text-xs font-bold text-muted-custom sm:block">MD</div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className={`side-panel left-side ${isLeftCollapsed ? 'collapsed' : ''}`}>
          {isLeftCollapsed ? (
            <CollapsedPanel label="Settings" icon={<ChevronRight size={20} />} onClick={() => setIsLeftCollapsed(false)} />
          ) : (
            <>
              <PanelHeader title="Brand Settings" onCollapse={() => setIsLeftCollapsed(true)} direction="left" />
              <div className="panel-scroll">
                <section>
                  <h2 className="text-label mb-3">Brand Energy</h2>
                  <div className="space-y-1">
                    {Object.keys(MOOD_DATABASE).map((energy) => (
                      <button
                        key={energy}
                        className={`energy-item w-full ${context.mainMood === energy ? 'active' : ''}`}
                        onClick={() => handleEnergySelect(energy as keyof typeof MOOD_DATABASE)}
                      >
                        <span>{energyLabels[energy as keyof typeof MOOD_DATABASE]}</span>
                        {context.mainMood === energy && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-label mb-3">Taste / Category</h2>
                  <div className="submood-grid">
                    {Object.keys((MOOD_DATABASE as any)[context.mainMood]).map((subMood) => (
                      <button
                        key={subMood}
                        className={context.subMood === subMood ? 'selected' : ''}
                        onClick={() => handleSubMoodSelect(subMood)}
                      >
                        {subMoodLabels[subMood] || subMood}
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-label mb-3">Industry</h2>
                  <select
                    className="field"
                    value={industries.includes(context.industry) ? context.industry : '기타 (직접 입력)'}
                    onChange={(e) => setContext((prev) => ({ ...prev, industry: e.target.value === '기타 (직접 입력)' ? '' : e.target.value }))}
                  >
                    {industries.map((industry) => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                  {!industries.includes(context.industry) && (
                    <input
                      className="field mt-2"
                      placeholder="업종을 직접 입력하세요"
                      value={context.industry}
                      onChange={(e) => setContext((prev) => ({ ...prev, industry: e.target.value }))}
                    />
                  )}
                </section>

                <section>
                  <h2 className="text-label mb-3">Vibe Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(VIBE_KEYWORDS).map((tag) => (
                      <button key={tag} className={`tag-custom ${selectedTags.includes(tag) ? 'active' : ''}`} onClick={() => toggleTag(tag)}>
                        {tag}
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-label mb-3">Brand Description</h2>
                  <textarea
                    className="field min-h-24 resize-none"
                    placeholder="예: 따뜻한, 깔끔한, 미래적인 느낌의 브랜드..."
                    value={context.description}
                    onChange={(e) => setContext((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </section>

                <section className="sticky-chart">
                  <div className="mb-2 flex items-center justify-between">
                    <h2 className="text-label">Target DNA</h2>
                    <Info size={14} className="text-muted-custom" />
                  </div>
                  <div className="mini-chart">
                    <DnaRadarChart data={targets} height={180} />
                  </div>
                </section>
              </div>
            </>
          )}
        </aside>

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-background">
          <section className="upload-strip">
            {isBatchMode ? (
              <UploadBox title={batchFiles ? `${batchFiles.length} files selected` : 'Batch images'} subtitle="여러 이미지를 한 번에 비교합니다" multiple onChange={handleBatchFileChange} />
            ) : (
              <>
                <UploadBox title={file?.name || 'Upload design'} subtitle="분석할 이미지를 선택하세요" preview={preview} onChange={(e) => handleFileChange(e, 1)} />
                {isCompareMode && (
                  <UploadBox title={file2?.name || 'Upload variant'} subtitle="비교할 두 번째 이미지를 선택하세요" preview={preview2} onChange={(e) => handleFileChange(e, 2)} />
                )}
              </>
            )}
            {!isCompareMode && !isBatchMode && (
              <label className="remove-bg-toggle">
                <input type="checkbox" checked={removeBg} onChange={(e) => setRemoveBg(e.target.checked)} />
                배경 제거
              </label>
            )}
            <button className="btn-primary-custom min-w-36" disabled={isLoading || !canAnalyze} onClick={isBatchMode ? analyzeBatch : analyzeMood}>
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
              {isLoading ? 'Analyzing' : 'Analyze'}
            </button>
          </section>

          <section className="result-scroll">
            {isLoading ? (
              <LoadingState />
            ) : result ? (
              <SingleResult result={result} targets={targets} onSelectImage={setSelectedImg} />
            ) : compResult ? (
              <CompareResult compResult={compResult} targets={targets} />
            ) : batchResult ? (
              <BatchResult batchResult={batchResult} batchPreviews={batchPreviews} />
            ) : (
              <EmptyState targets={targets} />
            )}
          </section>
        </main>

        <aside className={`side-panel right-side ${isRightCollapsed ? 'collapsed' : ''}`}>
          {isRightCollapsed ? (
            <CollapsedPanel label="Critique" icon={<ChevronLeft size={20} />} onClick={() => setIsRightCollapsed(false)} />
          ) : (
            <>
              <PanelHeader title="AI Critique" onCollapse={() => setIsRightCollapsed(true)} direction="right" />
              <RightPanel result={result} compResult={compResult} onSelectImage={setSelectedImg} />
            </>
          )}
        </aside>
      </div>

      {selectedImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setSelectedImg(null)}>
          <img src={selectedImg} alt="확대 이미지" className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-2xl" />
        </div>
      )}
    </div>
  );
}

const PanelHeader = ({ title, onCollapse, direction }: { title: string; onCollapse: () => void; direction: 'left' | 'right' }) => (
  <div className="flex items-center justify-between border-b border-border px-4 py-4">
    <h2 className="text-label">{title}</h2>
    <button className="icon-button small" onClick={onCollapse} aria-label="Collapse panel">
      {direction === 'left' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
    </button>
  </div>
);

const CollapsedPanel = ({ label, icon, onClick }: { label: string; icon: ReactNode; onClick: () => void }) => (
  <div className="flex h-full flex-col items-center gap-8 py-5">
    <button className="icon-button small" onClick={onClick} aria-label={`Open ${label}`}>{icon}</button>
    <div className="vertical-text text-[10px] font-black uppercase tracking-[0.2em] text-muted-custom">{label}</div>
  </div>
);

const UploadBox = ({
  title,
  subtitle,
  preview,
  multiple,
  onChange,
}: {
  title: string;
  subtitle: string;
  preview?: string | null;
  multiple?: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) => (
  <label className="upload-box">
    {preview ? (
      <img src={preview} alt="" className="h-14 w-14 rounded-md border border-border object-cover" />
    ) : (
      <div className="upload-icon"><Upload size={20} /></div>
    )}
    <div className="min-w-0">
      <p className="truncate text-sm font-bold text-foreground">{title}</p>
      <p className="truncate text-xs text-muted-custom">{subtitle}</p>
    </div>
    <input type="file" className="hidden" accept="image/*" multiple={multiple} onChange={onChange} />
  </label>
);

const LoadingState = () => (
  <div className="flex h-full min-h-96 flex-col items-center justify-center gap-5 text-center">
    <div className="relative h-24 w-24">
      <div className="absolute inset-0 rounded-full border border-primary opacity-30 animate-ping" />
      <div className="h-24 w-24 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
    <div>
      <h2 className="text-2xl font-black text-primary-custom">디자인 DNA 분석 중</h2>
      <p className="mt-2 text-sm text-muted-custom">시각 지표와 브랜드 적합도를 계산하고 있어요.</p>
    </div>
  </div>
);

const EmptyState = ({ targets }: { targets: DnaProfile }) => (
  <div className="mx-auto flex max-w-4xl flex-col gap-6">
    <div className="chart-box">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black">Target Mood DNA</h2>
          <p className="text-sm text-muted-custom">왼쪽 설정을 바꾸면 목표 차트가 바로 업데이트됩니다.</p>
        </div>
        <Target className="text-primary-custom" size={22} />
      </div>
      <DnaRadarChart data={targets} height={340} />
    </div>
    <RadarLegend />
  </div>
);

const SingleResult = ({ result, targets, onSelectImage }: { result: MoodDnaResult; targets: DnaProfile; onSelectImage: (url: string) => void }) => (
  <div className="mx-auto max-w-6xl space-y-5">
    <div className="grid gap-5 xl:grid-cols-5">
      <div className="chart-box xl:col-span-2">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-label">DNA Match</h2>
          <span className="score-pill">{result.total_score} / 100</span>
        </div>
        <DnaRadarChart data={result as unknown as DnaProfile} targetData={targets} height={320} />
      </div>
      <div className="chart-box xl:col-span-3">
        <h2 className="text-label mb-5">Visual Metrics</h2>
        <div className="grid gap-x-8 gap-y-5 md:grid-cols-2">
          <StatBar label="밝기 Brightness" value={result.brightness} max={255} />
          <StatBar label="대비 Contrast" value={result.contrast} />
          <StatBar label="조화도 Harmony" value={result.harmony_score} />
          <StatBar label="복잡도 Complexity" value={result.complexity} />
          <StatBar label="대칭성 Symmetry" value={result.symmetry} />
          <StatBar label="주목도 Saliency" value={result.saliency} />
        </div>
      </div>
    </div>

    <RadarLegend />

    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard label="Typography" value={result.typo_score} icon={Activity} />
      <StatCard label="Composition" value={result.composition} icon={Grid} />
      <StatCard label="Space" value={result.space} icon={Maximize} />
      <StatCard label="Colors" value={Math.min(result.color_count * 12, 100)} icon={Palette} />
    </div>

    <div className="grid gap-5 lg:grid-cols-2">
      <div className="chart-box">
        <h2 className="text-label mb-4">Color DNA</h2>
        <div className="palette-strip">
          {result.colors?.map((color) => (
            <button key={color} style={{ backgroundColor: color }} onClick={() => navigator.clipboard.writeText(color)} title={color} />
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {result.design_keywords?.map((keyword) => <span className="keyword" key={keyword}>{keyword}</span>)}
        </div>
      </div>
      <div className="chart-box">
        <h2 className="text-label mb-4">Evaluation</h2>
        <div className="space-y-3">
          {Object.entries(result.evaluation || {}).map(([key, value]) => (
            <div className="evaluation-row" key={key}>
              <span>{key.replace('_', ' ')}</span>
              <p>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>

    {result.reference_images?.length > 0 && (
      <div className="chart-box">
        <h2 className="text-label mb-4">References</h2>
        <div className="reference-grid">
          {result.reference_images.map((url, index) => (
            <button key={`${url}-${index}`} onClick={() => onSelectImage(url)}>
              <img src={url} alt={`Reference ${index + 1}`} referrerPolicy="no-referrer" />
            </button>
          ))}
        </div>
      </div>
    )}
  </div>
);

const CompareResult = ({ compResult, targets }: { compResult: any; targets: DnaProfile }) => (
  <div className="mx-auto max-w-5xl space-y-5">
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="chart-box">
        <h2 className="text-label mb-3">Design A</h2>
        <DnaRadarChart data={compResult.dna1 || {}} targetData={targets} height={280} />
        <p className="mt-3 text-center text-3xl font-black text-primary-custom">{compResult.score1 ?? '-'}</p>
      </div>
      <div className="chart-box">
        <h2 className="text-label mb-3">Design B</h2>
        <DnaRadarChart data={compResult.dna2 || {}} targetData={targets} height={280} />
        <p className="mt-3 text-center text-3xl font-black text-primary-custom">{compResult.score2 ?? '-'}</p>
      </div>
    </div>
    <div className="chart-box border-l-4 border-l-primary">
      <h2 className="text-xl font-black">{compResult.comparison?.winner ? `${compResult.comparison.winner}안이 더 적합합니다` : '비교 분석'}</h2>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-muted-custom">{compResult.comparison?.detail_comparison || compResult.verdict || compResult.comparison?.summary}</p>
    </div>
  </div>
);

const BatchResult = ({ batchResult, batchPreviews }: { batchResult: any; batchPreviews: Record<string, string> }) => (
  <div className="mx-auto max-w-5xl space-y-5">
    <div className="chart-box">
      <h2 className="text-2xl font-black">Batch Audition Report</h2>
      <p className="mt-2 text-sm leading-6 text-muted-custom">{batchResult.master_report?.winner_review}</p>
    </div>
    <div className="space-y-3">
      {batchResult.ranking?.map((item: any, index: number) => (
        <div className="ranking-row" key={`${item.filename}-${index}`}>
          <span className="rank">{index + 1}</span>
          {batchPreviews[item.filename] ? <img src={batchPreviews[item.filename]} alt="" /> : <ImageIcon />}
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold">{item.filename}</p>
            <p className="text-xs text-muted-custom">DNA Match</p>
          </div>
          <strong>{item.score} pt</strong>
        </div>
      ))}
    </div>
  </div>
);

const RadarLegend = () => (
  <div className="chart-box">
    <h2 className="text-label mb-4">방사형 차트 읽는 법</h2>
    <div className="legend-grid">
      {Object.entries(DNA_LABELS).slice(0, 7).map(([key, item]) => (
        <div key={key}>
          <strong>{item.label}</strong>
          <span>{item.desc}</span>
        </div>
      ))}
    </div>
  </div>
);

const RightPanel = ({ result, compResult, onSelectImage }: { result: MoodDnaResult | null; compResult: any; onSelectImage: (url: string) => void }) => {
  if (!result && !compResult) {
    return (
      <div className="panel-scroll flex items-center justify-center text-center">
        <div className="space-y-3 text-muted-custom">
          <Sparkles className="mx-auto opacity-40" size={34} />
          <p className="text-xs font-black uppercase tracking-[0.2em]">Waiting for DNA</p>
        </div>
      </div>
    );
  }

  if (compResult) {
    return (
      <div className="panel-scroll">
        <section className="critique-card">
          <h3>Comparison</h3>
          <p>{compResult.comparison?.summary || compResult.verdict}</p>
        </section>
      </div>
    );
  }

  return (
    <div className="panel-scroll">
      <section className="critique-card">
        <h3>Overall Mood</h3>
        <p>{result?.mood}</p>
      </section>
      <section className="critique-card">
        <h3>Brand Identity</h3>
        <div className="flex items-end justify-between">
          <strong className="text-4xl font-black text-primary-custom">{result?.total_score}</strong>
          <span className="text-xs font-bold text-muted-custom">/ 100</span>
        </div>
        <div className="stat-bar-container">
          <div className="stat-bar-fill" style={{ width: `${result?.total_score || 0}%` }} />
        </div>
      </section>
      <section className="critique-card">
        <h3>Suggestion</h3>
        <p>{result?.advice}</p>
      </section>
      <section className="critique-card">
        <h3>Checklist</h3>
        <div className="space-y-2">
          {result?.action_checklist?.slice(0, 4).map((item) => (
            <div className="check-row" key={item}>
              <Check size={13} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>
      {result?.reference_images?.length ? (
        <section className="critique-card">
          <h3>References</h3>
          <div className="right-ref-grid">
            {result.reference_images.slice(0, 4).map((url, index) => (
              <button key={`${url}-${index}`} onClick={() => onSelectImage(url)}>
                <img src={url} alt="" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </section>
      ) : null}
      {result && (
        <button
          className="pinterest-button"
          onClick={() => window.open(`https://www.pinterest.com/search/pins/?q=${encodeURIComponent(`${result.category} ${result.design_keywords?.join(' ')}`)}`, '_blank')}
        >
          <ExternalLink size={14} />
          Pinterest에서 더 보기
        </button>
      )}
    </div>
  );
};

export default App;
