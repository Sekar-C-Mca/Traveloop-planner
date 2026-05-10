'use client';

import React, { useState, useEffect } from 'react';
import { Eye, MagnifyingGlass, SpinnerGap } from '@phosphor-icons/react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { fetchAdminTrips, type AdminTrip } from '@/lib/api-hooks';

function getStatusColor(status: string) {
  switch (status) {
    case 'upcoming': return 'bg-sand-100 text-sand-700';
    case 'ongoing': return 'bg-forest-100 text-forest-700';
    case 'completed': return 'bg-charcoal-100 text-charcoal-700';
    default: return 'bg-charcoal-100 text-charcoal-700';
  }
}

export function AdminTripManagement() {
  const [trips, setTrips] = useState<AdminTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrip, setSelectedTrip] = useState<AdminTrip | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    fetchAdminTrips({ limit: 50 })
      .then(({ trips }) => setTrips(trips))
      .catch(() => setTrips([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = trips.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.owner_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="border border-sand-200">
        <div className="p-4 sm:p-6">
          <div className="relative">
            <MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
            <Input
              placeholder="Search trips by name or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      <Card className="border border-sand-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <SpinnerGap size={28} className="animate-spin text-ember-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-sand-50 hover:bg-sand-50">
                  <TableHead className="text-charcoal-700 font-semibold">Trip Name</TableHead>
                  <TableHead className="text-charcoal-700 font-semibold hidden sm:table-cell">Owner</TableHead>
                  <TableHead className="text-charcoal-700 font-semibold text-center">Stops</TableHead>
                  <TableHead className="text-charcoal-700 font-semibold hidden md:table-cell">Dates</TableHead>
                  <TableHead className="text-charcoal-700 font-semibold">Status</TableHead>
                  <TableHead className="text-right text-charcoal-700 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-charcoal-400 text-sm">
                      No trips found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((trip) => (
                    <TableRow key={trip.id} className="hover:bg-sand-50">
                      <TableCell className="font-medium text-charcoal-800 max-w-[140px] truncate">{trip.name}</TableCell>
                      <TableCell className="text-charcoal-600 hidden sm:table-cell">{trip.owner_name}</TableCell>
                      <TableCell className="text-center text-charcoal-800 font-medium">{trip.stop_count}</TableCell>
                      <TableCell className="text-charcoal-600 text-sm hidden md:table-cell">
                        {new Date(trip.start_date).toLocaleDateString()} – {new Date(trip.end_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex rounded-full px-2 sm:px-3 py-1 text-xs font-medium capitalize ${getStatusColor(trip.status)}`}>
                          {trip.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <button
                          onClick={() => { setSelectedTrip(trip); setIsDetailOpen(true); }}
                          className="rounded-lg p-1.5 sm:p-2 text-charcoal-600 hover:bg-sand-100 transition-colors"
                          title="View details"
                        >
                          <Eye size={16} />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Trip Details</DialogTitle>
          </DialogHeader>
          {selectedTrip && (
            <div className="space-y-4">
              <div><p className="text-sm font-medium text-charcoal-600">Trip Name</p><p className="text-charcoal-800">{selectedTrip.name}</p></div>
              <div><p className="text-sm font-medium text-charcoal-600">Owner</p><p className="text-charcoal-800">{selectedTrip.owner_name}</p></div>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm font-medium text-charcoal-600">City Stops</p><p className="text-charcoal-800">{selectedTrip.stop_count}</p></div>
                <div><p className="text-sm font-medium text-charcoal-600">Visibility</p><p className="text-charcoal-800">{selectedTrip.is_public ? 'Public' : 'Private'}</p></div>
              </div>
              <div><p className="text-sm font-medium text-charcoal-600">Dates</p><p className="text-charcoal-800">{new Date(selectedTrip.start_date).toLocaleDateString()} – {new Date(selectedTrip.end_date).toLocaleDateString()}</p></div>
              <div><p className="text-sm font-medium text-charcoal-600">Status</p><p className="text-charcoal-800 capitalize">{selectedTrip.status}</p></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
