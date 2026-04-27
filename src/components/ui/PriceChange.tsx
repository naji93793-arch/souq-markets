'use client';
// src/components/ui/PriceChange.tsx

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface PriceChangeProps {
  value: number;
  showIcon?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PriceChange({
  value,
  showIcon = true,
  className,
  size = 'md',
}: PriceChangeProps) {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const isZero = value === 0;

  const colorClass = isPositive
    ? 'text-emerald-400'
    : isNegative
    ? 'text-red-400'
    : 'text-gray-500';

  const bgClass = isPositive
    ? 'bg-emerald-500/10'
    : isNegative
    ? 'bg-red-500/10'
    : 'bg-gray-500/10';

  const sizeClass = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-0.5',
    lg: 'text-base px-2.5 py-1',
  }[size];

  const iconSize = size === 'sm' ? 10 : size === 'lg' ? 16 : 12;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded font-medium',
        colorClass,
        bgClass,
        sizeClass,
        className
      )}
    >
      {showIcon && (
        <>
          {isPositive && <TrendingUp size={iconSize} />}
          {isNegative && <TrendingDown size={iconSize} />}
          {isZero && <Minus size={iconSize} />}
        </>
      )}
      {isPositive ? '+' : ''}{value.toFixed(2)}%
    </span>
  );
}
