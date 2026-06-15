import { Activity, Loader2 } from 'lucide-react';
import type { HistoryRecord } from '../types';

export const HistoryView = ({ history }: { history: HistoryRecord[] | null }) => {
  if (history === null) {
    return (
      <div className="flex h-full min-h-96 items-center justify-center text-muted-custom">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }
  if (history.length === 0) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 py-20 text-center text-muted-custom">
        <Activity size={32} className="opacity-40" />
        <p className="text-sm font-bold">아직 분석 기록이 없어요</p>
        <p className="text-xs">Single 모드에서 디자인을 분석하면 여기에 차곡차곡 쌓입니다.</p>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="chart-box">
        <h2 className="text-2xl font-black">Analysis History</h2>
        <p className="mt-2 text-sm text-muted-custom">최근 분석 기록 {history.length}건 — 시간에 따른 디자인 DNA의 변화를 추적하세요.</p>
      </div>
      <div className="space-y-3">
        {history.map((item, index) => {
          const prev = history[index + 1]; // 다음 항목이 시간상 이전 기록
          const delta = prev ? Math.round(item.complexity - prev.complexity) : null;
          return (
            <div className="ranking-row" key={item.id}>
              <div className="flex h-16 w-16 flex-none flex-col overflow-hidden rounded-md border border-border">
                {item.colors.slice(0, 4).map((color) => (
                  <div key={color} className="flex-1" style={{ backgroundColor: color }} />
                ))}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{item.category || item.industry || '분석 기록'}</p>
                <p className="truncate text-xs text-muted-custom">
                  {item.created_at ? new Date(item.created_at).toLocaleString('ko-KR') : `기록 #${item.id}`}
                  {item.mood ? ` · ${item.mood.split('\n')[0]}` : ''}
                </p>
                <p className="mt-1 text-xs text-muted-custom">
                  복잡도 {Math.round(item.complexity)} · 여백 {Math.round(item.space)} · 대칭 {Math.round(item.symmetry)}
                  {delta !== null && delta !== 0 && (
                    <span className="ml-2 font-bold text-primary-custom">
                      복잡도 {delta > 0 ? '+' : ''}{delta} (직전 대비)
                    </span>
                  )}
                </p>
              </div>
              <strong>{item.total_score != null ? `${item.total_score} pt` : '—'}</strong>
            </div>
          );
        })}
      </div>
    </div>
  );
};
