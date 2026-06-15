import { Check, ExternalLink, Loader2, Sparkles } from 'lucide-react';
import type { MoodDnaResult } from '../types';

export const RightPanel = ({ result, compResult, onSelectImage, critiqueLoading, critiqueError }: { result: MoodDnaResult | null; compResult: any; onSelectImage: (url: string) => void; critiqueLoading?: boolean; critiqueError?: string | null }) => {
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

  // 1단계(수치)만 도착하고 AI 비평이 아직 작성 중일 때
  if (critiqueLoading && !result?.advice) {
    return (
      <div className="panel-scroll">
        <section className="critique-card">
          <h3>AI Critique</h3>
          <div className="flex items-center gap-3 text-muted-custom">
            <Loader2 className="animate-spin" size={18} />
            <p className="text-sm">수치 분석 완료! AI가 비평을 작성하고 있어요…</p>
          </div>
        </section>
      </div>
    );
  }

  if (critiqueError && !result?.advice) {
    return (
      <div className="panel-scroll">
        <section className="critique-card">
          <h3>AI Critique</h3>
          <p className="text-sm text-muted-custom">{critiqueError}</p>
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
      {result?.yie_critique && (
        <section className="critique-card yie-card">
          <h3>📚 논문이 말하는 근거</h3>
          <p>{result.yie_critique.sections?.recommendation ?? result.yie_critique.answer}</p>
          <small className="mt-3 block text-xs text-muted-custom">YIE GraphRAG · 디자인 학술 논문 1,043개 청크 기반</small>
        </section>
      )}
      <section className="critique-card">
        <h3>Brand Identity</h3>
        <div className="flex items-end justify-between">
          <strong className="text-4xl font-black text-primary-custom">{result?.total_score ?? '-'}</strong>
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
            {result.reference_images?.slice(0, 4).map((url, index) => (
              <button key={`${url}-${index}`} onClick={() => onSelectImage(url)}>
                <img src={url} alt="" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </section>
      ) : null}
      {result?.category && (
        <button
          className="pinterest-button"
          onClick={() => window.open(`https://www.pinterest.com/search/pins/?q=${encodeURIComponent(`${result.category} ${result.design_keywords?.join(' ') ?? ''}`)}`, '_blank')}
        >
          <ExternalLink size={14} />
          Pinterest에서 더 보기
        </button>
      )}
    </div>
  );
};
