import { cn } from '@/lib/utils';
import Image from 'next/image';
import React from 'react';

const Logo = ({ className }: { className?: string }) => (
  <div className={cn('flex items-center gap-3 overflow-hidden group', className)}>
    <div className="relative w-8 h-8 flex-shrink-0 bg-muted rounded-md overflow-hidden border border-border/50">
      <Image
        src="/icon.png"
        alt="PathFinders AI Logo"
        fill
        className="object-cover"
        priority
      />
    </div>
    <span className="text-xl font-bold text-foreground whitespace-nowrap tracking-tight group-data-[collapsible=icon]:hidden">
      PathFinders AI
    </span>
  </div>
);

export default Logo;