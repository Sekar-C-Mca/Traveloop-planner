'use client';

import React, { useState, useEffect } from 'react';
import { Users, MapTrifold, ArrowUpRight, Globe, SpinnerGap } from '@phosphor-icons/react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminUserManagement } from '@/components/admin/user-management';
import { AdminTripManagement } from '@/components/admin/trip-management';
import { AdminAnalytics } from '@/components/admin/analytics';
import { fetchAdminStats, type AdminStats } from '@/lib/api-hooks';

function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  loading,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  loading: boolean;
}) {
  return (
    <Card className="border border-sand-200">
      <div className="p-3 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-charcoal-600">{label}</p>
            {loading ? (
              <div className="mt-1 sm:mt-2 h-8 w-16 bg-sand-100 animate-pulse rounded" />
            ) : (
              <p className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold text-charcoal-800">
                {value}
              </p>
            )}
          </div>
          <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full ${iconBg}`}>
            <Icon size={24} className={iconColor} weight="duotone" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      label: 'Total Users',
      value: stats?.total_users?.toLocaleString() ?? '—',
      icon: Users,
      iconBg: 'bg-ember-100',
      iconColor: 'text-ember-500',
    },
    {
      label: 'Total Trips',
      value: stats?.total_trips?.toLocaleString() ?? '—',
      icon: MapTrifold,
      iconBg: 'bg-forest-100',
      iconColor: 'text-forest-500',
    },
    {
      label: 'Public Trips',
      value: stats?.public_trips?.toLocaleString() ?? '—',
      icon: Globe,
      iconBg: 'bg-sand-100',
      iconColor: 'text-sand-500',
    },
    {
      label: 'Top City',
      value: stats?.top_cities?.[0]?.name ?? '—',
      icon: ArrowUpRight,
      iconBg: 'bg-ember-100',
      iconColor: 'text-ember-500',
    },
  ];

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="border-b border-sand-200 bg-white">
        <div className="px-3 py-4 sm:px-6 sm:py-6">
          <h1 className="font-display text-2xl sm:text-4xl font-bold text-charcoal-800">
            Admin Panel
          </h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-charcoal-600">
            Manage users, trips, and system analytics
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 px-3 py-4 sm:gap-6 sm:px-6 sm:py-8 lg:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} loading={loading} />
        ))}
      </div>

      {/* Top cities breakdown (if data available) */}
      {!loading && stats?.top_cities && stats.top_cities.length > 0 && (
        <div className="px-3 pb-2 sm:px-6">
          <p className="text-xs text-charcoal-400 mb-2 font-medium uppercase tracking-wider">Most Visited Cities</p>
          <div className="flex flex-wrap gap-2">
            {stats.top_cities.map((city) => (
              <span key={city.name} className="inline-flex items-center gap-1.5 rounded-full bg-sand-100 px-3 py-1 text-xs font-medium text-charcoal-700">
                <span className="w-1.5 h-1.5 rounded-full bg-ember-400 inline-block" />
                {city.name}
                <span className="text-charcoal-400">({city.visit_count})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="px-3 pb-4 sm:px-6 sm:pb-8 mt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-sand-50 p-1">
            <TabsTrigger value="overview" className="text-sm font-medium">Analytics</TabsTrigger>
            <TabsTrigger value="users" className="text-sm font-medium">Users</TabsTrigger>
            <TabsTrigger value="trips" className="text-sm font-medium">Trips</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <AdminAnalytics />
          </TabsContent>
          <TabsContent value="users" className="mt-6">
            <AdminUserManagement />
          </TabsContent>
          <TabsContent value="trips" className="mt-6">
            <AdminTripManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
