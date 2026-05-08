// ============================================
// SIMPLIFIED DashboardPage.jsx - Patient Dashboard
// ============================================
// This is the main dashboard page shown after user logs in
// It displays patient info, appointments, medical records, and prescriptions

// ============================================
// Import React and hooks
// ============================================
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { getDashboard, updateProfile } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

// ============================================
// Import icons from lucide-react
// ============================================
import { 
  Calendar, 
  Clock, 
  Hash, 
  FileText, 
  Activity, 
  Heart, 
  Download, 
  Eye, 
  Filter, 
  Pill, 
  Thermometer, 
  Droplets, 
  TrendingUp,
  Video,
  Mail,
  Phone,
  User,
  Zap,
  Settings,
  Save,
  X as CloseIcon
} from "lucide-react";

// ============================================
// Import UI components
// ============================================
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// ============================================
// Import Layout component
// ============================================
import Layout from "@/components/Layout";

// ============================================
// Import Link for navigation
// ============================================
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

// ============================================
// MOCK DATA - Sample data for demonstration
// ============================================
// In a real app, this would come from an API
// This represents the logged-in patient's information

const patientInfo = {
  name: "samarpreet singh",
  id: "PT-20260001",
  age: 23,
  blood: "B+",
  phone: "+91 98765 43210",
  email: "rahul.sharma@email.com",
};

// Active tokens (queue numbers) for the patient
const activeTokens = [
  { 
    number: 3, 
    department: "Cardiology", 
    doctor: "Dr. Anil Kapoor", 
    status: "waiting", 
    position: 2, 
    estimatedTime: "~20 min" 
  },
  { 
    number: 7, 
    department: "General Medicine", 
    doctor: "Dr. Pooja Reddy", 
    status: "in-progress", 
    position: 0, 
    estimatedTime: "Now" 
  },
];

// Patient's appointments
const appointments = [
  { id: "APT-001", department: "Cardiology", doctor: "Dr. Anil Kapoor", date: "2026-02-25", time: "10:00 AM", status: "upcoming" },
  { id: "APT-002", department: "Neurology", doctor: "Dr. Rajesh Gupta", date: "2026-02-20", time: "11:30 AM", status: "completed" },
  { id: "APT-003", department: "General Medicine", doctor: "Dr. Pooja Reddy", date: "2026-02-15", time: "09:00 AM", status: "completed" },
  { id: "APT-004", department: "Orthopedics", doctor: "Dr. Vikram Rao", date: "2026-01-28", time: "02:30 PM", status: "completed" },
  { id: "APT-005", department: "Pediatrics", doctor: "Dr. Kavita Sharma", date: "2026-01-10", time: "03:00 PM", status: "cancelled" },
];

// Patient's medical records
const medicalRecords = [
  { id: "MR-001", title: "Blood Test Report", type: "Lab Report", date: "2026-02-20", department: "Pathology", doctor: "Dr. Rajesh Gupta" },
  { id: "MR-002", title: "ECG Report", type: "Diagnostic", date: "2026-02-15", department: "Cardiology", doctor: "Dr. Anil Kapoor" },
  { id: "MR-003", title: "X-Ray - Left Knee", type: "Radiology", date: "2026-01-28", department: "Orthopedics", doctor: "Dr. Vikram Rao" },
  { id: "MR-004", title: "Prescription - Hypertension", type: "Prescription", date: "2026-01-15", department: "General Medicine", doctor: "Dr. Pooja Reddy" },
  { id: "MR-005", title: "MRI Brain Scan", type: "Radiology", date: "2025-12-10", department: "Neurology", doctor: "Dr. Sonal Verma" },
];

// Patient's current vital signs
const vitals = [
  { label: "Blood Pressure", value: "120/80", unit: "mmHg", icon: Heart, trend: "normal" },
  { label: "Heart Rate", value: "72", unit: "bpm", icon: Activity, trend: "normal" },
  { label: "Temperature", value: "98.6", unit: "°F", icon: Thermometer, trend: "normal" },
  { label: "Blood Sugar", value: "110", unit: "mg/dL", icon: Droplets, trend: "up" },
];

// Patient's prescriptions
const prescriptions = [
  { name: "Amlodipine 5mg", dosage: "1 tablet daily", duration: "30 days", doctor: "Dr. Pooja Reddy" },
  { name: "Metformin 500mg", dosage: "1 tablet twice daily", duration: "60 days", doctor: "Dr. Pooja Reddy" },
  { name: "Vitamin D3", dosage: "1 capsule weekly", duration: "12 weeks", doctor: "Dr. Vikram Rao" },
];

