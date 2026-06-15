import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

export const PanelHeader = ({ title, onCollapse, direction }: { title: string; onCollapse: () => void; direction: 'left' | 'right' }) => (
  <div className="flex items-center justify-between border-b border-border px-4 py-4">
    <h2 className="text-label">{title}</h2>
    <button className="icon-button small" onClick={onCollapse} aria-label="Collapse panel">
      {direction === 'left' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
    </button>
  </div>
);

export const CollapsedPanel = ({ label, icon, onClick }: { label: string; icon: ReactNode; onClick: () => void }) => (
  <div className="flex h-full flex-col items-center gap-8 py-5">
    <button className="icon-button small" onClick={onClick} aria-label={`Open ${label}`}>{icon}</button>
    <div className="vertical-text text-[10px] font-black uppercase tracking-[0.2em] text-muted-custom">{label}</div>
  </div>
);
