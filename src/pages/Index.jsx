import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, Users, Heart, Brain, Bone, Baby, Eye, Stethoscope, ArrowRight, Shield, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import heroImage from "@/assets/hero-hospital.jpg";
const departments = [
    { name: "Cardiology", icon: Heart, description: "Heart & cardiovascular care", color: "text-destructive" },
    { name: "Neurology", icon: Brain, description: "Brain & nervous system", color: "text-info" },
    { name: "Orthopedics", icon: Bone, description: "Bones, joints & muscles", color: "text-accent" },
    { name: "Pediatrics", icon: Baby, description: "Children's healthcare", color: "text-success" },
    { name: "Ophthalmology", icon: Eye, description: "Eye care & vision", color: "text-primary" },
    { name: "General Medicine", icon: Stethoscope, description: "Primary healthcare", color: "text-muted-foreground" },
];
const stats = [
    { value: "50+", label: "Expert Doctors" },
    { value: "10K+", label: "Patients Served" },
    { value: "15+", label: "Departments" },
    { value: "24/7", label: "Emergency Care" },
];
const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};
const Index = () => {
    return (<Layout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Modern hospital facility" className="w-full h-full object-cover"/>
          <div className="absolute inset-0 bg-foreground/60"/>
        </div>
        <div className="relative container py-24 md:py-36">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-2xl space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-1.5 text-sm font-medium text-primary-foreground backdrop-blur-sm">
              <Shield className="h-4 w-4"/> Trusted Healthcare Partner
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-primary-foreground leading-tight">
              Your Health, <br />Our <span className="text-primary">Priority</span>
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-lg">
              Experience seamless hospital management with smart token queuing, instant appointment booking, and world-class medical care.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="shadow-primary" asChild>
                <Link to="/appointments">
                  Book Appointment <ArrowRight className="ml-2 h-4 w-4"/>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                <Link to="/tokens">Check Token Status</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-0">
        <div className="container -mt-12 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (<motion.div key={stat.label} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="bg-card rounded-xl p-6 text-center shadow-medium border border-border">
                <div className="text-3xl font-extrabold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-20">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">Why Choose <span className="text-primary">MediCare</span></h2>
          <p className="text-muted-foreground mt-3 max-w-md mx-auto">Smart hospital management designed for patients and professionals alike.</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Clock, title: "Smart Token Queue", desc: "Real-time token tracking with estimated wait times and instant notifications." },
            { icon: Calendar, title: "Easy Appointments", desc: "Book appointments across departments with your preferred doctor in seconds." },
            { icon: Users, title: "Patient Dashboard", desc: "Track your medical history, prescriptions, and upcoming visits in one place." },
        ].map((f, i) => (<motion.div key={f.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="group bg-card border border-border rounded-xl p-8 hover:shadow-strong hover:border-primary/30 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary mb-5 group-hover:gradient-primary group-hover:text-primary-foreground transition-all">
                <f.icon className="h-6 w-6"/>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>))}
        </div>
      </section>

      {/* Departments */}
      <section className="gradient-hero py-20">
        <div className="container">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">Our <span className="text-primary">Departments</span></h2>
            <p className="text-muted-foreground mt-3">Specialized care across multiple disciplines.</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {departments.map((dept, i) => (<motion.div key={dept.name} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="bg-card border border-border rounded-xl p-6 hover:shadow-medium transition-all cursor-pointer group">
                <dept.icon className={`h-8 w-8 ${dept.color} mb-3`}/>
                <h3 className="font-bold text-foreground">{dept.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{dept.description}</p>
              </motion.div>))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="gradient-primary rounded-2xl p-10 md:p-16 text-center text-primary-foreground">
          <Award className="h-12 w-12 mx-auto mb-4 opacity-80"/>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to Experience Better Healthcare?</h2>
          <p className="text-primary-foreground/80 max-w-md mx-auto mb-8">
            Book your appointment today and skip the waiting line with our smart token system.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/appointments">Book Appointment</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
              <Link to="/tokens">Get Token</Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </Layout>);
};
export default Index;
