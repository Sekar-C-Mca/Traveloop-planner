'use client';

import React, { useState } from 'react';
import { Trash, PencilSimple, Eye, MagnifyingGlass } from '@phosphor-icons/react';
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

interface User {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  trips: number;
  status: 'active' | 'inactive';
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    joinDate: '2024-01-15',
    trips: 12,
    status: 'active',
  },
  {
    id: '2',
    name: 'John Smith',
    email: 'john@example.com',
    joinDate: '2024-02-20',
    trips: 8,
    status: 'active',
  },
  {
    id: '3',
    name: 'Emma Wilson',
    email: 'emma@example.com',
    joinDate: '2024-03-10',
    trips: 5,
    status: 'inactive',
  },
  {
    id: '4',
    name: 'Michael Johnson',
    email: 'michael@example.com',
    joinDate: '2024-01-25',
    trips: 15,
    status: 'active',
  },
  {
    id: '5',
    name: 'Lisa Anderson',
    email: 'lisa@example.com',
    joinDate: '2024-04-05',
    trips: 3,
    status: 'active',
  },
];

export function AdminUserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const filteredUsers = mockUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsDetailDialogOpen(true);
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
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="border border-sand-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-sand-50 hover:bg-sand-50">
              <TableHead className="text-charcoal-700 font-semibold">Name</TableHead>
              <TableHead className="text-charcoal-700 font-semibold">Email</TableHead>
              <TableHead className="text-charcoal-700 font-semibold">Join Date</TableHead>
              <TableHead className="text-charcoal-700 font-semibold text-center">
                Trips
              </TableHead>
              <TableHead className="text-charcoal-700 font-semibold">Status</TableHead>
              <TableHead className="text-right text-charcoal-700 font-semibold">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} className="hover:bg-sand-50">
                <TableCell className="font-medium text-charcoal-800">
                  {user.name}
                </TableCell>
                <TableCell className="text-charcoal-600">{user.email}</TableCell>
                <TableCell className="text-charcoal-600">
                  {new Date(user.joinDate).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-center text-charcoal-800 font-medium">
                  {user.trips}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                      user.status === 'active'
                        ? 'bg-forest-100 text-forest-700'
                        : 'bg-charcoal-100 text-charcoal-700'
                    }`}
                  >
                    {user.status === 'active' ? '● Active' : '● Inactive'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleViewUser(user)}
                      className="rounded-lg p-2 text-charcoal-600 hover:bg-sand-100 transition-colors"
                      title="View details"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      className="rounded-lg p-2 text-charcoal-600 hover:bg-sand-100 transition-colors"
                      title="Edit user"
                    >
                      <PencilSimple size={18} />
                    </button>
                    <button
                      className="rounded-lg p-2 text-charcoal-600 hover:bg-ember-100 hover:text-ember-600 transition-colors"
                      title="Delete user"
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

      {/* User Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              User Details
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-charcoal-600">Name</p>
                <p className="text-charcoal-800">{selectedUser.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-charcoal-600">Email</p>
                <p className="text-charcoal-800">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-charcoal-600">Join Date</p>
                <p className="text-charcoal-800">
                  {new Date(selectedUser.joinDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-charcoal-600">Total Trips</p>
                <p className="text-charcoal-800">{selectedUser.trips}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-charcoal-600">Status</p>
                <p className="text-charcoal-800 capitalize">{selectedUser.status}</p>
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
