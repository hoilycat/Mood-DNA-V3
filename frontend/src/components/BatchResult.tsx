import { ImageIcon } from 'lucide-react';

export const BatchResult = ({ batchResult, batchPreviews }: { batchResult: any; batchPreviews: Record<string, string> }) => (
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
