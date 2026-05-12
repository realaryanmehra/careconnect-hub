import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment, addDoctorToDepartment, removeDoctorFromDepartment } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash2, Edit3, Loader2, UserPlus, Stethoscope } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const AdminDepartmentsTab = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Form states
  const [newDept, setNewDept] = useState({ name: '', description: '', icon: 'Stethoscope' });
  const [newDoctor, setNewDoctor] = useState({ name: '', email: '', speciality: '' });
  const [activeDeptId, setActiveDeptId] = useState(null);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const container = useRef();

  useGSAP(() => {
    if (!loading && departments.length > 0) {
      gsap.from(".dept-card", {
        y: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: "power3.out",
      });
    }
  }, [loading, departments]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await getDepartments();
      setDepartments(res.departments || []);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to load departments", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDepartment = async () => {
    if (!newDept.name) return toast({ title: "Error", description: "Name is required", variant: "destructive" });
    setSaving(true);
    try {
      await createDepartment(newDept);
      toast({ title: "Success", description: "Department created" });
      setNewDept({ name: '', description: '', icon: 'Stethoscope' });
      fetchDepartments();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDepartment = async (id) => {
    try {
      await deleteDepartment(id);
      toast({ title: "Success", description: "Department deleted" });
      fetchDepartments();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleAddDoctor = async () => {
    if (!newDoctor.name) return toast({ title: "Error", description: "Doctor name is required", variant: "destructive" });
    setSaving(true);
    try {
      await addDoctorToDepartment(activeDeptId, newDoctor);
      toast({ title: "Success", description: "Doctor added to department" });
      setNewDoctor({ name: '', email: '', speciality: '' });
      setIsDoctorModalOpen(false);
      fetchDepartments();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveDoctor = async (deptId, doctorId) => {
    try {
      await removeDoctorFromDepartment(deptId, doctorId);
      toast({ title: "Success", description: "Doctor removed" });
      fetchDepartments();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (loading) return <div className="py-10 text-center"><Loader2 className="animate-spin w-8 h-8 mx-auto text-primary" /></div>;

  return (
    <div className="space-y-6" ref={container}>
      {/* Create New Department */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Department</CardTitle>
          <CardDescription>Create a new hospital department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Department Name</label>
              <Input placeholder="e.g. Dermatology" value={newDept.name} onChange={e => setNewDept({...newDept, name: e.target.value})} />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Description</label>
              <Input placeholder="e.g. Skin care and treatment" value={newDept.description} onChange={e => setNewDept({...newDept, description: e.target.value})} />
            </div>
            <Button onClick={handleCreateDepartment} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Add Department
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Departments List */}
      <div className="grid grid-cols-1 gap-6">
        {departments.map(dept => (
          <div key={dept._id || dept.id} className="dept-card">
            <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-primary" />
                  {dept.name}
                </CardTitle>
                <CardDescription className="mt-1">{dept.description}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { setActiveDeptId(dept._id || dept.id); setIsDoctorModalOpen(true); }}>
                  <UserPlus className="w-4 h-4 mr-2" /> Add Doctor
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm"><Trash2 className="w-4 h-4" /></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete {dept.name}?</AlertDialogTitle>
                      <AlertDialogDescription>This will remove the department and all its doctors.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteDepartment(dept._id || dept.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardHeader>
            <CardContent>
              {dept.doctors && dept.doctors.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Doctor Name</TableHead>
                      <TableHead>Speciality</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dept.doctors.map(doc => (
                      <TableRow key={doc._id}>
                        <TableCell className="font-medium">{doc.name}</TableCell>
                        <TableCell><Badge variant="secondary">{doc.speciality || 'General'}</Badge></TableCell>
                        <TableCell>{doc.email || 'N/A'}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleRemoveDoctor(dept._id || dept.id, doc._id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-6 text-center text-muted-foreground border border-dashed rounded-lg mt-4 bg-muted/20">
                  No doctors in this department yet. Add one to get started!
                </div>
              )}
            </CardContent>
            </Card>
          </div>
        ))}
        {departments.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            No departments found. Create one above!
          </div>
        )}
      </div>

      {/* Add Doctor Modal */}
      <Dialog open={isDoctorModalOpen} onOpenChange={setIsDoctorModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Doctor to Department</DialogTitle>
            <DialogDescription>Add a new doctor's details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Full Name *</label>
              <Input placeholder="e.g. Dr. John Doe" value={newDoctor.name} onChange={e => setNewDoctor({...newDoctor, name: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Speciality</label>
              <Input placeholder="e.g. Dermatologist" value={newDoctor.speciality} onChange={e => setNewDoctor({...newDoctor, speciality: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <Input type="email" placeholder="e.g. john.doe@hospital.com" value={newDoctor.email} onChange={e => setNewDoctor({...newDoctor, email: e.target.value})} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDoctorModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddDoctor} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Save Doctor
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDepartmentsTab;
