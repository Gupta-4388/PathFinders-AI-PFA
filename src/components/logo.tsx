'use client';

import { cn } from '@/lib/utils';
import React from 'react';

const Logo = ({ className }: { className?: string }) => (
  <div className={cn('flex items-center gap-3 p-2 group', className)}>
    {/* Logo Icon */}
    <div className="flex-shrink-0 w-8 h-8 overflow-hidden rounded-md border border-border/10">
      <img
        src="https://github.com/Gupta-4388/PFA-logo/blob/main/PFA-Logo.jpeg?raw=true"
        alt="PathFinders AI Logo"
        width="32"
        height="32"
        className="object-contain block"
      />
    </div>
    
    {/* Brand Name */}
    <span className="text-xl font-bold text-foreground whitespace-nowrap tracking-tight group-data-[collapsible=icon]:hidden">
      PathFinders AI
    </span>
  </div>
);

export default Logo;
