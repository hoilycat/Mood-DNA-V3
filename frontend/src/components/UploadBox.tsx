import { Upload } from 'lucide-react';
import type { ChangeEvent } from 'react';

export const UploadBox = ({
  title,
  subtitle,
  preview,
  multiple,
  onChange,
}: {
  title: string;
  subtitle: string;
  preview?: string | null;
  multiple?: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) => (
  <label className="upload-box">
    {preview ? (
      <img src={preview} alt="" className="h-14 w-14 rounded-md border border-border object-cover" />
    ) : (
      <div className="upload-icon"><Upload size={20} /></div>
    )}
    <div className="min-w-0">
      <p className="truncate text-sm font-bold text-foreground">{title}</p>
      <p className="truncate text-xs text-muted-custom">{subtitle}</p>
    </div>
    <input type="file" className="hidden" accept="image/*" multiple={multiple} onChange={onChange} />
  </label>
);
