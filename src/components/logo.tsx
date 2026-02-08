import { cn } from '@/lib/utils';
import Image from 'next/image';
import React from 'react';

const Logo = ({ className }: { className?: string }) => (
  <div className={cn('flex items-center gap-2 overflow-hidden group', className)}>
    <Image
      src="/icon.png"
      alt="PathFinders AI Logo"
      width={32}
      height={32}
      className="flex-shrink-0"
    />
    <span className="text-xl font-bold text-foreground whitespace-nowrap group-data-[collapsible=icon]:hidden">
      PathFinders AI
    </span>
  </div>
);

export default Logo;
