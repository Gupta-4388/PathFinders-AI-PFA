import { cn } from '@/lib/utils';
import React from 'react';

const Logo = ({ className }: { className?: string }) => (
  <div className={cn('flex items-center gap-2 overflow-hidden', className)}>
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-accent flex-shrink-0"
    >
      <path d="M5 19C5 19 5 12 12 12C19 12 19 5 19 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 3L18.165 6.33501L21.5 7.5L18.165 8.66501L17 12L15.835 8.66501L12.5 7.5L15.835 6.33501L17 3Z" fill="currentColor"/>
    </svg>
    <span className="text-xl font-bold text-foreground whitespace-nowrap group-data-[collapsible=icon]:hidden">
      PathFinder AI
    </span>
  </div>
);

export default Logo;
