import {
  PolarAngleAxis,
  PolarGrid,
  Radar as RechartsRadar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';
import type { DnaProfile } from '../types';
import { DNA_LABELS, normalizeScore } from '../moodData';

export const DnaRadarChart = ({
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
