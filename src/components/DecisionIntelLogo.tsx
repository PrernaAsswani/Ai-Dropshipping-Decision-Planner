import React from 'react';
import { cn } from '../lib/utils';

type DecisionIntelLogoProps = {
  compact?: boolean;
  className?: string;
};

export default function DecisionIntelLogo({ compact = false, className }: DecisionIntelLogoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="h-10 w-10 shrink-0 drop-shadow-[0_12px_22px_rgba(79,70,229,0.22)]"
      >
        <rect width="40" height="40" rx="13" fill="url(#di-bg)" />
        <rect x="0.75" y="0.75" width="38.5" height="38.5" rx="12.25" stroke="white" strokeOpacity="0.34" strokeWidth="1.5" />
        <path d="M10 27.5L16.2 21.3L21.4 24.8L30 13.5" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="10" cy="27.5" r="2.3" fill="#F8FAFC" />
        <circle cx="16.2" cy="21.3" r="2.3" fill="#C4B5FD" />
        <circle cx="21.4" cy="24.8" r="2.3" fill="#BAE6FD" />
        <circle cx="30" cy="13.5" r="2.3" fill="#F8FAFC" />
        <path d="M15 12.2C16.2 10.7 18 9.8 20 9.8C23.1 9.8 25.7 12 26.2 15" stroke="white" strokeOpacity="0.62" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M14.2 16.1C14.6 13.6 16.7 11.7 19.3 11.7" stroke="#DBEAFE" strokeOpacity="0.76" strokeWidth="1.5" strokeLinecap="round" />
        <defs>
          <linearGradient id="di-bg" x1="4" y1="3" x2="36" y2="38" gradientUnits="userSpaceOnUse">
            <stop stopColor="#312E81" />
            <stop offset="0.48" stopColor="#4F46E5" />
            <stop offset="1" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
      </svg>

      {!compact && (
        <span className="leading-none tracking-tight">
          <span className="font-extrabold text-slate-950">Drop</span>
          <span className="font-semibold text-slate-600">lify</span>
        </span>
      )}
    </div>
  );
}
