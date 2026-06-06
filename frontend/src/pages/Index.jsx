import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import SplitText from "@/components/SplitText";
import { Calendar, Clock, Users, Heart, Brain, Bone, Baby, Eye, Stethoscope, ArrowRight, Shield, Award, Activity, Database, Smartphone, Zap } from "lucide-react";
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

const HeroAnimation = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Central Pulse Effect */}
      <div className="relative">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 bg-primary/30 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 bg-card/80 dark:bg-white/10 backdrop-blur-xl border border-border dark:border-white/20 p-8 rounded-full shadow-lg dark:shadow-2xl"
        >
          <Activity className="h-20 w-20 text-primary animate-pulse" />
        </motion.div>
      </div>

      {/* Floating Cards */}
      <FloatingCard
        icon={Users}
        title="Active Doctors"
        value="48"
        delay={0}
        position="top-10 left-10"
      />
      <FloatingCard
        icon={Calendar}
        title="Appointments"
        value="1.2k"
        delay={1.5}
        position="bottom-20 left-20"
      />
      <FloatingCard
        icon={Zap}
        title="Response Time"
        value="0.8s"
        delay={0.8}
        position="top-20 right-10"
      />
      <FloatingCard
        icon={Database}
        title="Secure Records"
        value="100%"
        delay={2.2}
        position="bottom-10 right-20"
      />

      {/* Connecting Lines (Decorative) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
        <motion.path
          d="M 100 100 Q 250 50 400 100"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
          className="text-primary"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.path
          d="M 400 400 Q 250 450 100 400"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
          className="text-primary"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
        />
      </svg>
    </div>
  );
};

const FloatingCard = ({ icon: Icon, title, value, delay, position }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ 
      opacity: 1, 
      y: [0, -15, 0],
    }}
    transition={{
      opacity: { duration: 1, delay },
      y: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }
    }}
    whileHover={{ scale: 1.05, zIndex: 50 }}
    className={`absolute ${position} bg-card/80 dark:bg-white/10 backdrop-blur-xl border border-border dark:border-white/20 p-4 rounded-2xl flex items-center gap-4 min-w-[180px] cursor-pointer shadow-lg dark:shadow-2xl`}
  >
    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground dark:text-white/50 font-bold">{title}</div>
      <div className="text-lg font-bold text-foreground dark:text-white">{value}</div>
    </div>
  </motion.div>
);
const Index = () => {
    const container = useRef();

    useGSAP(() => {
      const tl = gsap.timeline();
      
      // Removed .char animation from here as SplitText component handles it
      
      tl.from(".hero-description", {
        opacity: 0,
        y: 20,
        duration: 0.6
      }, "+=0.2");

      tl.from(".hero-buttons", {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.6
      }, "-=0.4");
    }, { scope: container });

    return (<Layout>
      <div ref={container}>
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[60vh] flex items-start">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Modern hospital facility" className="w-full h-full object-cover"/>
          <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/80"/>
        </div>
        <div className="relative container pt-8 pb-12 md:pt-12 md:pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm border border-white/10">
                <Shield className="h-4 w-4 text-primary"/> Trusted Healthcare Partner
              </span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight overflow-hidden">
                <div className="title-line block">
                  <SplitText text="Your Health," triggerOnView={false} delay={0.5} />
                </div>
                <div className="title-line block">
                  <SplitText text="Our " triggerOnView={false} delay={0.8} />
                  <span className="text-primary">
                    <SplitText text="Priority" triggerOnView={false} delay={1.1} />
                  </span>
                </div>
              </h1>
              <p className="text-lg md:text-xl text-white/80 max-w-lg leading-relaxed hero-description">
                Experience seamless hospital management with smart token queuing, instant appointment booking, and world-class medical care.
              </p>
              <div className="flex flex-wrap gap-4 pt-4 hero-buttons">
                <Button size="lg" className="shadow-primary h-12 px-8 text-base" asChild>
                  <Link to="/appointments">
                    Book Appointment <ArrowRight className="ml-2 h-4 w-4"/>
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md h-12 px-8 text-base" asChild>
                  <Link to="/tokens">Check Token Status</Link>
                </Button>
              </div>
            </motion.div>

            {/* Interactive Hero Animation */}
            <div className="hidden lg:block relative h-[500px]">
              <HeroAnimation />
            </div>
          </div>
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
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">
            <SplitText text="Why Choose " />
            <span className="text-primary"><SplitText text="MediCare" delay={0.3} /></span>
          </h2>
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
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">
              <SplitText text="Our " />
              <span className="text-primary"><SplitText text="Departments" delay={0.2} /></span>
            </h2>
            <p className="text-muted-foreground mt-3">Specialized care across multiple disciplines.</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {departments.map((dept, i) => (
              <Link key={dept.name} to="/departments">
                <motion.div custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="bg-card border border-border rounded-xl p-6 hover:shadow-medium transition-all cursor-pointer group h-full">
                  <dept.icon className={`h-8 w-8 ${dept.color} mb-3`}/>
                  <h3 className="font-bold text-foreground">{dept.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{dept.description}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="gradient-primary rounded-2xl p-10 md:p-16 text-center text-primary-foreground">
          <Award className="h-12 w-12 mx-auto mb-4 opacity-80"/>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            <SplitText text="Ready to Experience Better Healthcare?" />
          </h2>
          <p className="text-primary-foreground/80 max-w-md mx-auto mb-8">
            Book your appointment today and skip the waiting line with our smart token system.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/appointments">Book Appointment</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-inherit" asChild>
              <Link to="/tokens">Get Token</Link>
            </Button>
          </div>
        </motion.div>
      </section>
      </div>
    </Layout>);
};
export default Index;
