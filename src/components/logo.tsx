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
      className="text-primary flex-shrink-0"
    >
      {/* Brain outline structure based on the provided design */}
      <path
        d="M10 21c-3.3 0-6-2.7-6-6 0-1.4.5-2.6 1.3-3.7C4.5 10.3 4 9 4 7.7 4 4.5 6.7 2 10 2v19z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Circuit branches with elbows as seen in the image */}
      <path
        d="M10 12h3c0.5 0 1-0.5 1-1V7c0-0.5 0.5-1 1-1h3"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="6" r="1.5" fill="currentColor" />
      
      <path
        d="M10 13h10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="21" cy="13" r="1.5" fill="currentColor" />
      
      <path
        d="M10 14h3c0.5 0 1 0.5 1 1v4c0 0.5 0.5 1 1 1h3"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="20" r="1.5" fill="currentColor" />
    </svg>
    <span className="text-xl font-bold text-foreground whitespace-nowrap group-data-[collapsible=icon]:hidden">
      PathFinder AI
    </span>
  </div>
);

export default Logo;
