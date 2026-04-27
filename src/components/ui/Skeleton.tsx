'use client';
// src/components/ui/Skeleton.tsx

import { cn } from '@/lib/utils/cn';

interface SkeletonProps {
  className?: string;
  rows?: number;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-white/5',
        className
      )}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/3 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-5 w-16 rounded" />
      </div>
      <Skeleton className="h-6 w-24" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-white/5">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <Skeleton className={`h-4 ${i === 0 ? 'w-32' : 'w-16 ml-auto'}`} />
        </td>
      ))}
    </tr>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/3 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-48 rounded-lg" />
      </div>
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}
