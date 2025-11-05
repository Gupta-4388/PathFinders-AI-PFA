import { cn } from '@/lib/utils';
import React from 'react';

const Logo = ({ className }: { className?: string }) => (
  <div className={cn('flex items-center gap-2', className)}>
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-accent"
    >
      <path
        d="M6 26V6C6 5.44772 6.44772 5 7 5H17C21.4183 5 25 8.58172 25 13C25 17.4183 21.4183 21 17 21H9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 21L13 26"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    <span className="text-xl font-bold text-foreground">PathFinder AI</span>
  </div>
);

export default Logo;
