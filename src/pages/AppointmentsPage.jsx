// ============================================
// SIMPLIFIED AppointmentsPage.jsx - Book Appointment Page
// ============================================
// This page allows users to book doctor appointments
// It uses a multi-step form: Select Doctor → Select Time → Enter Details

// ============================================
// Import React and hooks
// ============================================
import { useState } from "react";

// ============================================
// Import UI components
// ============================================
import { Calendar, User, Stethoscope, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";

// ============================================
// STATIC DATA - Departments and Doctors
// ============================================
// This is sample data - in a real app, this would come from an API
const departments = [
  { name: "Cardiology", doctors: ["Dr. Anil Kapoor", "Dr. Meena Singh"] },
  { name: "Neurology", doctors: ["Dr. Rajesh Gupta", "Dr. Sonal Verma"] },
  { name: "Orthopedics", doctors: ["Dr. Vikram Rao", "Dr. Deepa Joshi"] },
  { name: "Pediatrics", doctors: ["Dr. Kavita Sharma", "Dr. Ravi Mishra"] },
  { name: "Ophthalmology", doctors: ["Dr. Sunita Patel", "Dr. Aman Khanna"] },
  { name: "General Medicine", doctors: ["Dr. Pooja Reddy", "Dr. Nikhil Bhatt"] },
];

// Available time slots for appointments
const timeSlots = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM"
];

