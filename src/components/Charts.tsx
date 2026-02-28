import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Commit } from '../lib/utils';
import { SentimentTimeline } from './SentimentTimeline';

interface ChartsProps {
  commits: Commit[];
  contributors: { name: string; count: number }[];
}

export function Charts({ commits, contributors }: ChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SentimentTimeline commits={commits} />

      <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl">
        <h3 className="text-sm font-bold text-zinc-400 mb-6 uppercase tracking-widest">Top Contributors</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={contributors.slice(0, 5)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                stroke="#71717a" 
                fontSize={10} 
                width={100} 
                tickLine={false} 
                axisLine={false} 
              />
              <Tooltip 
                cursor={{ fill: '#27272a', opacity: 0.4 }}
                contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }}
                itemStyle={{ fontSize: '12px' }}
              />
              <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
