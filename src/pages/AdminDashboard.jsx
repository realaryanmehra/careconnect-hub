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
import { 
  authRequest, 
  updateAppointment, deleteAppointment, createAppointment,
  updateTokenAdmin as updateToken, deleteTokenAdmin as deleteToken, createTokenAdmin as createToken,
  updateUserAdmin as updateUser, deleteUserAdmin as deleteUser 
} from '@/lib/api';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit3, Trash2, Plus, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { Users, Calendar, Activity, Settings, Search, Filter, Ticket, X, Video } from 'lucide-react';
import VideoCallModal from '@/components/VideoCallModal';
import { socket } from '@/lib/socket';
import AdminDepartmentsTab from '@/components/AdminDepartmentsTab';
import SplitText from '@/components/SplitText';

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
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [editingToken, setEditingToken] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: '', id: '', name: '' });
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoCallRoom, setVideoCallRoom] = useState(null);

  const handleStartVideoCall = (tokenId) => {
    setVideoCallRoom(tokenId);
    setIsVideoModalOpen(true);
  };

  useEffect(() => {
    if (!isAdmin) return;
    fetchData();
    
    // 1. Listen for real-time token updates (e.g. status or payment changes)
    const onTokenUpdated = (data) => {
      console.log("⚡ Admin: Token update received:", data);
      setTokens(prev => prev.map(t => 
        (t.id === data.id || t._id === data.id) 
          ? { ...t, status: data.status || t.status, paymentStatus: data.paymentStatus || t.paymentStatus } 
          : t
      ));
    };

    socket.on('tokenUpdated', onTokenUpdated);

    // 2. Auto-refresh every 30 seconds as a fallback
    const interval = setInterval(fetchData, 30000);
    
    return () => {
      clearInterval(interval);
      socket.off('tokenUpdated', onTokenUpdated);
    };
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
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAppointment = async (id, updates) => {
    setSaving(true);
    try {
      await updateAppointment(id, updates);
      toast({ title: "Success", description: "Appointment updated" });
      fetchData();
      setEditingAppointment(null);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Update failed",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAppointment = async (id, name) => {
    setSaving(true);
    try {
      await deleteAppointment(id);
      toast({ title: "Success", description: `Deleted ${name}` });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Delete failed",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
      setDeleteDialog({ open: false, type: '', id: '', name: '' });
    }
  };

  const handleUpdateToken = async (id, updates) => {
    setSaving(true);
    try {
      await updateToken(id, updates);
      toast({ title: "Success", description: "Token updated" });
      fetchData();
      setEditingToken(null);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Update failed",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteToken = async (id, name) => {
    setSaving(true);
    try {
      await deleteToken(id);
      toast({ title: "Success", description: `Deleted ${name}` });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Delete failed",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
      setDeleteDialog({ open: false, type: '', id: '', name: '' });
    }
  };

  const handleUpdateUser = async (id, updates) => {
    setSaving(true);
    try {
      await updateUser(id, updates);
      toast({ title: "Success", description: "User updated" });
      fetchData();
      setEditingUser(null);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Update failed",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (id, name) => {
    setSaving(true);
    try {
      await deleteUser(id);
      toast({ title: "Success", description: `Deleted ${name}` });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Delete failed",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
      setDeleteDialog({ open: false, type: '', id: '', name: '' });
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
          <h1 className="text-4xl font-bold">
            <SplitText text="Admin " triggerOnView={false} />
            <span className="text-primary"><SplitText text="Dashboard" triggerOnView={false} delay={0.2} /></span>
          </h1>
          <p className="text-muted-foreground">Manage hospital services, staff, patients, and appointments</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card className="stat-widget overflow-hidden relative group">
            <div className="absolute -inset-2 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full blur-xl z-0"/>
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4 text-primary" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-extrabold tracking-tighter text-foreground">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground/70 mt-1 font-medium">Registered patients</p>
            </CardContent>
          </Card>

          <Card className="stat-widget overflow-hidden relative group">
            <div className="absolute -inset-2 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full blur-xl z-0"/>
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4 text-primary" />
                Appointments
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-extrabold tracking-tighter text-foreground">{stats.totalAppointments}</div>
              <p className="text-xs text-muted-foreground/70 mt-1 font-medium">All time</p>
            </CardContent>
          </Card>

          <Card className="stat-widget overflow-hidden relative group">
            <div className="absolute -inset-2 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full blur-xl z-0"/>
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <Ticket className="w-4 h-4 text-primary" />
                Queue Tokens
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-extrabold tracking-tighter text-foreground">{stats.totalTokens}</div>
              <p className="text-xs text-muted-foreground/70 mt-1 font-medium">All tokens</p>
            </CardContent>
          </Card>

          <Card className="stat-widget overflow-hidden relative group">
            <div className="absolute -inset-2 bg-gradient-to-tr from-info/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full blur-xl z-0"/>
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <Activity className="w-4 h-4 text-info" />
                Active
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-extrabold tracking-tighter text-foreground">{stats.activeAppointments + stats.activeTokens}</div>
              <p className="text-xs text-muted-foreground/70 mt-1 font-medium">Appointments & tokens</p>
            </CardContent>
          </Card>

          <Card className="stat-widget overflow-hidden relative group">
            <div className="absolute -inset-2 bg-gradient-to-tr from-success/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full blur-xl z-0"/>
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <Settings className="w-4 h-4 text-success" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-extrabold tracking-tighter text-foreground">{stats.completedAppointments}</div>
              <p className="text-xs text-muted-foreground/70 mt-1 font-medium">Appointments</p>
            </CardContent>
          </Card>

          <Card className="stat-widget overflow-hidden relative group">
            <div className="absolute -inset-2 bg-gradient-to-tr from-warning/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full blur-xl z-0"/>
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <Activity className="w-4 h-4 text-warning" />
                In Queue
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-extrabold tracking-tighter text-foreground">{stats.activeTokens}</div>
              <p className="text-xs text-muted-foreground/70 mt-1 font-medium">Waiting/In-progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Users, Appointments, and Tokens */}
        <Tabs defaultValue="appointments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="tokens">Queue Tokens</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="departments">Doctors & Depts</TabsTrigger>
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
                            <TableCell>
                              {a.department}
                              {a.isTelemedicine && (
                                <Badge variant="outline" className="ml-2 text-xs bg-indigo-50 text-indigo-700 border-indigo-200">Online</Badge>
                              )}
                            </TableCell>
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
                            <TableCell className="flex gap-1">
                              {a.isTelemedicine && a.meetingLink && a.status !== 'cancelled' && (
                                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" title="Join Video Call" asChild>
                                  <a href={a.meetingLink} target="_blank" rel="noopener noreferrer">
                                    <Video className="w-4 h-4" />
                                  </a>
                                </Button>
                              )}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="outline" onClick={() => setEditingAppointment(a)}>
                                    <Edit3 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Edit Appointment</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Update status and notes for {a.patientName}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label>Status</Label>
                                      <Select value={editingAppointment?.status || a.status} onValueChange={(v) => setEditingAppointment({...editingAppointment, status: v})}>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="upcoming">Upcoming</SelectItem>
                                          <SelectItem value="in-progress">In Progress</SelectItem>
                                          <SelectItem value="completed">Completed</SelectItem>
                                          <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label>Notes</Label>
                                      <Textarea 
                                        value={editingAppointment?.notes || a.notes || ''} 
                                        onChange={(e) => setEditingAppointment({...editingAppointment, notes: e.target.value})}
                                        placeholder="Additional notes..."
                                      />
                                    </div>
                                  </div>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setEditingAppointment(null)}>Cancel</AlertDialogCancel>
                                    <Button onClick={() => handleUpdateAppointment(a.id, editingAppointment || a)} disabled={saving}>
                                      {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                                      Save
                                    </Button>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="destructive" onClick={() => setDeleteDialog({open: true, type: 'appointment', id: a.id, name: a.patientName})}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Appointment?</AlertDialogTitle>
                                    <AlertDialogDescription>Delete {a.patientName}'s appointment? This cannot be undone.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteAppointment(a.id, a.patientName)}>Delete</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
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

                  {/* New Payment Status Filter */}
                  <Select 
                    value={editingToken?.filterPaymentStatus || 'all'} 
                    onValueChange={(v) => {
                      // This is a quick way to filter tokens by payment status
                      setTokens(prev => [...prev]); // trigger re-render
                      setFilterTokenStatus(v === 'paid' ? 'paid-only' : v === 'pending' ? 'pending-only' : 'all');
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Payment: All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Payment: All</SelectItem>
                      <SelectItem value="paid">Paid Only</SelectItem>
                      <SelectItem value="pending">Pending Only</SelectItem>
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
                        <TableHead>Payment</TableHead>
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
                            <TableCell>
                              <Badge
                                variant={t.paymentStatus === 'paid' ? 'success' : 'warning'}
                                className="font-semibold"
                              >
                                {t.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                              </Badge>
                            </TableCell>
                            <TableCell>{t.estimatedTime || 'N/A'}</TableCell>
                            <TableCell>{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                            <TableCell className="flex gap-1">
                              {t.status === 'in-progress' && (
                                <Button size="sm" variant="outline" className="text-primary border-primary/20 hover:bg-primary hover:text-white" onClick={() => handleStartVideoCall(t.id || t._id)}>
                                  <Video className="w-4 h-4 mr-1" /> Call
                                </Button>
                              )}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="outline" onClick={() => setEditingToken(t)}>
                                    <Edit3 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Edit Token #{t.number}</AlertDialogTitle>
                                    <AlertDialogDescription>Update status for {t.patientName}</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label>Status</Label>
                                      <Select value={editingToken?.status || t.status} onValueChange={(v) => setEditingToken({...editingToken, status: v})}>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="waiting">Waiting</SelectItem>
                                          <SelectItem value="in-progress">In Progress</SelectItem>
                                          <SelectItem value="completed">Completed</SelectItem>
                                          <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label>Estimated Time</Label>
                                      <Input 
                                        type="time" 
                                        value={editingToken?.estimatedTime || t.estimatedTime || ''} 
                                        onChange={(e) => setEditingToken({...editingToken, estimatedTime: e.target.value})}
                                      />
                                    </div>
                                  </div>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setEditingToken(null)}>Cancel</AlertDialogCancel>
                                    <Button onClick={() => handleUpdateToken(t.id, editingToken || t)} disabled={saving}>
                                      {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                                      Save
                                    </Button>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="destructive" onClick={() => setDeleteDialog({open: true, type: 'token', id: t.id, name: `Token #${t.number}`})}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Token?</AlertDialogTitle>
                                    <AlertDialogDescription>Delete Token #{t.number} for {t.patientName}? This cannot be undone.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteToken(t.id, `Token #${t.number}`)}>Delete</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
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

          {/* Departments Tab */}
          <TabsContent value="departments" className="space-y-4">
            <AdminDepartmentsTab />
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
      <VideoCallModal 
        isOpen={isVideoModalOpen} 
        onClose={() => setIsVideoModalOpen(false)} 
        roomId={videoCallRoom} 
        socket={socket} 
      />
    </Layout>
  );
};

export default AdminDashboard;

