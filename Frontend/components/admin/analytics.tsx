'use client';

import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';

const monthlyData = [
  { month: 'Jan', users: 100, trips: 80 },
  { month: 'Feb', users: 150, trips: 120 },
  { month: 'Mar', users: 200, trips: 180 },
  { month: 'Apr', users: 280, trips: 240 },
  { month: 'May', users: 380, trips: 350 },
  { month: 'Jun', users: 520, trips: 480 },
];

const budgetData = [
  { range: '$0-500', count: 245 },
  { range: '$500-1000', count: 380 },
  { range: '$1000-2000', count: 420 },
  { range: '$2000-5000', count: 360 },
  { range: '$5000+', count: 140 },
];

export function AdminAnalytics() {
  return (
    <div className="space-y-6">
      {/* User & Trip Growth */}
      <Card className="border border-sand-200 p-6">
        <h3 className="mb-4 font-display text-lg font-semibold text-charcoal-800">
          Growth Metrics
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EBD9B8" />
            <XAxis dataKey="month" stroke="#6B6259" />
            <YAxis stroke="#6B6259" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#FFF', 
                border: '1px solid #D0CCC7',
                borderRadius: '0.75rem'
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="users"
              stroke="#E05520"
              strokeWidth={2}
              dot={{ fill: '#E05520', r: 4 }}
              name="New Users"
            />
            <Line
              type="monotone"
              dataKey="trips"
              stroke="#368236"
              strokeWidth={2}
              dot={{ fill: '#368236', r: 4 }}
              name="New Trips"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Budget Distribution */}
      <Card className="border border-sand-200 p-6">
        <h3 className="mb-4 font-display text-lg font-semibold text-charcoal-800">
          Trip Budget Distribution
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={budgetData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EBD9B8" />
            <XAxis dataKey="range" stroke="#6B6259" />
            <YAxis stroke="#6B6259" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#FFF', 
                border: '1px solid #D0CCC7',
                borderRadius: '0.75rem'
              }}
            />
            <Bar
              dataKey="count"
              fill="#B5832E"
              radius={[8, 8, 0, 0]}
              name="Number of Trips"
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Card className="border border-sand-200 p-6">
          <h4 className="text-sm font-medium text-charcoal-600">Average Trip Duration</h4>
          <p className="mt-2 text-3xl font-bold text-charcoal-800">8.2 days</p>
          <p className="mt-1 text-xs text-charcoal-500">Based on completed trips</p>
        </Card>

        <Card className="border border-sand-200 p-6">
          <h4 className="text-sm font-medium text-charcoal-600">Average Trip Budget</h4>
          <p className="mt-2 text-3xl font-bold text-charcoal-800">$2,150</p>
          <p className="mt-1 text-xs text-charcoal-500">Based on all trips</p>
        </Card>

        <Card className="border border-sand-200 p-6">
          <h4 className="text-sm font-medium text-charcoal-600">User Retention</h4>
          <p className="mt-2 text-3xl font-bold text-charcoal-800">74%</p>
          <p className="mt-1 text-xs text-charcoal-500">30-day active retention</p>
        </Card>

        <Card className="border border-sand-200 p-6">
          <h4 className="text-sm font-medium text-charcoal-600">Most Popular City</h4>
          <p className="mt-2 text-3xl font-bold text-charcoal-800">Tokyo</p>
          <p className="mt-1 text-xs text-charcoal-500">254 trips planned</p>
        </Card>
      </div>
    </div>
  );
}
