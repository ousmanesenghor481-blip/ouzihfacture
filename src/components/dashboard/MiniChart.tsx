'use client';

import React from 'react';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';

interface MiniChartProps {
  data: { name: string; value: number }[];
  color: string;
  width?: number | string;
  height?: number | string;
}

export const MiniChart: React.FC<MiniChartProps> = ({ data, color, width = '100%', height = 60 }) => {
  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <Bar dataKey="value" fill={color} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
