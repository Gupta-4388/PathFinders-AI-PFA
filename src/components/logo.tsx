'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import React from 'react';

const Logo = ({ className }: { className?: string }) => (
  <div className={cn('flex items-center gap-3 p-2 group', className)}>
    {/* Logo Icon */}
    <div className="relative w-8 h-8 flex-shrink-0 overflow-hidden rounded-md border border-border/10">
      <Image
        src="/icon.png"
        alt="PathFinders AI Logo"
        width={32}
        height={32}
        className="object-contain w-full h-full"
        priority
      />
    </div>
    
    {/* Brand Name */}
    <span className="text-xl font-bold text-foreground whitespace-nowrap tracking-tight group-data-[collapsible=icon]:hidden">
      PathFinders AI
    </span>
  </div>
);

export default Logo;
