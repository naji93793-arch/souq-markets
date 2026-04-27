'use client';
// src/components/charts/Sparkline.tsx
// Tiny inline sparkline chart used inside price cards

import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

interface SparklineProps {
  data: number[];        // just the price values
  color?: string;
  height?: number;
  showTooltip?: boolean;
}

export function Sparkline({
  data,
  color = '#F59E0B',
  height = 40,
  showTooltip = false,
}: SparklineProps) {
  const chartData = data.map((price, i) => ({ i, price }));
  const isUp = data.length > 1 && data[data.length - 1] >= data[0];
  const lineColor = color === 'auto'
    ? (isUp ? '#10B981' : '#EF4444')
    : color;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        {showTooltip && (
          <Tooltip
            content={({ active, payload }) =>
              active && payload?.length ? (
                <div className="rounded bg-gray-900 px-2 py-1 text-xs text-white">
                  {payload[0].value}
                </div>
              ) : null
            }
          />
        )}
        <Line
          type="monotone"
          dataKey="price"
          stroke={lineColor}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
