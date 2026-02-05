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
      <path d="M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 12m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 20v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M2 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M20 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4.93 4.93l1.41 1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M17.66 17.66l1.41 1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4.93 19.07l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
    <span className="text-xl font-bold text-foreground whitespace-nowrap group-data-[collapsible=icon]:hidden">
      PathFinder AI
    </span>
  </div>
);

export default Logo;
