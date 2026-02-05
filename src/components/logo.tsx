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
      <path d="M9.5 12.5C9.5 13.3284 8.82843 14 8 14C7.17157 14 6.5 13.3284 6.5 12.5C6.5 11.6716 7.17157 11 8 11C8.82843 11 9.5 11.6716 9.5 12.5Z" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M17.5 12.5C17.5 13.3284 16.8284 14 16 14C15.1716 14 14.5 13.3284 14.5 12.5C14.5 11.6716 15.1716 11 16 11C16.8284 11 17.5 11.6716 17.5 12.5Z" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 9C12 9.55228 11.5523 10 11 10C10.4477 10 10 9.55228 10 9C10 8.44772 10.4477 8 11 8C11.5523 8 12 8.44772 12 9Z" fill="currentColor"/>
      <path d="M14 9C14 9.55228 13.5523 10 13 10C12.4477 10 12 9.55228 12 9C12 8.44772 12.4477 8 13 8C13.5523 8 14 8.44772 14 9Z" fill="currentColor"/>
      <path d="M12 21.5C17.2467 21.5 21.5 17.2467 21.5 12C21.5 6.75329 17.2467 2.5 12 2.5C6.75329 2.5 2.5 6.75329 2.5 12C2.5 14.0385 3.24247 15.891 4.5 17.3M4.5 17.3L4.50001 17.3001L8.5 14.5M4.5 17.3L6.5 18.5M8.5 14.5L12.5 11M8.5 14.5L11 16.5M6.5 18.5L9.5 20.5M6.5 18.5L11 16.5M11 16.5L14 18.5M9.5 20.5L14 18.5M19.5 17.3L15.5 14.5M19.5 17.3L17.5 18.5M15.5 14.5L12.5 11M15.5 14.5L13 16.5M17.5 18.5L14.5 20.5M17.5 18.5L13 16.5M14 18.5L14.5 20.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    <span className="text-xl font-bold text-foreground whitespace-nowrap group-data-[collapsible=icon]:hidden">
      PathFinder AI
    </span>
  </div>
);

export default Logo;
