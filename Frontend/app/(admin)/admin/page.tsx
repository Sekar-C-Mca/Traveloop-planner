'use client';

import React, { useState } from 'react';
import { Users, MapTrifold, ArrowUpRight, WarningCircle } from '@phosphor-icons/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminUserManagement } from '@/components/admin/user-management';
import { AdminTripManagement } from '@/components/admin/trip-management';
import { AdminAnalytics } from '@/components/admin/analytics';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="border-b border-sand-200 bg-white">
        <div className="px-6 py-6">
          <h1 className="font-display text-4xl font-bold text-charcoal-800">
            Admin Panel
          </h1>
          <p className="mt-2 text-charcoal-600">
            Manage users, trips, and system analytics
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 px-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-sand-200">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-charcoal-600">Total Users</p>
                <p className="mt-2 text-3xl font-bold text-charcoal-800">1,247</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ember-100">
                <Users size={24} className="text-ember-500" weight="duotone" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="border border-sand-200">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-charcoal-600">Total Trips</p>
                <p className="mt-2 text-3xl font-bold text-charcoal-800">3,892</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-forest-100">
                <MapTrifold size={24} className="text-forest-500" weight="duotone" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="border border-sand-200">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-charcoal-600">Active Users</p>
                <p className="mt-2 text-3xl font-bold text-charcoal-800">342</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sand-100">
                <ArrowUpRight size={24} className="text-sand-500" weight="duotone" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="border border-sand-200">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-charcoal-600">Flagged Issues</p>
                <p className="mt-2 text-3xl font-bold text-charcoal-800">12</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ember-100">
                <WarningCircle size={24} className="text-ember-500" weight="duotone" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs Section */}
      <div className="px-6 pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-sand-50 p-1">
            <TabsTrigger value="overview" className="text-sm font-medium">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="users" className="text-sm font-medium">
              Users
            </TabsTrigger>
            <TabsTrigger value="trips" className="text-sm font-medium">
              Trips
            </TabsTrigger>
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
