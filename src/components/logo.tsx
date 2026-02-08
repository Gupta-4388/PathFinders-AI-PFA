import { cn } from '@/lib/utils';
import React from 'react';

const Logo = ({ className }: { className?: string }) => (
  <div className={cn('flex items-center gap-2 overflow-hidden group', className)}>
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-accent flex-shrink-0"
    >
      {/* Brain lobe structure */}
      <path
        d="M10 21c-3.3 0-6-2.7-6-6 0-1.4.5-2.6 1.3-3.7C4.5 10.3 4 9 4 7.7 4 4.5 6.7 2 10 2v19z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Circuit branches */}
      <path
        d="M10 11.5h3m0 0V6.5h4m-4 5h6m-6 0v5h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Circuit terminators */}
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
      <circle cx="19.5" cy="11.5" r="1.5" fill="currentColor" />
      <circle cx="17.5" cy="16.5" r="1.5" fill="currentColor" />
    </svg>
    <span className="text-xl font-bold text-foreground whitespace-nowrap group-data-[collapsible=icon]:hidden">
      PathFinder AI
    </span>
  </div>
);

export default Logo;
