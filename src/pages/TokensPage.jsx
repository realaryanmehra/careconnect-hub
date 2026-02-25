import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Hash, User, CheckCircle, AlertCircle, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
const departments = ["Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Ophthalmology", "General Medicine"];
const initialTokens = [
    { id: "1", number: 1, patientName: "Rahul Sharma", department: "Cardiology", status: "completed", estimatedTime: "Done", createdAt: "09:00 AM" },
    { id: "2", number: 2, patientName: "Priya Patel", department: "Neurology", status: "in-progress", estimatedTime: "~5 min", createdAt: "09:15 AM" },
    { id: "3", number: 3, patientName: "Amit Kumar", department: "Cardiology", status: "waiting", estimatedTime: "~20 min", createdAt: "09:30 AM" },
    { id: "4", number: 4, patientName: "Sneha Reddy", department: "Pediatrics", status: "waiting", estimatedTime: "~35 min", createdAt: "09:45 AM" },
];
const statusConfig = {
    waiting: { label: "Waiting", icon: Clock, className: "bg-warning/10 text-warning border-warning/20" },
    "in-progress": { label: "In Progress", icon: Loader2, className: "bg-info/10 text-info border-info/20" },
    completed: { label: "Completed", icon: CheckCircle, className: "bg-success/10 text-success border-success/20" },
};
const TokensPage = () => {
    const [tokens, setTokens] = useState(initialTokens);
    const [name, setName] = useState("");
    const [dept, setDept] = useState("");
    const [searchToken, setSearchToken] = useState("");
    const { toast } = useToast();
    const handleGenerate = () => {
        if (!name || !dept) {
            toast({ title: "Please fill all fields", variant: "destructive" });
            return;
        }
        const newToken = {
            id: String(tokens.length + 1),
            number: tokens.length + 1,
            patientName: name,
            department: dept,
            status: "waiting",
            estimatedTime: `~${(tokens.filter(t => t.status === "waiting").length + 1) * 15} min`,
            createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setTokens([...tokens, newToken]);
        setName("");
        setDept("");
        toast({ title: `Token #${newToken.number} generated!`, description: `Department: ${dept}` });
    };
    const filteredTokens = searchToken
        ? tokens.filter(t => t.number.toString().includes(searchToken) || t.patientName.toLowerCase().includes(searchToken.toLowerCase()))
        : tokens;
    return (<Layout>
      <div className="container py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2">Token <span className="text-primary">Management</span></h1>
          <p className="text-muted-foreground mb-8">Generate and track patient queue tokens in real time.</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Generate Token */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-6 shadow-soft sticky top-24">
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary"/> Generate Token
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Patient Name</label>
                  <Input placeholder="Enter patient name" value={name} onChange={(e) => setName(e.target.value)}/>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Department</label>
                  <Select value={dept} onValueChange={setDept}>
                    <SelectTrigger><SelectValue placeholder="Select department"/></SelectTrigger>
                    <SelectContent>
                      {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={handleGenerate}>
                  Generate Token <Hash className="ml-2 h-4 w-4"/>
                </Button>
              </div>

              {/* Quick stats */}
              <div className="mt-6 pt-6 border-t border-border space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Tokens</span>
                  <span className="font-semibold text-foreground">{tokens.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Waiting</span>
                  <span className="font-semibold text-warning">{tokens.filter(t => t.status === "waiting").length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">In Progress</span>
                  <span className="font-semibold text-info">{tokens.filter(t => t.status === "in-progress").length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-semibold text-success">{tokens.filter(t => t.status === "completed").length}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Token List */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Input placeholder="Search by token # or name..." value={searchToken} onChange={(e) => setSearchToken(e.target.value)} className="max-w-sm"/>
            </div>

            <div className="space-y-3">
              {filteredTokens.length === 0 && (<div className="text-center py-12 text-muted-foreground">
                  <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-50"/>
                  <p>No tokens found.</p>
                </div>)}
              {filteredTokens.map((token, i) => {
            const sc = statusConfig[token.status];
            return (<motion.div key={token.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-medium transition-shadow">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary font-extrabold text-lg">
                      #{token.number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-muted-foreground"/>
                        <span className="font-semibold text-foreground">{token.patientName}</span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>{token.department}</span>
                        <span>•</span>
                        <span>{token.createdAt}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5"/> {token.estimatedTime}
                      </span>
                      <Badge variant="outline" className={sc.className}>
                        <sc.icon className={`h-3 w-3 mr-1 ${token.status === "in-progress" ? "animate-spin" : ""}`}/>
                        {sc.label}
                      </Badge>
                    </div>
                  </motion.div>);
        })}
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>);
};
export default TokensPage;
