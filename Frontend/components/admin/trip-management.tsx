'use client';

import React, { useState } from 'react';
import {
  Trash,
  PencilSimple,
  Eye,
  MagnifyingGlass,
  MapPin,
  CalendarBlank,
} from '@phosphor-icons/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface Trip {
  id: string;
  name: string;
  creator: string;
  cities: number;
  startDate: string;
  endDate: string;
  budget: number;
  status: 'upcoming' | 'ongoing' | 'completed';
}

const mockTrips: Trip[] = [
  {
    id: '1',
    name: 'Tokyo Adventure',
    creator: 'Sarah Chen',
    cities: 3,
    startDate: '2024-06-15',
    endDate: '2024-06-22',
    budget: 2500,
    status: 'upcoming',
  },
  {
    id: '2',
    name: 'Europe Grand Tour',
    creator: 'John Smith',
    cities: 5,
    startDate: '2024-05-20',
    endDate: '2024-06-10',
    budget: 5000,
    status: 'ongoing',
  },
  {
    id: '3',
    name: 'Bali Escape',
    creator: 'Emma Wilson',
    cities: 2,
    startDate: '2024-04-01',
    endDate: '2024-04-10',
    budget: 1500,
    status: 'completed',
  },
  {
    id: '4',
    name: 'New York Experience',
    creator: 'Michael Johnson',
    cities: 1,
    startDate: '2024-07-01',
    endDate: '2024-07-08',
    budget: 3000,
    status: 'upcoming',
  },
  {
    id: '5',
    name: 'South America Explorer',
    creator: 'Lisa Anderson',
    cities: 4,
    startDate: '2024-08-15',
    endDate: '2024-09-05',
    budget: 4200,
    status: 'upcoming',
  },
];

export function AdminTripManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const filteredTrips = mockTrips.filter(
    (trip) =>
      trip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.creator.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    setIsDetailDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-sand-100 text-sand-700';
      case 'ongoing':
        return 'bg-forest-100 text-forest-700';
      case 'completed':
        return 'bg-charcoal-100 text-charcoal-700';
      default:
        return 'bg-charcoal-100 text-charcoal-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card className="border border-sand-200">
        <div className="p-6">
          <div className="relative">
            <MagnifyingGlass
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400"
            />
            <Input
              placeholder="Search trips by name or creator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      {/* Trips Table */}
      <Card className="border border-sand-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-sand-50 hover:bg-sand-50">
              <TableHead className="text-charcoal-700 font-semibold">Trip Name</TableHead>
              <TableHead className="text-charcoal-700 font-semibold">Creator</TableHead>
              <TableHead className="text-charcoal-700 font-semibold text-center">
                Cities
              </TableHead>
              <TableHead className="text-charcoal-700 font-semibold">Duration</TableHead>
              <TableHead className="text-charcoal-700 font-semibold text-right">
                Budget
              </TableHead>
              <TableHead className="text-charcoal-700 font-semibold">Status</TableHead>
              <TableHead className="text-right text-charcoal-700 font-semibold">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTrips.map((trip) => (
              <TableRow key={trip.id} className="hover:bg-sand-50">
                <TableCell className="font-medium text-charcoal-800">
                  {trip.name}
                </TableCell>
                <TableCell className="text-charcoal-600">{trip.creator}</TableCell>
                <TableCell className="text-center text-charcoal-800 font-medium">
                  {trip.cities}
                </TableCell>
                <TableCell className="text-charcoal-600 text-sm">
                  {new Date(trip.startDate).toLocaleDateString()} -{' '}
                  {new Date(trip.endDate).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right font-medium text-charcoal-800">
                  ${trip.budget.toLocaleString()}
                </TableCell>
                <TableCell>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusColor(trip.status)}`}>
                    {trip.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleViewTrip(trip)}
                      className="rounded-lg p-2 text-charcoal-600 hover:bg-sand-100 transition-colors"
                      title="View details"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      className="rounded-lg p-2 text-charcoal-600 hover:bg-sand-100 transition-colors"
                      title="Edit trip"
                    >
                      <PencilSimple size={18} />
                    </button>
                    <button
                      className="rounded-lg p-2 text-charcoal-600 hover:bg-ember-100 hover:text-ember-600 transition-colors"
                      title="Delete trip"
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Trip Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Trip Details</DialogTitle>
          </DialogHeader>
          {selectedTrip && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-charcoal-600">Trip Name</p>
                <p className="text-charcoal-800">{selectedTrip.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-charcoal-600">Creator</p>
                <p className="text-charcoal-800">{selectedTrip.creator}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-charcoal-600">Cities</p>
                  <p className="text-charcoal-800">{selectedTrip.cities}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-charcoal-600">Budget</p>
                  <p className="text-charcoal-800">${selectedTrip.budget}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-charcoal-600">Duration</p>
                <p className="text-charcoal-800">
                  {new Date(selectedTrip.startDate).toLocaleDateString()} -{' '}
                  {new Date(selectedTrip.endDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-charcoal-600">Status</p>
                <p className="text-charcoal-800 capitalize">{selectedTrip.status}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
