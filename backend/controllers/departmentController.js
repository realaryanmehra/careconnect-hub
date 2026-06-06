import { ensureDB } from '../utils/db.js';

export const getDepartments = async (req, res) => {
  try {
    ensureDB();
    const departments = await globalThis.Department.find({});
    res.json({ departments });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createDepartment = async (req, res) => {
  try {
    ensureDB();
    const { name, description, icon } = req.body;
    
    // Check if exists
    const exists = await globalThis.Department.findOne({ name });
    if (exists) {
      return res.status(400).json({ message: 'Department already exists' });
    }

    const department = await globalThis.Department.create({ name, description, icon, doctors: [] });
    res.status(201).json({ department });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    ensureDB();
    const { id } = req.params;
    const { name, description, icon } = req.body;
    
    const department = await globalThis.Department.findByIdAndUpdate(
      id,
      { name, description, icon },
      { new: true }
    );
    
    if (!department) return res.status(404).json({ message: 'Department not found' });
    res.json({ department });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    ensureDB();
    const { id } = req.params;
    
    const result = await globalThis.Department.findByIdAndDelete(id);
    if (!result) return res.status(404).json({ message: 'Department not found' });
    
    res.json({ message: 'Department deleted' });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const addDoctor = async (req, res) => {
  try {
    ensureDB();
    const { departmentId } = req.params;
    const { name, email, speciality } = req.body;
    
    const department = await globalThis.Department.findById(departmentId);
    if (!department) return res.status(404).json({ message: 'Department not found' });
    
    department.doctors.push({ name, email, speciality });
    await department.save();
    
    res.status(201).json({ department });
  } catch (error) {
    console.error('Add doctor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const removeDoctor = async (req, res) => {
  try {
    ensureDB();
    const { departmentId, doctorId } = req.params;
    
    const department = await globalThis.Department.findById(departmentId);
    if (!department) return res.status(404).json({ message: 'Department not found' });
    
    department.doctors = department.doctors.filter(d => d._id.toString() !== doctorId);
    await department.save();
    
    res.json({ department });
  } catch (error) {
    console.error('Remove doctor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export default {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  addDoctor,
  removeDoctor
};
