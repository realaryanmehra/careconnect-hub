import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, User, Stethoscope, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";

const departments = [
  { name: "Cardiology", doctors: ["Dr. Anil Kapoor", "Dr. Meena Singh"] },
  { name: "Neurology", doctors: ["Dr. Rajesh Gupta", "Dr. Sonal Verma"] },
  { name: "Orthopedics", doctors: ["Dr. Vikram Rao", "Dr. Deepa Joshi"] },
  { name: "Pediatrics", doctors: ["Dr. Kavita Sharma", "Dr. Ravi Mishra"] },
  { name: "Ophthalmology", doctors: ["Dr. Sunita Patel", "Dr. Aman Khanna"] },
  { name: "General Medicine", doctors: ["Dr. Pooja Reddy", "Dr. Nikhil Bhatt"] },
];

const timeSlots = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM"];

interface Appointment {
  id: string;
  patientName: string;
  department: string;
  doctor: string;
  date: string;
  time: string;
  notes: string;
}

const AppointmentsPage = () => {
  const [step, setStep] = useState(1);
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [booked, setBooked] = useState<Appointment | null>(null);
  const { toast } = useToast();

  const currentDoctors = departments.find(d => d.name === selectedDept)?.doctors || [];

  const handleBook = () => {
    if (!patientName || !phone) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    const apt: Appointment = {
      id: Math.random().toString(36).slice(2, 8).toUpperCase(),
      patientName,
      department: selectedDept,
      doctor: selectedDoctor,
      date: selectedDate,
      time: selectedTime,
      notes,
    };
    setBooked(apt);
  };

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

  if (booked) {
    return (
      <Layout>
        <div className="container py-20 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl p-10 max-w-md w-full text-center shadow-strong"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-2xl font-extrabold text-foreground mb-2">Appointment Confirmed!</h2>
            <p className="text-muted-foreground text-sm mb-6">Your booking ID: <span className="font-mono font-bold text-primary">{booked.id}</span></p>
            <div className="text-left space-y-3 bg-muted rounded-xl p-5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Patient</span><span className="font-medium text-foreground">{booked.patientName}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Department</span><span className="font-medium text-foreground">{booked.department}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Doctor</span><span className="font-medium text-foreground">{booked.doctor}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-medium text-foreground">{booked.date}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span className="font-medium text-foreground">{booked.time}</span></div>
            </div>
            <Button className="w-full mt-6" onClick={reset}>Book Another Appointment</Button>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2">Book <span className="text-primary">Appointment</span></h1>
          <p className="text-muted-foreground mb-8">Schedule your visit in just a few steps.</p>
        </motion.div>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 mb-10 max-w-lg">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center flex-1">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                step >= s ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {s}
              </div>
              {s < 3 && <div className={`flex-1 h-1 mx-2 rounded-full ${step > s ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-2xl"
        >
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" /> Select Department & Doctor
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Department</label>
                  <Select value={selectedDept} onValueChange={(v) => { setSelectedDept(v); setSelectedDoctor(""); }}>
                    <SelectTrigger><SelectValue placeholder="Choose a department" /></SelectTrigger>
                    <SelectContent>
                      {departments.map(d => <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {selectedDept && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Doctor</label>
                    <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                      <SelectTrigger><SelectValue placeholder="Choose a doctor" /></SelectTrigger>
                      <SelectContent>
                        {currentDoctors.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <Button disabled={!selectedDept || !selectedDoctor} onClick={() => setStep(2)}>
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" /> Select Date & Time
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Date</label>
                  <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} min={new Date().toISOString().split("T")[0]} />
                </div>
                {selectedDate && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">Available Time Slots</label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {timeSlots.map(slot => (
                        <button
                          key={slot}
                          onClick={() => setSelectedTime(slot)}
                          className={`py-2.5 px-3 rounded-lg border text-sm font-medium transition-all ${
                            selectedTime === slot
                              ? "bg-primary text-primary-foreground border-primary shadow-primary"
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
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button disabled={!selectedDate || !selectedTime} onClick={() => setStep(3)}>
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Patient Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name *</label>
                  <Input placeholder="Enter patient name" value={patientName} onChange={e => setPatientName(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Phone Number *</label>
                  <Input placeholder="Enter phone number" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Notes (optional)</label>
                  <Textarea placeholder="Any symptoms or special requirements..." value={notes} onChange={e => setNotes(e.target.value)} />
                </div>
              </div>
              {/* Summary */}
              <div className="bg-muted rounded-xl p-5 text-sm space-y-2">
                <div className="flex justify-between"><span className="text-muted-foreground">Department</span><span className="font-medium text-foreground">{selectedDept}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Doctor</span><span className="font-medium text-foreground">{selectedDoctor}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Date & Time</span><span className="font-medium text-foreground">{selectedDate} at {selectedTime}</span></div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button onClick={handleBook}>
                  Confirm Booking <CheckCircle className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default AppointmentsPage;
