// Admin dashboard - manage all patients, appointments, and system settings
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { authRequest } from '@/lib/api';
import { Users, Calendar, Activity, Settings, Search, Filter, Ticket, X } from 'lucide-react';

const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchUser, setSearchUser] = useState('');
  const [searchAppointment, setSearchAppointment] = useState('');
  const [searchToken, setSearchToken] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTokenStatus, setFilterTokenStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (!isAdmin) return;
    fetchData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersData, appointmentsData, tokensData] = await Promise.all([
        authRequest('/api/admin/users'),
        authRequest('/api/admin/appointments'),
        authRequest('/api/admin/tokens')
      ]);

      setUsers(usersData.users || []);
      setAppointments(appointmentsData.appointments || []);
      setTokens(tokensData.tokens || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search users
  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchUser.toLowerCase())
  );

  // Get appointments for selected user
  const selectedUserAppointments = selectedUser
    ? appointments.filter(a => a.userId === selectedUser._id || a.patientName === selectedUser.name)
    : [];

  // Get tokens for selected user
  const selectedUserTokens = selectedUser
    ? tokens.filter(t => t.userId === selectedUser._id || t.patientName === selectedUser.name)
    : [];

  // Filter and search appointments
  let filteredAppointments = appointments.filter(a =>
    a.patientName?.toLowerCase().includes(searchAppointment.toLowerCase()) ||
    a.doctor?.toLowerCase().includes(searchAppointment.toLowerCase()) ||
    a.department?.toLowerCase().includes(searchAppointment.toLowerCase())
  );

  if (filterStatus !== 'all') {
    filteredAppointments = filteredAppointments.filter(a => a.status === filterStatus);
  }

  // Filter and search tokens
  let filteredTokens = tokens.filter(t =>
    t.patientName?.toLowerCase().includes(searchToken.toLowerCase()) ||
    t.department?.toLowerCase().includes(searchToken.toLowerCase()) ||
    String(t.number).includes(searchToken)
  );

  if (filterTokenStatus !== 'all') {
    filteredTokens = filteredTokens.filter(t => t.status === filterTokenStatus);
  }

  // Statistics
  const stats = {
    totalUsers: users.length,
    totalAppointments: appointments.length,
    totalTokens: tokens.length,
    activeAppointments: appointments.filter(a => a.status === 'upcoming' || a.status === 'in-progress').length,
    completedAppointments: appointments.filter(a => a.status === 'completed').length,
    activeTokens: tokens.filter(t => t.status === 'waiting' || t.status === 'in-progress').length,
  };

  if (!isAdmin) return <Layout><div>Admin only</div></Layout>;

  return (
    <Layout>
      <div className="container py-10 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage hospital services, staff, patients, and appointments</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">Registered patients</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAppointments}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Ticket className="w-4 h-4" />
                Queue Tokens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTokens}</div>
              <p className="text-xs text-muted-foreground mt-1">All tokens</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeAppointments + stats.activeTokens}</div>
              <p className="text-xs text-muted-foreground mt-1">Appointments & tokens</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedAppointments}</div>
              <p className="text-xs text-muted-foreground mt-1">Appointments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="w-4 h-4" />
                In Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeTokens}</div>
              <p className="text-xs text-muted-foreground mt-1">Waiting/In-progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Users, Appointments, and Tokens */}
        <Tabs defaultValue="appointments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="tokens">Queue Tokens</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Appointments</CardTitle>
                <CardDescription>View and manage all hospital appointments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by patient, doctor, or department..."
                        value={searchAppointment}
                        onChange={(e) => setSearchAppointment(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={fetchData} variant="outline">
                    Refresh
                  </Button>
                </div>

                {/* Appointments Table */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient Name</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAppointments.length > 0 ? (
                        filteredAppointments.map(a => (
                          <TableRow key={a._id}>
                            <TableCell className="font-medium">{a.patientName}</TableCell>
                            <TableCell>{a.doctor}</TableCell>
                            <TableCell>{a.department}</TableCell>
                            <TableCell>{a.date} {a.time}</TableCell>
                            <TableCell>{a.phone || 'N/A'}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  a.status === 'completed'
                                    ? 'default'
                                    : a.status === 'in-progress'
                                      ? 'secondary'
                                      : a.status === 'cancelled'
                                        ? 'destructive'
                                        : 'outline'
                                }
                              >
                                {a.status?.charAt(0).toUpperCase() + a.status?.slice(1)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan="6" className="text-center py-4 text-muted-foreground">
                            No appointments found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tokens Tab */}
          <TabsContent value="tokens" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Queue Tokens</CardTitle>
                <CardDescription>View and manage all patient queue tokens</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by token number, patient, or department..."
                        value={searchToken}
                        onChange={(e) => setSearchToken(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <Select value={filterTokenStatus} onValueChange={setFilterTokenStatus}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="waiting">Waiting</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={fetchData} variant="outline">
                    Refresh
                  </Button>
                </div>

                {/* Tokens Table */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Token #</TableHead>
                        <TableHead>Patient Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Est. Time</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTokens.length > 0 ? (
                        filteredTokens.map(t => (
                          <TableRow key={t._id}>
                            <TableCell className="font-bold text-lg">{t.number}</TableCell>
                            <TableCell className="font-medium">{t.patientName}</TableCell>
                            <TableCell>{t.department}</TableCell>
                            <TableCell>{t.position}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  t.status === 'completed'
                                    ? 'default'
                                    : t.status === 'in-progress'
                                      ? 'secondary'
                                      : t.status === 'cancelled'
                                        ? 'destructive'
                                        : 'outline'
                                }
                              >
                                {t.status?.charAt(0).toUpperCase() + t.status?.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>{t.estimatedTime || 'N/A'}</TableCell>
                            <TableCell>{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan="7" className="text-center py-4 text-muted-foreground">
                            No tokens found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Users/Patients</CardTitle>
                <CardDescription>View and manage registered patients - Click on a user to see their full profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Appointments</TableHead>
                        <TableHead>Tokens</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map(u => {
                          const userAppointmentCount = appointments.filter(a => a.userId === u._id || a.patientName === u.name).length;
                          const userTokenCount = tokens.filter(t => t.userId === u._id || t.patientName === u.name).length;
                          return (
                            <TableRow key={u._id} className="cursor-pointer hover:bg-muted transition-colors">
                              <TableCell className="font-medium">{u.name}</TableCell>
                              <TableCell>{u.email}</TableCell>
                              <TableCell>
                                <Badge variant={u.role === 'admin' ? 'secondary' : 'outline'}>
                                  {u.role?.charAt(0).toUpperCase() + u.role?.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{userAppointmentCount}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{userTokenCount}</Badge>
                              </TableCell>
                              <TableCell>
                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                              </TableCell>
                              <TableCell>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => setSelectedUser(u)}
                                >
                                  View Details
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan="7" className="text-center py-4 text-muted-foreground">
                            No users found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Admin Settings</CardTitle>
                <CardDescription>Configure hospital services and settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">System Status</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">System is operational</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Database</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">MongoDB connected</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Data Overview</h3>
                    <div className="text-sm space-y-1">
                      <p>📊 Total Users: <span className="font-semibold">{stats.totalUsers}</span></p>
                      <p>📅 Total Appointments: <span className="font-semibold">{stats.totalAppointments}</span></p>
                      <p>🎫 Total Tokens: <span className="font-semibold">{stats.totalTokens}</span></p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Last Data Refresh</h3>
                    <p className="text-sm text-muted-foreground">{new Date().toLocaleString()}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button onClick={fetchData} variant="default">
                    Refresh All Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* User Details Modal */}
      <Dialog open={Boolean(selectedUser)} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl">{selectedUser?.name}</DialogTitle>
                <DialogDescription>{selectedUser?.email}</DialogDescription>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              {/* User Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle>User Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Name</p>
                      <p className="text-base font-semibold">{selectedUser.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p className="text-base">{selectedUser.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Role</p>
                      <Badge className="mt-1">
                        {selectedUser.role?.charAt(0).toUpperCase() + selectedUser.role?.slice(1)}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                      <p className="text-base">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* User's Appointments */}
              <Card>
                <CardHeader>
                  <CardTitle>User Appointments ({selectedUserAppointments.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedUserAppointments.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Doctor</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedUserAppointments.map(a => (
                          <TableRow key={a._id}>
                            <TableCell>{a.doctor}</TableCell>
                            <TableCell>{a.department}</TableCell>
                            <TableCell>{a.date} {a.time}</TableCell>
                            <TableCell>{a.phone || 'N/A'}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  a.status === 'completed'
                                    ? 'default'
                                    : a.status === 'in-progress'
                                      ? 'secondary'
                                      : a.status === 'cancelled'
                                        ? 'destructive'
                                        : 'outline'
                                }
                              >
                                {a.status?.charAt(0).toUpperCase() + a.status?.slice(1)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-sm text-muted-foreground">No appointments found for this user</p>
                  )}
                </CardContent>
              </Card>

              {/* User's Tokens */}
              <Card>
                <CardHeader>
                  <CardTitle>User Queue Tokens ({selectedUserTokens.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedUserTokens.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Token #</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Position</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Est. Time</TableHead>
                          <TableHead>Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedUserTokens.map(t => (
                          <TableRow key={t._id}>
                            <TableCell className="font-bold text-lg">{t.number}</TableCell>
                            <TableCell>{t.department}</TableCell>
                            <TableCell>{t.position}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  t.status === 'completed'
                                    ? 'default'
                                    : t.status === 'in-progress'
                                      ? 'secondary'
                                      : t.status === 'cancelled'
                                        ? 'destructive'
                                        : 'outline'
                                }
                              >
                                {t.status?.charAt(0).toUpperCase() + t.status?.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>{t.estimatedTime || 'N/A'}</TableCell>
                            <TableCell>{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-sm text-muted-foreground">No tokens found for this user</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default AdminDashboard;

