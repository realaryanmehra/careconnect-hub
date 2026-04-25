// ============================================
// SIMPLIFIED DashboardPage.jsx - Patient Dashboard
// ============================================
// This is the main dashboard page shown after user logs in
// It displays patient info, appointments, medical records, and prescriptions

// ============================================
// Import React and hooks
// ============================================
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getDashboard } from "@/lib/api";
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
  Video
} from "lucide-react";

// ============================================
// Import UI components
// ============================================
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ============================================
// Import Layout component
// ============================================
import Layout from "@/components/Layout";

// ============================================
// Import Link for navigation
// ============================================
import { Link } from "react-router-dom";

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
          <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
            {/* Avatar and Name */}
            <div className="flex items-center gap-4 mb-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-full gradient-primary text-primary-foreground font-extrabold text-xl">
                {/* Get initials from name */}
                {patientInfo.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">{patientInfo.name}</h3>
                <p className="text-xs text-muted-foreground font-mono">{patientInfo.id}</p>
              </div>
            </div>
            
            {/* Patient Details */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Age:</span>{" "}
                <span className="font-medium text-foreground">{patientInfo.age} yrs</span>
              </div>
              <div>
                <span className="text-muted-foreground">Blood:</span>{" "}
                <span className="font-medium text-foreground">{patientInfo.blood}</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Phone:</span>{" "}
                <span className="font-medium text-foreground">{patientInfo.phone}</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Email:</span>{" "}
                <span className="font-medium text-foreground">{patientInfo.email}</span>
              </div>
            </div>
          </div>

          {/* Vitals Card */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-soft">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary"/> 
              Latest Vitals
            </h3>
            
            {/* Vitals Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {vitals.map((v) => (
                <div key={v.label} className="bg-muted rounded-xl p-4 text-center">
                  {/* Icon */}
                  <v.icon className="h-5 w-5 text-primary mx-auto mb-2"/>
                  
                  {/* Value */}
                  <div className="text-2xl font-extrabold text-foreground">{v.value}</div>
                  
                  {/* Unit */}
                  <div className="text-xs text-muted-foreground">{v.unit}</div>
                  
                  {/* Label */}
                  <div className="text-xs text-muted-foreground mt-1">{v.label}</div>
                  
                  {/* Trend indicator (if elevated) */}
                  {v.trend === "up" && (
                    <TrendingUp className="h-3 w-3 text-warning mx-auto mt-1"/>
                  )}
                </div>
              ))}
            </div>
          </div>
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
                <div className="text-center py-10 text-muted-foreground">
                  No appointments found.
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
          </TabsContent>
          
        </Tabs>
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

