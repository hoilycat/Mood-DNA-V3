import { Activity, Grid, Maximize, Palette } from 'lucide-react';
import type { DnaProfile, MoodDnaResult } from '../types';
import { DnaRadarChart } from './DnaRadarChart';
import { RadarLegend, StatBar, StatCard } from './Stats';

export const SingleResult = ({ result, targets, onSelectImage, critiqueLoading }: { result: MoodDnaResult; targets: DnaProfile; onSelectImage: (url: string) => void; critiqueLoading?: boolean }) => (
  <div className="mx-auto max-w-6xl space-y-5">
    <div className="grid gap-5 xl:grid-cols-5">
      <div className="chart-box xl:col-span-2">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-label">DNA Match</h2>
          <span className="score-pill">{result.total_score != null ? `${result.total_score} / 100` : critiqueLoading ? 'AI 분석 중…' : '- / 100'}</span>
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
        {result.evaluation ? (
          <div className="space-y-3">
            {Object.entries(result.evaluation).map(([key, value]) => (
              <div className="evaluation-row" key={key}>
                <span>{key.replace('_', ' ')}</span>
                <p>{value}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-custom">
            {critiqueLoading ? 'AI가 항목별 평가를 작성하고 있어요…' : 'AI 평가를 불러오지 못했습니다.'}
          </p>
        )}
      </div>
    </div>

    {(result.reference_images?.length ?? 0) > 0 && (
      <div className="chart-box">
        <h2 className="text-label mb-4">References</h2>
        <div className="reference-grid">
          {result.reference_images?.map((url, index) => (
            <button key={`${url}-${index}`} onClick={() => onSelectImage(url)}>
              <img src={url} alt={`Reference ${index + 1}`} referrerPolicy="no-referrer" />
            </button>
          ))}
        </div>
      </div>
    )}
  </div>
);
