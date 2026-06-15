import { ImageIcon, Trophy } from 'lucide-react';
import type { DnaProfile } from '../types';
import { DnaRadarChart } from './DnaRadarChart';
import { DNA_LABELS, normalizeScore } from '../moodData';

// 순위 행에 요약으로 보여줄 핵심 지표
const ROW_METRICS: { key: string; label: string }[] = [
  { key: 'complexity', label: '복잡도' },
  { key: 'space', label: '여백' },
  { key: 'symmetry', label: '대칭' },
  { key: 'saliency', label: '주목도' },
];

export const BatchResult = ({
  batchResult,
  batchPreviews,
  targets,
}: {
  batchResult: any;
  batchPreviews: Record<string, string>;
  targets: DnaProfile;
}) => {
  const ranking: any[] = batchResult.ranking ?? [];
  const winner = ranking[0];

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="chart-box">
        <h2 className="text-2xl font-black">Batch Audition Report</h2>
        <p className="mt-2 text-sm leading-6 text-muted-custom">{batchResult.master_report?.winner_review}</p>
      </div>

      {/* 1위 시안 DNA 스포트라이트 — 백엔드가 내려준 9개 지표를 타깃과 비교 */}
      {winner?.dna && (
        <div className="grid gap-5 lg:grid-cols-5">
          <div className="chart-box lg:col-span-3">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-label flex items-center gap-2"><Trophy size={14} /> Winner DNA Match</h2>
              <span className="score-pill">{winner.score} / 100</span>
            </div>
            <DnaRadarChart data={winner.dna as DnaProfile} targetData={targets} height={300} />
            <p className="mt-2 truncate text-center text-xs text-muted-custom">{winner.filename}</p>
          </div>
          <div className="chart-box lg:col-span-2">
            <h2 className="text-label mb-4">Winner Metrics</h2>
            <div className="space-y-4">
              {Object.entries(DNA_LABELS)
                .filter(([key]) => typeof winner.dna[key] === 'number')
                .map(([key, meta]) => {
                  const value = normalizeScore(winner.dna[key], key === 'brightness' ? 255 : 100);
                  return (
                    <div key={key} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-muted-custom">{meta.label}</span>
                        <span className="font-mono text-sm font-bold text-primary-custom">{Math.round(value)}</span>
                      </div>
                      <div className="stat-bar-container">
                        <div className="stat-bar-fill" style={{ width: `${value}%` }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {ranking.map((item: any, index: number) => (
          <div className="ranking-row" key={`${item.filename}-${index}`}>
            <span className="rank">{index + 1}</span>
            {batchPreviews[item.filename] ? <img src={batchPreviews[item.filename]} alt="" /> : <ImageIcon />}
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{item.filename}</p>
              {item.dna ? (
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-custom">
                  {ROW_METRICS.filter(({ key }) => typeof item.dna[key] === 'number').map(({ key, label }) => (
                    <span key={key}>{label} {Math.round(normalizeScore(item.dna[key], key === 'brightness' ? 255 : 100))}</span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-custom">DNA Match</p>
              )}
            </div>
            <strong>{item.score} pt</strong>
          </div>
        ))}
      </div>
    </div>
  );
};
