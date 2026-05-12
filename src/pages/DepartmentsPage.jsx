import { motion } from "framer-motion";
import { Heart, Brain, Bone, Baby, Eye, Stethoscope, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import SplitText from "@/components/SplitText";
import { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { getDepartments } from "@/lib/api";

const colors = ["text-destructive", "text-info", "text-accent", "text-success", "text-primary", "text-muted-foreground"];
const bgs = ["bg-destructive/10", "bg-info/10", "bg-accent/10", "bg-success/10", "bg-primary/10", "bg-muted"];
const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};
const DepartmentsPage = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDepts = async () => {
            try {
                const res = await getDepartments();
                setDepartments(res.departments || []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchDepts();
    }, []);

    return (<Layout>
      <div className="container py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2">
            <SplitText text="Our " triggerOnView={false} />
            <span className="text-primary"><SplitText text="Departments" triggerOnView={false} delay={0.2} /></span>
          </h1>
          <p className="text-muted-foreground mb-10">World-class care across every specialty.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-2 text-center py-10"><Icons.Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>
          ) : departments.map((dept, i) => {
            const Icon = Icons[dept.icon] || Icons.Stethoscope;
            const color = colors[i % colors.length];
            const bg = bgs[i % bgs.length];
            return (
            <motion.div key={dept._id || dept.name} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="bg-card border border-border rounded-xl p-8 hover:shadow-strong transition-all group">
              <div className="flex items-start gap-5">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${bg}`}>
                  <Icon className={`h-7 w-7 ${color}`}/>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-2">{dept.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{dept.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{dept.doctors?.length || 0} Specialist Doctors</span>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/appointments">
                        Book Now <ArrowRight className="ml-1 h-3 w-3"/>
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )})}
        </div>
      </div>
    </Layout>);
};
export default DepartmentsPage;
