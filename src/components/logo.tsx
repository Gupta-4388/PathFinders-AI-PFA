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
        <path d="M9 13C9 14.1046 8.10457 15 7 15C5.89543 15 5 14.1046 5 13C5 11.8954 5.89543 11 7 11C8.10457 11 9 11.8954 9 13Z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M13 11C13 12.1046 12.1046 13 11 13C9.89543 13 9 12.1046 9 11C9 9.89543 9.89543 9 11 9C12.1046 9 13 9.89543 13 11Z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M18 13C18 14.1046 17.1046 15 16 15C14.8954 15 14 14.1046 14 13C14 11.8954 14.8954 11 16 11C17.1046 11 18 11.8954 18 13Z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M7 13H4M16 13H19M11 9V6" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
    <span className="text-xl font-bold text-foreground whitespace-nowrap group-data-[collapsible=icon]:hidden">
      PathFinder AI
    </span>
  </div>
);

export default Logo;
