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
        <path d="M16 8.5C16 9.32843 15.3284 10 14.5 10C13.6716 10 13 9.32843 13 8.5C13 7.67157 13.6716 7 14.5 7C15.3284 7 16 7.67157 16 8.5Z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M11 15.5C11 16.3284 10.3284 17 9.5 17C8.67157 17 8 16.3284 8 15.5C8 14.6716 8.67157 14 9.5 14C10.3284 14 11 14.6716 11 15.5Z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M9.5 10.5C9.5 11.3284 8.82843 12 8 12C7.17157 12 6.5 11.3284 6.5 10.5C6.5 9.67157 7.17157 9 8 9C8.82843 9 9.5 9.67157 9.5 10.5Z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M17.5 14C17.5 14.8284 16.8284 15.5 16 15.5C15.1716 15.5 14.5 14.8284 14.5 14C14.5 13.1716 15.1716 12.5 16 12.5C16.8284 12.5 17.5 13.1716 17.5 14Z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M14.5 8.5C14.5 8.5 12.5 10 11.5 11C10.5 12 9.5 13.5 9.5 13.5M9.5 13.5L9.5 14M9.5 13.5C9.5 13.5 8.5 12.5 8 12" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M14.5 8.5C14.5 8.5 16 10.5 16 12.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M9.5 15.5C9.5 15.5 12.5 15 14.5 14" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
    <span className="text-xl font-bold text-foreground whitespace-nowrap group-data-[collapsible=icon]:hidden">
      PathFinder AI
    </span>
  </div>
);

export default Logo;