// ============================================
// STATUS CONFIGURATIONS
// ============================================
// These objects define how to display different statuses
// You can easily change colors/styles here

// Token status styles
const tokenStatusConfig = {
  waiting: { label: "Waiting", className: "bg-warning/10 text-warning border-warning/20" },
  "in-progress": { label: "In Progress", className: "bg-info/10 text-info border-info/20" },
};

// Appointment status styles
const aptStatusConfig = {
  upcoming: { label: "Upcoming", className: "bg-primary/10 text-primary border-primary/20" },
  completed: { label: "Completed", className: "bg-success/10 text-success border-success/20" },
  cancelled: { label: "Cancelled", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

// Medical record type styles
const recordTypeConfig = {
  "Lab Report": "bg-info/10 text-info",
  "Diagnostic": "bg-primary/10 text-primary",
  "Radiology": "bg-accent/10 text-accent-foreground",
  "Prescription": "bg-success/10 text-success",
};

// ============================================
// DashboardPage Component
// ============================================
const DashboardPage = () => {
  const { isAuthenticated } = useAuth();
  
  // Data state - starts loading
  const [dashboardData, setDashboardData] = useState({ loading: true });
  
  // Filter state
  const [aptFilter, setAptFilter] = useState("all");
  const [recordSearch, setRecordSearch] = useState("");
  
  // Profile edit state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    age: "",
    bloodGroup: "",
    phone: ""
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  // Fetch data on mount
  useEffect(() => {
    if (!isAuthenticated) return setDashboardData({ loading: false });
    
    const loadDashboard = async () => {
      try {
        const data = await getDashboard();
        setDashboardData(data);
      } catch (error) {
        console.error('Dashboard load error:', error);
        setDashboardData({ error: error.message, loading: false });
      }
    };
    
    loadDashboard();
  }, [isAuthenticated]);

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const response = await updateProfile(editForm);
      toast({ title: "Profile updated successfully" });
      setIsEditModalOpen(false);
      // Refresh dashboard data
      const data = await getDashboard();
      setDashboardData(data);
    } catch (error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Open modal with current data
  const openEditModal = () => {
    setEditForm({
      name: patientInfo.name || "",
      age: patientInfo.age || "",
      bloodGroup: patientInfo.bloodGroup || "",
      phone: patientInfo.phone || ""
    });
    setIsEditModalOpen(true);
  };

  if (dashboardData.loading) {
    return (
      <Layout>
        <div className="container py-10 space-y-8">
          <div className="space-y-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <Skeleton className="h-64 w-full" />
            <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array(4).fill().map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (dashboardData.error) {
    return (
      <Layout>
        <div className="container py-10 text-center">
          <p className="text-destructive">Error: {dashboardData.error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </Layout>
    );
  }

  // Destructure data with fallback
  const { patientInfo = {}, activeTokens = [], appointments = [], vitals = [], medicalRecords = [], prescriptions = [] } = dashboardData;

  // Filtered data
  const filteredApts = aptFilter === "all" 
    ? appointments 
    : appointments.filter(a => a.status === aptFilter);

  const filteredRecords = recordSearch
    ? medicalRecords.filter(r => 
        (r.title || '').toLowerCase().includes(recordSearch.toLowerCase()) || 
        (r.type || '').toLowerCase().includes(recordSearch.toLowerCase())
      )
    : medicalRecords;

  // ============================================
  // RENDER: Main Dashboard
  // ============================================
  return (
    <Layout>
      <div className="container py-10">
        
        {/* ============================================ */}
        {/* HEADER SECTION */}
        {/* ============================================ */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">
                Patient <span className="text-primary">Dashboard</span>
              </h1>
              <p className="text-muted-foreground mt-1">
                Welcome back, {patientInfo.name || 'Patient'}
              </p>
            </div>
            
            {/* Quick Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/tokens">Get Token</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/appointments">Book Appointment</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* PATIENT INFO + VITALS ROW */}
        {/* ============================================ */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          
          {/* Patient Information Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ y: -5 }}
            className="bg-card border border-border rounded-xl p-6 shadow-soft relative overflow-hidden group"
          >
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <User className="h-32 w-32 -mr-8 -mt-8 rotate-12" />
            </div>

            {/* Edit Button */}
            <div className="absolute top-4 right-4 z-20">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={openEditModal}
                className="h-8 w-8 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>

            {/* Avatar and Name */}
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-full gradient-primary text-primary-foreground font-extrabold text-2xl shadow-lg ring-4 ring-primary/10">
                  {patientInfo.name ? patientInfo.name.split(" ").map(n => n[0]).join("").toUpperCase() : "U"}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-success h-4 w-4 rounded-full border-2 border-card" title="Online"></div>
              </div>
              <div>
                <h3 className="font-bold text-foreground text-xl tracking-tight">{patientInfo.name}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="secondary" className="text-[10px] py-0 px-2 h-5 font-mono bg-primary/5 text-primary border-primary/10">
                    {patientInfo.id || 'PT-PENDING'}
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Patient Details */}
            <div className="space-y-4 relative z-10">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">Age</span>
                  <span className="font-bold text-foreground">{patientInfo.age || '--'} yrs</span>
                </div>
                <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">Blood Type</span>
                  <span className="font-bold text-destructive flex items-center gap-1">
                    <Droplets className="h-3 w-3" /> {patientInfo.bloodGroup || '--'}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm group/item">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover/item:bg-primary group-hover/item:text-primary-foreground transition-colors">
                    <Phone className="h-4 w-4" />
                  </div>
                  <span className="text-muted-foreground group-hover/item:text-foreground transition-colors">{patientInfo.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm group/item">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover/item:bg-primary group-hover/item:text-primary-foreground transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  <span className="text-muted-foreground group-hover/item:text-foreground transition-colors truncate">{patientInfo.email || 'Not provided'}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Vitals Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-soft"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary animate-pulse"/> 
                Latest Vitals
              </h3>
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-success bg-success/10 px-2.5 py-1 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                </span>
                Live Updates
              </div>
            </div>
            
            {/* Vitals Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {vitals.length > 0 ? vitals.map((v, idx) => (
                <motion.div 
                  key={v.label} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="stat-widget rounded-2xl p-5 text-center flex flex-col items-center justify-center relative overflow-hidden group border border-border/50 hover:border-primary/30"
                >
                  {/* Decorative background glow */}
                  <div className="absolute -inset-2 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full blur-xl z-0"/>
                  
                  {/* Content (z-10 to stay above glow) */}
                  <div className="relative z-10 flex flex-col items-center w-full">
                    {/* Icon */}
                    <div className="bg-primary/10 p-3 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      <v.icon className={`h-6 w-6 text-primary ${v.label === 'Heart Rate' ? 'animate-[pulse_1s_infinite]' : ''}`}/>
                    </div>
                    
                    {/* Value */}
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-foreground tracking-tighter">{v.value}</span>
                      <span className="text-[10px] text-muted-foreground/70 font-bold uppercase tracking-tight">{v.unit}</span>
                    </div>
                    
                    {/* Label */}
                    <div className="text-xs font-bold text-muted-foreground mt-2 uppercase tracking-widest">{v.label}</div>
                    
                    {/* Sparkline Visual (Simple SVG) */}
                    <div className="w-full h-8 mt-4 overflow-hidden opacity-30 group-hover:opacity-60 transition-opacity">
                      <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                        <path
                          d={`M0 30 Q 10 ${Math.random() * 30} 20 25 T 40 ${Math.random() * 30} T 60 20 T 80 ${Math.random() * 30} T 100 25`}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-primary"
                        />
                      </svg>
                    </div>

                    {/* Trend indicator */}
                    {v.trend === "up" && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 text-[8px] uppercase font-bold text-warning bg-warning/10 px-1.5 py-0.5 rounded-full">
                        <TrendingUp className="h-2 w-2"/> High
                      </div>
                    )}
                  </div>
                </motion.div>
              )) : (
                <div className="col-span-full py-12 flex flex-col items-center justify-center text-center">
                  <div className="relative mb-4">
                    <Activity className="h-16 w-16 text-muted/30" />
                    <motion.div 
                      animate={{ 
                        pathLength: [0, 1, 0],
                        opacity: [0.3, 0.6, 0.3]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <Zap className="h-8 w-8 text-primary/40" />
                    </motion.div>
                  </div>
                  <h4 className="text-muted-foreground font-medium">No Vitals Recorded Today</h4>
                  <p className="text-xs text-muted-foreground/60 max-w-xs mt-1">Your latest medical measurements will appear here after your checkup.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* ============================================ */}
        {/* ACTIVE TOKENS SECTION */}
        {/* ============================================ */}
        {activeTokens.length > 0 && (
          <div className="mb-8">
            <h3 className="font-bold text-foreground text-lg mb-4 flex items-center gap-2">
              <Hash className="h-5 w-5 text-primary"/> 
              Active Tokens
              <Badge variant="secondary" className="ml-1">
                {activeTokens.length}
              </Badge>
            </h3>
            
            {/* Tokens List */}
            <div className="grid md:grid-cols-2 gap-4">
              {activeTokens.map((token) => (
                <div 
                  key={token.number} 
                  className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 hover:shadow-medium transition-shadow"
                >
                  {/* Token Number */}
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary font-extrabold text-xl">
                    #{token.number}
                  </div>
                  
                  {/* Department and Doctor */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground">{token.department}</div>
                    <div className="text-sm text-muted-foreground">{token.doctor}</div>
                  </div>
                  
                  {/* Status and ETA */}
                  <div className="text-right shrink-0">
                    <Badge variant="outline" className={tokenStatusConfig[token.status].className}>
                      {tokenStatusConfig[token.status].label}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1 justify-end">
                      <Clock className="h-3 w-3"/> {token.estimatedTime}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* TABS: APPOINTMENTS, RECORDS, PRESCRIPTIONS */}
        {/* ============================================ */}
        <Tabs defaultValue="appointments" className="space-y-6">
          
          {/* Tab Buttons */}
          <TabsList className="bg-muted p-1 rounded-xl">
            <TabsTrigger value="appointments" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-soft">
              <Calendar className="h-4 w-4 mr-2"/> 
              Appointments
            </TabsTrigger>
            <TabsTrigger value="records" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-soft">
              <FileText className="h-4 w-4 mr-2"/> 
              Medical Records
            </TabsTrigger>
            <TabsTrigger value="prescriptions" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-soft">
              <Pill className="h-4 w-4 mr-2"/> 
              Prescriptions
            </TabsTrigger>
          </TabsList>

          {/* ============================================ */}
          {/* TAB 1: APPOINTMENTS */}
          {/* ============================================ */}
          <TabsContent value="appointments" className="space-y-4">
            
            {/* Filter Dropdown */}
            <div className="flex items-center gap-3">
              <Select value={aptFilter} onValueChange={setAptFilter}>
                <SelectTrigger className="w-44">
                  <Filter className="h-4 w-4 mr-2"/>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Appointments List */}
            <div className="space-y-3">
              {filteredApts.map((apt) => {
                // Get status style from config
                const sc = aptStatusConfig[apt.status];
                
                return (
                  <div 
                    key={apt.id} 
                    className="bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-medium transition-shadow"
                  >
                    {/* Calendar/Video Icon */}
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
                      {apt.isTelemedicine ? (
                        <Video className="h-5 w-5 text-indigo-500"/>
                      ) : (
                        <Calendar className="h-5 w-5 text-primary"/>
                      )}
                    </div>
                    
                    {/* Appointment Details */}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground flex items-center gap-2">
                        {apt.department}
                        {apt.isTelemedicine && (
                          <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200">Online</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {apt.doctor} • {apt.date} at {apt.time}
                      </div>
                    </div>
                    
                    {/* Status and ID and Join Button */}
                    <div className="flex items-center gap-3">
                      {apt.isTelemedicine && apt.meetingLink && apt.status !== 'cancelled' && (
                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" asChild>
                          <a href={apt.meetingLink} target="_blank" rel="noopener noreferrer">
                            Join Call
                          </a>
                        </Button>
                      )}
                      <Badge variant="outline" className={sc.className}>
                        {sc.label}
                      </Badge>
                      <span className="text-xs font-mono text-muted-foreground hidden sm:inline-block">
                        {apt.id}
                      </span>
                    </div>
                  </div>
                );
              })}
              
              {/* Empty State */}
              {filteredApts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border/60 rounded-xl bg-card/30">
                  <div className="bg-primary/10 p-3 rounded-full mb-3">
                    <Calendar className="h-8 w-8 text-primary opacity-80" />
                  </div>
                  <h3 className="font-bold text-foreground">No Appointments</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm mb-4">
                    {aptFilter === "all" ? "You don't have any appointments scheduled." : `You have no ${aptFilter} appointments.`}
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/appointments">Book an Appointment</Link>
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ============================================ */}
          {/* TAB 2: MEDICAL RECORDS */}
          {/* ============================================ */}
          <TabsContent value="records" className="space-y-4">
            
            {/* Search Input */}
            <Input 
              placeholder="Search records..." 
              value={recordSearch} 
              onChange={e => setRecordSearch(e.target.value)} 
              className="max-w-sm"
            />
            
            {/* Records List */}
            <div className="space-y-3">
              {filteredRecords.map((rec) => (
                <div 
                  key={rec.id} 
                  className="bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-medium transition-shadow"
                >
                  {/* Type Icon */}
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${recordTypeConfig[rec.type] || "bg-muted"}`}>
                    <FileText className="h-5 w-5"/>
                  </div>
                  
                  {/* Record Details */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground">{rec.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {rec.doctor} • {rec.department} • {rec.date}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{rec.type}</Badge>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4"/>
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4"/>
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State for Records */}
            {filteredRecords.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border/60 rounded-xl bg-card/30 mt-4">
                <div className="bg-primary/10 p-3 rounded-full mb-3">
                  <FileText className="h-8 w-8 text-primary opacity-80" />
                </div>
                <h3 className="font-bold text-foreground">No Records Found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  We couldn't find any medical records matching your search.
                </p>
              </div>
            )}
          </TabsContent>

          {/* ============================================ */}
          {/* TAB 3: PRESCRIPTIONS */}
          {/* ============================================ */}
          <TabsContent value="prescriptions" className="space-y-4">
            
            {/* Prescriptions Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {prescriptions.map((rx) => (
                <div 
                  key={rx.name} 
                  className="bg-card border border-border rounded-xl p-6 hover:shadow-medium transition-shadow"
                >
                  {/* Header with Pill Icon */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
                      <Pill className="h-5 w-5 text-success"/>
                    </div>
                    <h4 className="font-bold text-foreground">{rx.name}</h4>
                  </div>
                  
                  {/* Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dosage</span>
                      <span className="font-medium text-foreground">{rx.dosage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium text-foreground">{rx.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Prescribed by</span>
                      <span className="font-medium text-foreground">{rx.doctor}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State for Prescriptions */}
            {prescriptions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border/60 rounded-xl bg-card/30 mt-4">
                <div className="bg-primary/10 p-3 rounded-full mb-3">
                  <Pill className="h-8 w-8 text-primary opacity-80" />
                </div>
                <h3 className="font-bold text-foreground">No Prescriptions</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  You don't have any active prescriptions at this time.
                </p>
              </div>
            )}
          </TabsContent>
          
        </Tabs>
        
        {/* Edit Profile Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>
                Update your personal information below. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateProfile} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input 
                  id="edit-name" 
                  value={editForm.name} 
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-age">Age (yrs)</Label>
                  <Input 
                    id="edit-age" 
                    type="number"
                    value={editForm.age} 
                    onChange={(e) => setEditForm({...editForm, age: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-blood">Blood Group</Label>
                  <Input 
                    id="edit-blood" 
                    value={editForm.bloodGroup} 
                    onChange={(e) => setEditForm({...editForm, bloodGroup: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input 
                  id="edit-phone" 
                  value={editForm.phone} 
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  required
                />
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Saving..." : <><Save className="h-4 w-4 mr-2" /> Save Changes</>}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

// Export so it can be used in App.jsx
export default DashboardPage;

/* 
   DASHBOARD STRUCTURE:
   
   1. HEADER
      - Title: "Patient Dashboard"
      - Welcome message with patient name
      - Quick action buttons (Get Token, Book Appointment)
   
   2. PATIENT INFO + VITALS
      - Left: Patient card with name, age, blood type, contact
      - Right: 4 vital signs (BP, Heart Rate, Temperature, Blood Sugar)
   
   3. ACTIVE TOKENS (if any)
      - Shows queue tokens for today
      - Displays department, doctor, status, and ETA
   
   4. TABS SECTION
      - Tab 1: Appointments (with filter: all/upcoming/completed/cancelled)
      - Tab 2: Medical Records (with search)
      - Tab 3: Prescriptions

   STATE EXPLANATION:
   
   - aptFilter: Which appointments to show (string)
   - recordSearch: Search text for records (string)
   
   These state variables control what's displayed in each tab.
   When user changes filter/search, component re-renders
   with filtered data.

   HOW DATA FLOWS:
   
   1. Page loads with mock data (in a real app, fetched from API)
   2. State initialized with default values
   3. Components render based on state
   4. User interacts (filter, search)
   5. State updates
   6. Component re-renders with filtered data
   
   This is called "reactive" or "state-driven" rendering!
*/

