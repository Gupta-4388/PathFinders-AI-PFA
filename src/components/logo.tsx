import { cn } from '@/lib/utils';
import Image from 'next/image';
import React from 'react';

const Logo = ({ className }: { className?: string }) => (
  <div className={cn('relative flex items-center p-2 group overflow-hidden', className)}>
    {/* Background Watermark Logo */}
    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-24 h-24 opacity-[0.08] pointer-events-none group-data-[collapsible=icon]:hidden">
      <Image
        src="/icon.png"
        alt=""
        fill
        className="object-contain"
        priority
      />
    </div>
    
    {/* Main Branding */}
    <div className="relative flex items-center gap-3 z-10">
      <div className="relative w-8 h-8 flex-shrink-0 bg-muted/30 rounded-md overflow-hidden border border-border/10 backdrop-blur-[2px]">
        <Image
          src="/icon.png"
          alt="PathFinders AI Logo"
          fill
          className="object-cover"
          priority
        />
      </div>
      <span className="text-xl font-bold text-foreground whitespace-nowrap tracking-tight group-data-[collapsible=icon]:hidden drop-shadow-sm">
        PathFinders AI
      </span>
    </div>
  </div>
);

export default Logo;
