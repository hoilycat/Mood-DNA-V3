import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import axios from 'axios';
import {
  ChevronLeft,
  ChevronRight,
  Info,
  Loader2,
  Moon,
  Sparkles,
  Sun,
} from 'lucide-react';

import MoodDNASplash, { MoodDNAMark } from './MoodDNASplash';
import type { DnaProfile, HistoryRecord, LoadingStage, MoodDnaResult } from './types';
import {
  MOOD_DATABASE,
  VIBE_KEYWORDS,
  blendDNA,
  energyLabels,
  extractKeywords,
  industries,
  subMoodLabels,
  type MoodEnergy,
} from './moodData';
import { DnaRadarChart } from './components/DnaRadarChart';
import { CollapsedPanel, PanelHeader } from './components/Panels';
import { UploadBox } from './components/UploadBox';
import { LoadingState } from './components/LoadingState';
import { EmptyState } from './components/EmptyState';
import { SingleResult } from './components/SingleResult';
import { CompareResult } from './components/CompareResult';
import { BatchResult } from './components/BatchResult';
import { HistoryView } from './components/HistoryView';
import { RightPanel } from './components/RightPanel';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [context, setContext] = useState({
    industry: 'IT / 테크 스타트업',
    mainMood: 'Rational_Stable' as MoodEnergy,
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
  const [isHistoryMode, setIsHistoryMode] = useState(false);
  const [history, setHistory] = useState<HistoryRecord[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<LoadingStage | null>(null);
  const [critiqueLoading, setCritiqueLoading] = useState(false);
  const [critiqueError, setCritiqueError] = useState<string | null>(null);
  const [removeBg, setRemoveBg] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('mood-dna-theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);

  const currentBaseDna = useMemo(
    () => (MOOD_DATABASE as any)[context.mainMood][context.subMood] as DnaProfile,
    [context.mainMood, context.subMood]
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('mood-dna-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    const detectedTags = extractKeywords(context.description);
    setTargets(blendDNA(currentBaseDna, Array.from(new Set([...selectedTags, ...detectedTags]))));
  }, [context.description, currentBaseDna, selectedTags]);

  // 로딩 종료 시 스피너와 단계 표시를 함께 초기화
  const stopLoading = () => {
    setIsLoading(false);
    setLoadingStage(null);
  };

  const switchMode = (mode: 'single' | 'compare' | 'batch' | 'history') => {
    setIsCompareMode(mode === 'compare');
    setIsBatchMode(mode === 'batch');
    setIsHistoryMode(mode === 'history');
    setResult(null);
    setCompResult(null);
    setBatchResult(null);
    setCritiqueError(null);
    if (mode === 'history') loadHistory();
  };

  const loadHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE}/history`, { params: { limit: 30 } });
      setHistory(response.data);
    } catch {
      setHistory([]);
    }
  };

  const handleEnergySelect = (energy: MoodEnergy) => {
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
    setCritiqueError(null);

    try {
      if (isCompareMode) {
        setLoadingStage({
          title: 'A/B 비교 분석 중',
          subtitle: '두 디자인을 나란히 비교하고 있어요.',
          steps: ['이미지 업로드', '두 디자인 시각 지표 분석', 'AI 비교 평가 작성'],
          activeStep: 1,
        });
        const formData = new FormData();
        formData.append('target_dna', JSON.stringify(targets));
        formData.append('brand_context', JSON.stringify(context));
        formData.append('file1', file as File);
        formData.append('file2', file2 as File);
        const response = await axios.post(`${API_BASE}/compare`, formData);
        setCompResult(response.data);
        stopLoading();
        return;
      }

      // ── 1단계: 수치 지표 (수 초 내 응답 → 차트 즉시 표시) ──
      setLoadingStage({
        title: '디자인 DNA 분석 중',
        subtitle: '시각 지표를 빠르게 추출하고 있어요.',
        steps: ['이미지 업로드', '시각 지표 계산 (배경 제거 · OCR)', 'AI 비평 생성'],
        activeStep: 1,
      });
      const metricsForm = new FormData();
      metricsForm.append('file', file!);
      metricsForm.append('remove_bg', String(removeBg));
      const metricsRes = await axios.post(`${API_BASE}/analyze-metrics`, metricsForm);
      const metricsData: MoodDnaResult = metricsRes.data;
      setResult(metricsData);
      stopLoading();

      // ── 2단계: AI 비평 + YIE + 레퍼런스 (느림 → 도착하면 병합) ──
      setCritiqueLoading(true);
      try {
        const { ocr_text, ...metricsOnly } = metricsData;
        const critiqueForm = new FormData();
        critiqueForm.append('file', file!);
        critiqueForm.append('metrics', JSON.stringify(metricsOnly));
        critiqueForm.append('ocr_text', ocr_text ?? '');
        critiqueForm.append('target_dna', JSON.stringify(targets));
        critiqueForm.append('brand_context', JSON.stringify(context));
        const critiqueRes = await axios.post(`${API_BASE}/analyze-critique`, critiqueForm);
        setResult((prev) => ({ ...(prev ?? metricsData), ...critiqueRes.data }));
      } catch {
        setCritiqueError('AI 비평 생성에 실패했어요. 수치 분석 결과는 그대로 사용할 수 있습니다.');
      } finally {
        setCritiqueLoading(false);
      }
    } catch {
      stopLoading();
      alert('분석 실패 또는 API 할당량을 확인해주세요.');
    }
  };

  const analyzeBatch = async () => {
    if (!batchFiles || batchFiles.length === 0) {
      alert('파일들을 선택해주세요.');
      return;
    }

    setIsLoading(true);
    setLoadingStage({
      title: '배치 오디션 진행 중',
      subtitle: `${batchFiles.length}개 시안을 채점하고 순위를 매기고 있어요.`,
      steps: ['이미지 업로드', `${batchFiles.length}개 시안 지표 분석 & 채점`, 'AI 심사평 작성'],
      activeStep: 1,
    });
    const formData = new FormData();
    Array.from(batchFiles).forEach((batchFile) => formData.append('files', batchFile));
    formData.append('target_dna', JSON.stringify(targets));
    formData.append('brand_context', JSON.stringify(context));

    try {
      const response = await axios.post(`${API_BASE}/analyze-batch`, formData);
      setBatchResult(response.data);
    } catch {
      alert('폴더 분석에 실패했습니다.');
    } finally {
      stopLoading();
    }
  };

  const canAnalyze = isBatchMode ? Boolean(batchFiles?.length) : isCompareMode ? Boolean(file && file2) : Boolean(file);

  if (showSplash) return <MoodDNASplash onComplete={() => setShowSplash(false)} />;

  return (
    <div className="flex h-screen min-h-[680px] flex-col overflow-hidden bg-background text-foreground">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-panel px-5">
        <div className="flex items-center gap-3">
          <MoodDNAMark size={32} />
          <div>
            <h1 className="text-base font-black leading-none tracking-tight">
              Mood<span className="font-normal" style={{ color: '#2abfaa' }}>/</span>DNA
            </h1>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-custom">Design Intelligence for Designers</p>
          </div>
        </div>

        <div className="segmented">
          <button className={!isCompareMode && !isBatchMode && !isHistoryMode ? 'active' : ''} onClick={() => switchMode('single')}>Single</button>
          <button className={isCompareMode ? 'active' : ''} onClick={() => switchMode('compare')}>A/B Test</button>
          <button className={isBatchMode ? 'active' : ''} onClick={() => switchMode('batch')}>Batch</button>
          <button className={isHistoryMode ? 'active' : ''} onClick={() => switchMode('history')}>History</button>
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
                        onClick={() => handleEnergySelect(energy as MoodEnergy)}
                      >
                        <span>{energyLabels[energy as MoodEnergy]}</span>
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
                  <h2 className="text-label mb-3">Vibe Tags <span className="font-normal text-muted-custom">({selectedTags.length}/3)</span></h2>
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
          {!isHistoryMode && (
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
          )}

          <section className="result-scroll">
            {isHistoryMode ? (
              <HistoryView history={history} />
            ) : isLoading ? (
              <LoadingState stage={loadingStage} />
            ) : result ? (
              <SingleResult result={result} targets={targets} onSelectImage={setSelectedImg} critiqueLoading={critiqueLoading} />
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
              <RightPanel result={result} compResult={compResult} onSelectImage={setSelectedImg} critiqueLoading={critiqueLoading} critiqueError={critiqueError} />
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

export default App;