// ============================================
// AppointmentsPage Component
// ============================================
const AppointmentsPage = () => {
  // ============================================
  // STATE: Current step in the form (1, 2, or 3)
  // ============================================
  // Step 1: Select department and doctor
  // Step 2: Select date and time
  // Step 3: Enter patient details
  const [step, setStep] = useState(1);

  // ============================================
  // STATE: Form field values
  // ============================================
  const [selectedDept, setSelectedDept] = useState("");     // Selected department
  const [selectedDoctor, setSelectedDoctor] = useState(""); // Selected doctor
  const [selectedDate, setSelectedDate] = useState("");      // Selected appointment date
  const [selectedTime, setSelectedTime] = useState("");     // Selected time slot
  const [patientName, setPatientName] = useState("");       // Patient's full name
  const [phone, setPhone] = useState("");                    // Patient's phone number
  const [notes, setNotes] = useState("");                    // Additional notes

  // ============================================
  // STATE: Booking confirmation
  // ============================================
  // When booking is complete, this holds the appointment details
  const [booked, setBooked] = useState(null);

  // ============================================
  // Get toast function for notifications
  // ============================================
  const { toast } = useToast();

  // ============================================
  // Get doctors for selected department
  // ============================================
  // This updates the doctor dropdown when department changes
  const currentDoctors = departments.find(d => d.name === selectedDept)?.doctors || [];

  // ============================================
  // handleBook - Confirm the appointment
  // ============================================
  const handleBook = () => {
    // Validate required fields
    if (!patientName || !phone) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    // Create appointment object
    const apt = {
      id: Math.random().toString(36).slice(2, 8).toUpperCase(), // Generate random ID
      patientName,
      department: selectedDept,
      doctor: selectedDoctor,
      date: selectedDate,
      time: selectedTime,
      notes,
    };

    // Show confirmation
    setBooked(apt);
  };

  // ============================================
  // reset - Start a new booking
  // ============================================
  const reset = () => {
    setStep(1);
    setSelectedDept("");
    setSelectedDoctor("");
    setSelectedDate("");
    setSelectedTime("");
    setPatientName("");
    setPhone("");
    setNotes("");
    setBooked(null);
  };

  // ============================================
  // RENDER: Success Confirmation Screen
  // ============================================
  if (booked) {
    return (
      <Layout>
        <div className="container py-20 flex items-center justify-center">
          <div className="bg-card border border-border rounded-2xl p-10 max-w-md w-full text-center shadow-strong">
            
            {/* Success Icon */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-success"/>
            </div>
            
            {/* Confirmation Message */}
            <h2 className="text-2xl font-extrabold text-foreground mb-2">
              Appointment Confirmed!
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Your booking ID: <span className="font-mono font-bold text-primary">{booked.id}</span>
            </p>
            
            {/* Appointment Details */}
            <div className="text-left space-y-3 bg-muted rounded-xl p-5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Patient</span>
                <span className="font-medium text-foreground">{booked.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Department</span>
                <span className="font-medium text-foreground">{booked.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Doctor</span>
                <span className="font-medium text-foreground">{booked.doctor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium text-foreground">{booked.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium text-foreground">{booked.time}</span>
              </div>
            </div>
            
            {/* Button to book another */}
            <Button className="w-full mt-6" onClick={reset}>
              Book Another Appointment
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // ============================================
  // RENDER: Multi-step Form
  // ============================================
  return (
    <Layout>
      <div className="container py-10">
        
        {/* Page Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2">
            Book <span className="text-primary">Appointment</span>
          </h1>
          <p className="text-muted-foreground mb-8">
            Schedule your visit in just a few steps.
          </p>
        </div>

        {/* Step Indicators (1 → 2 → 3) */}
        <div className="flex items-center gap-2 mb-10 max-w-lg">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                step >= s 
                  ? "gradient-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground"
              }`}>
                {s}
              </div>
              {/* Connector Line */}
              {s < 3 && (
                <div className={`flex-1 h-1 mx-2 rounded-full ${
                  step > s ? "bg-primary" : "bg-border"
                }`}/>
              )}
            </div>
          ))}
        </div>

        {/* Form Steps */}
        <div className="max-w-2xl">
          
          {/* STEP 1: Select Department and Doctor */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary"/>
                Select Department & Doctor
              </h2>
              
              <div className="space-y-4">
                {/* Department Dropdown */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Department
                  </label>
                  <Select 
                    value={selectedDept} 
                    onValueChange={(v) => { 
                      setSelectedDept(v); 
                      setSelectedDoctor(""); // Reset doctor when dept changes
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a department"/>
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(d => (
                        <SelectItem key={d.name} value={d.name}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Doctor Dropdown (only shows if department is selected) */}
                {selectedDept && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Doctor
                    </label>
                    <Select 
                      value={selectedDoctor} 
                      onValueChange={setSelectedDoctor}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a doctor"/>
                      </SelectTrigger>
                      <SelectContent>
                        {currentDoctors.map(d => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              
              {/* Continue Button */}
              <Button 
                disabled={!selectedDept || !selectedDoctor} 
                onClick={() => setStep(2)}
              >
                Continue <ArrowRight className="ml-2 h-4 w-4"/>
              </Button>
            </div>
          )}

          {/* STEP 2: Select Date and Time */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary"/>
                Select Date & Time
              </h2>
              
              <div className="space-y-4">
                {/* Date Picker */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Date
                  </label>
                  <Input 
                    type="date" 
                    value={selectedDate} 
                    onChange={e => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]} // Can't select past dates
                  />
                </div>
                
                {/* Time Slots (only shows if date is selected) */}
                {selectedDate && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">
                      Available Time Slots
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {timeSlots.map(slot => (
                        <button
                          key={slot}
                          onClick={() => setSelectedTime(slot)}
                          className={`py-2.5 px-3 rounded-lg border text-sm font-medium transition-all ${
                            selectedTime === slot
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-card border-border text-foreground hover:border-primary/50"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Navigation Buttons */}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button 
                  disabled={!selectedDate || !selectedTime} 
                  onClick={() => setStep(3)}
                >
                  Continue <ArrowRight className="ml-2 h-4 w-4"/>
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Patient Details */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <User className="h-5 w-5 text-primary"/>
                Patient Details
              </h2>
              
              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Full Name *
                  </label>
                  <Input 
                    placeholder="Enter patient name" 
                    value={patientName} 
                    onChange={e => setPatientName(e.target.value)}
                  />
                </div>
                
                {/* Phone Number */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Phone Number *
                  </label>
                  <Input 
                    placeholder="Enter phone number" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>
                
                {/* Notes (Optional) */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Notes (optional)
                  </label>
                  <Textarea 
                    placeholder="Any symptoms or special requirements..." 
                    value={notes} 
                    onChange={e => setNotes(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Appointment Summary */}
              <div className="bg-muted rounded-xl p-5 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Department</span>
                  <span className="font-medium text-foreground">{selectedDept}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Doctor</span>
                  <span className="font-medium text-foreground">{selectedDoctor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date & Time</span>
                  <span className="font-medium text-foreground">{selectedDate} at {selectedTime}</span>
                </div>
              </div>
              
              {/* Navigation Buttons */}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button onClick={handleBook}>
                  Confirm Booking <CheckCircle className="ml-2 h-4 w-4"/>
                </Button>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </Layout>
  );
};

// Export so it can be used in App.jsx
export default AppointmentsPage;

/* 
   HOW THE APPOINTMENT BOOKING WORKS:
   
   STEP 1: Select Department & Doctor
   - User selects a department from dropdown
   - Doctor dropdown updates to show only doctors in that department
   - Click "Continue" to go to next step
   
   STEP 2: Select Date & Time
   - User picks a date (can't pick past dates)
   - Time slots appear for that date
   - User clicks on a time slot to select it
   - Click "Continue" to go to next step
   
   STEP 3: Patient Details
   - User enters their name and phone (required)
   - Optional notes field for symptoms or requirements
   - Shows summary of selected appointment
   - Click "Confirm Booking"
   
   SUCCESS:
   - Shows confirmation with booking ID
   - "Book Another" button resets the form

   STATE EXPLANATION:
   
   - step: Which step the user is on (1, 2, or 3)
   - selectedDept: Currently selected department
   - selectedDoctor: Currently selected doctor
   - selectedDate: Selected appointment date
   - selectedTime: Selected time slot
   - patientName, phone, notes: Patient information
   - booked: When set, shows confirmation screen
   
   CONTROLLED COMPONENTS:
   
   All form inputs are "controlled" - their value comes from state,
   and onChange updates the state. This gives us full control
   over the form data and validation.
*/

