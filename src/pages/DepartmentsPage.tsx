import { motion } from "framer-motion";
import { Heart, Brain, Bone, Baby, Eye, Stethoscope, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";

const departments = [
  { name: "Cardiology", icon: Heart, description: "Comprehensive heart care including diagnostics, treatment, and rehabilitation for all cardiovascular conditions.", doctors: 8, color: "text-destructive", bg: "bg-destructive/10" },
  { name: "Neurology", icon: Brain, description: "Expert diagnosis and treatment of disorders of the nervous system including brain, spinal cord, and peripheral nerves.", doctors: 6, color: "text-info", bg: "bg-info/10" },
  { name: "Orthopedics", icon: Bone, description: "Specialized care for musculoskeletal conditions, sports injuries, joint replacements, and fracture treatment.", doctors: 7, color: "text-accent", bg: "bg-accent/10" },
  { name: "Pediatrics", icon: Baby, description: "Dedicated healthcare for infants, children, and adolescents with compassionate and specialized medical attention.", doctors: 5, color: "text-success", bg: "bg-success/10" },
  { name: "Ophthalmology", icon: Eye, description: "Complete eye care services including vision correction, cataract surgery, and treatment of eye diseases.", doctors: 4, color: "text-primary", bg: "bg-primary/10" },
  { name: "General Medicine", icon: Stethoscope, description: "Primary healthcare services for routine check-ups, preventive care, and management of chronic conditions.", doctors: 10, color: "text-muted-foreground", bg: "bg-muted" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const DepartmentsPage = () => {
  return (
    <Layout>
      <div className="container py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2">Our <span className="text-primary">Departments</span></h1>
          <p className="text-muted-foreground mb-10">World-class care across every specialty.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {departments.map((dept, i) => (
            <motion.div
              key={dept.name}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="bg-card border border-border rounded-xl p-8 hover:shadow-strong transition-all group"
            >
              <div className="flex items-start gap-5">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${dept.bg}`}>
                  <dept.icon className={`h-7 w-7 ${dept.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-2">{dept.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{dept.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{dept.doctors} Specialist Doctors</span>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/appointments">
                        Book Now <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default DepartmentsPage;
