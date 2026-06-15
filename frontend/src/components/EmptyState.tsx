import { Target } from 'lucide-react';
import type { DnaProfile } from '../types';
import { DnaRadarChart } from './DnaRadarChart';
import { RadarLegend } from './Stats';

export const EmptyState = ({ targets }: { targets: DnaProfile }) => (
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
