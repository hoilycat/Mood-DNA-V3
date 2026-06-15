import { Check, Loader2 } from 'lucide-react';
import type { LoadingStage } from '../types';

// 단계별 진행 상황을 보여주는 로딩 화면.
// stage 가 없으면 기본(단일 단계) 스피너로 동작한다.
export const LoadingState = ({ stage }: { stage?: LoadingStage | null }) => {
  const title = stage?.title ?? '디자인 DNA 분석 중';
  const subtitle = stage?.subtitle ?? '시각 지표와 브랜드 적합도를 계산하고 있어요.';
  const steps = stage?.steps ?? [];
  const activeStep = stage?.activeStep ?? 0;

  return (
    <div className="flex h-full min-h-96 flex-col items-center justify-center gap-6 text-center">
      <div className="relative h-24 w-24">
        <div className="absolute inset-0 rounded-full border border-primary opacity-30 animate-ping" />
        <div className="h-24 w-24 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
      <div>
        <h2 className="text-2xl font-black text-primary-custom">{title}</h2>
        <p className="mt-2 text-sm text-muted-custom">{subtitle}</p>
      </div>

      {steps.length > 0 && (
        <ol className="loading-steps">
          {steps.map((label, index) => {
            const status = index < activeStep ? 'done' : index === activeStep ? 'active' : 'pending';
            return (
              <li key={label} className={`loading-step ${status}`}>
                <span className="loading-step-icon">
                  {status === 'done' ? (
                    <Check size={14} />
                  ) : status === 'active' ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <span className="loading-step-dot" />
                  )}
                </span>
                <span className="loading-step-label">{label}</span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
};
