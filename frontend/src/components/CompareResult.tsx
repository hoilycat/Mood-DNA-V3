import type { DnaProfile } from '../types';
import { DnaRadarChart } from './DnaRadarChart';

export const CompareResult = ({ compResult, targets }: { compResult: any; targets: DnaProfile }) => (
  <div className="mx-auto max-w-5xl space-y-5">
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="chart-box">
        <h2 className="text-label mb-3">Design A</h2>
        <DnaRadarChart data={compResult.stats1 || {}} targetData={targets} height={280} />
        <p className="mt-3 text-center text-3xl font-black text-primary-custom">{compResult.score1 ?? '-'}</p>
      </div>
      <div className="chart-box">
        <h2 className="text-label mb-3">Design B</h2>
        <DnaRadarChart data={compResult.stats2 || {}} targetData={targets} height={280} />
        <p className="mt-3 text-center text-3xl font-black text-primary-custom">{compResult.score2 ?? '-'}</p>
      </div>
    </div>
    <div className="chart-box border-l-4 border-l-primary">
      <h2 className="text-xl font-black">{compResult.comparison?.winner ? `${compResult.comparison.winner}안이 더 적합합니다` : '비교 분석'}</h2>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-muted-custom">{compResult.comparison?.detail_comparison || compResult.verdict || compResult.comparison?.summary}</p>
    </div>
  </div>
);
