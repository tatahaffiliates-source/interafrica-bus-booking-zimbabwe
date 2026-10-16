import React from 'react';
import coachPhoto from '../public/images/WhatsApp Image 2026-10-16 at 13.42.10.jpeg';

interface BusPreviewProps {
  busName: string;
  busType: string;
  busNumber: string;
  className?: string;
}

export const BusPreview: React.FC<BusPreviewProps> = ({
  busName,
  busType,
  busNumber,
  className = '',
}) => (
  <div className={`flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5 ${className}`}>
    <img
      src={coachPhoto}
      alt="InterAfrica coach; the pictured registration plate reads AHA 3906"
      className="h-20 w-28 shrink-0 rounded-lg object-cover sm:h-24 sm:w-36"
      loading="lazy"
    />
    <div className="min-w-0">
      <div className="truncate text-sm font-bold text-slate-900">{busName}</div>
      <div className="text-xs text-slate-600">{busType}</div>
      <div className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Plate in photo</span>
        <span className="rounded border border-slate-300 bg-white px-1.5 py-0.5 font-mono text-xs font-bold tracking-wider text-slate-900">
          AHA 3906
        </span>
      </div>
      <div className="mt-1 truncate text-[10px] text-slate-500">Trip fleet reference: {busNumber}</div>
    </div>
  </div>
);
