'use client';

import React, { useState, useEffect } from 'react';
import { Trash, Eye, MagnifyingGlass, SpinnerGap } from '@phosphor-icons/react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { fetchAdminUsers, type AdminUser } from '@/lib/api-hooks';

export function AdminUserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    fetchAdminUsers({ limit: 50 })
      .then(({ users, total }) => { setUsers(users); setTotal(total); })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card className="border border-sand-200">
        <div className="p-4 sm:p-6">
          <div className="relative">
            <MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
            <Input
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      {/* Table */}
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
                  <TableHead className="text-charcoal-700 font-semibold">Name</TableHead>
                  <TableHead className="text-charcoal-700 font-semibold hidden sm:table-cell">Email</TableHead>
                  <TableHead className="text-charcoal-700 font-semibold hidden md:table-cell">Joined</TableHead>
                  <TableHead className="text-charcoal-700 font-semibold text-center">Trips</TableHead>
                  <TableHead className="text-charcoal-700 font-semibold">Role</TableHead>
                  <TableHead className="text-right text-charcoal-700 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-charcoal-400 text-sm">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((user) => (
                    <TableRow key={user.id} className="hover:bg-sand-50">
                      <TableCell className="font-medium text-charcoal-800">{user.name}</TableCell>
                      <TableCell className="text-charcoal-600 hidden sm:table-cell">{user.email}</TableCell>
                      <TableCell className="text-charcoal-600 hidden md:table-cell">
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-center text-charcoal-800 font-medium">{user.trip_count}</TableCell>
                      <TableCell>
                        <span className={`inline-flex rounded-full px-2 sm:px-3 py-1 text-xs font-medium ${
                          user.is_admin ? 'bg-ember-100 text-ember-700' : 'bg-forest-100 text-forest-700'
                        }`}>
                          {user.is_admin ? 'Admin' : 'User'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 sm:gap-2">
                          <button
                            onClick={() => { setSelectedUser(user); setIsDetailOpen(true); }}
                            className="rounded-lg p-1.5 sm:p-2 text-charcoal-600 hover:bg-sand-100 transition-colors"
                            title="View details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="rounded-lg p-1.5 sm:p-2 text-charcoal-600 hover:bg-ember-100 hover:text-ember-600 transition-colors"
                            title="Delete user"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div><p className="text-sm font-medium text-charcoal-600">Name</p><p className="text-charcoal-800">{selectedUser.name}</p></div>
              <div><p className="text-sm font-medium text-charcoal-600">Email</p><p className="text-charcoal-800">{selectedUser.email}</p></div>
              <div><p className="text-sm font-medium text-charcoal-600">Joined</p><p className="text-charcoal-800">{new Date(selectedUser.created_at).toLocaleDateString()}</p></div>
              <div><p className="text-sm font-medium text-charcoal-600">Total Trips</p><p className="text-charcoal-800">{selectedUser.trip_count}</p></div>
              <div><p className="text-sm font-medium text-charcoal-600">Role</p><p className="text-charcoal-800 capitalize">{selectedUser.is_admin ? 'Admin' : 'User'}</p></div>
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
