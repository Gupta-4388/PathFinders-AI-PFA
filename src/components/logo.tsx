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
      <path
        d="M9 12.19C9 10.98 9.98 10 11.19 10H14.81C16.02 10 17 10.98 17 12.19C17 13.4 16.02 14.38 14.81 14.38H11.19C9.98 14.38 9 13.4 9 12.19Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 10V8.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 15.88V14.38"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.19 19.38L10.74 17.65C10.53 16.83 11.17 16 12 16C12.83 16 13.47 16.83 13.26 17.65L12.81 19.38"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.92 7.15L12.81 5.62C12.72 4.71 12.03 4 11.11 4C10.19 4 9.5 4.71 9.41 5.62L9.3 7.15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.81 14.81L20.34 15.33C21.26 15.66 22 16.63 21.67 17.55C21.34 18.47 20.37 19.11 19.45 18.78L17.92 18.26"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.08008 18.26L4.55008 18.78C3.63008 19.11 2.66008 18.47 2.33008 17.55C2.00008 16.63 2.74008 15.66 3.66008 15.33L5.19008 14.81"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.81 9.19001L20.34 8.67001C21.26 8.34001 21.67 7.37001 21.34 6.45001C21.01 5.53001 20.04 4.89001 19.12 5.22001L17.59 5.74001"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.08008 5.74001L4.55008 5.22001C3.63008 4.89001 2.66008 5.53001 2.33008 6.45001C2.00008 7.37001 2.74008 8.34001 3.66008 8.67001L5.19008 9.19001"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    <span className="text-xl font-bold text-foreground whitespace-nowrap group-data-[collapsible=icon]:hidden">
      PathFinder AI
    </span>
  </div>
);

export default Logo;
