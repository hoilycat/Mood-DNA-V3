import type { LucideIcon } from 'lucide-react';
import { DNA_LABELS, normalizeScore } from '../moodData';

export const StatBar = ({ label, value, max = 100 }: { label: string; value: number; max?: number }) => (
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

export const StatCard = ({ label, value, max = 100, icon: Icon }: { label: string; value: number; max?: number; icon: LucideIcon }) => (
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

export const RadarLegend = () => (
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
