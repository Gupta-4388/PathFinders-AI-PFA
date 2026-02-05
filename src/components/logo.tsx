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
      <path d="M9 14.2861C9 14.2861 8.57143 16.5714 10.2857 17.5714C12 18.5714 12.8571 16.2857 12.4286 15.2857C12 14.2857 11.2857 13.5714 10.7143 13.2857C10.1429 13 9 13.2857 9 14.2861Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15 14.5C15 14.5 15.5 16.5 14 17.5C12.5 18.5 12 16.5 12.5 15.5C13 14.5 13.5 14 14 13.5C14.5 13 15 13.5 15 14.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 11.5C12 11.5 11.5 9.5 13 8.5C14.5 7.5 15 9.5 14.5 10.5C14 11.5 13.5 12 13 12.5C12.5 13 12 12.5 12 11.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19.4286 10.8571C21.7143 12.2857 22.2857 15.7143 20.7143 18C19.1429 20.2857 15.4286 21.1429 13.1429 19.7143C13.1429 19.7143 10.8571 21.7143 8.57143 20.2857C6.28571 18.8571 6 15.4286 7.57143 13.1429C7.57143 13.1429 5.71429 11.7143 6.85714 9.42857C8 7.14286 11.4286 6 13.7143 7.42857C13.7143 7.42857 16 5.42857 18.2857 6.85714C20.5714 8.28571 19.4286 10.8571 19.4286 10.8571Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12.5 3V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M16.5 4.5L16 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M8.5 4.5L9 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
    <span className="text-xl font-bold text-foreground whitespace-nowrap group-data-[collapsible=icon]:hidden">
      PathFinder AI
    </span>
  </div>
);

export default Logo;
