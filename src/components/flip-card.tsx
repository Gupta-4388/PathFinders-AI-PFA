'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface FlipCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

const FlipCard: React.FC<FlipCardProps> = ({ icon, title, description, className }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // This check runs only on the client-side
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const handleMouseEnter = () => {
    if (!isTouchDevice) {
      setIsFlipped(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isTouchDevice) {
      setIsFlipped(false);
    }
  };

  const handleClick = () => {
    // On touch devices, toggle flip on click
    if (isTouchDevice) {
      setIsFlipped((prev) => !prev);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsFlipped((prev) => !prev);
    }
  };

  return (
    <div
      className={cn('flip-card', { flipped: isFlipped }, className)}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-pressed={isFlipped}
      aria-label={`Flip card for ${title}`}
    >
      <div className="flip-card-inner">
        <div className="flip-card-front" aria-hidden={isFlipped}>
          <div className="mb-4 text-accent">{icon}</div>
          <h3 className="text-xl font-bold">{title}</h3>
        </div>
        <div className="flip-card-back" aria-hidden={!isFlipped}>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default FlipCard;
