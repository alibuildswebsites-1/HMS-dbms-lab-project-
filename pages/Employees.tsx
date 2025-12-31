import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { DataTable, Modal, FormInput, FormSelect } from '../components/Shared';
import { Employee, Department } from '../types';
import { api } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { Plus } from 'lucide-react';

export const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  
  const { showNotification } = useNotification();
  
  const [formData, setFormData] = useState<Partial<Employee>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchData = async () => {
    setIsLoading(true);
    try {
        const [empRaw, deptRaw] = await Promise.all([
            api.get<any[]>('http://192.168.40.190:5000/api/employees'),
            api.get<any[]>('http://192.168.40.190:5000/api/departments')
        ]);
        
        const mappedEmployees: Employee[] = empRaw.map(e => ({
            employee_id: e.Employee_ID || e.employee_id,
            employee_name: e.Employee_Name || e.employee_name,
            department_id: e.Department_ID || e.department_id,
            department_name: e.Department_Name || e.department_name,
            email: e.Email || e.email,
            phone: e.Phone || e.phone,
            position: e.Position || e.position,
            salary: e.Salary || e.salary,
            hire_date: e.Hire_Date || e.hire_date,
            employee_status: e.Employee_Status || e.employee_status
        }));

        const mappedDepartments: Department[] = deptRaw.map(d => ({
            department_id: d.Department_ID || d.department_id,
            department_name: d.Department_Name || d.department_name
        }));

        setEmployees(mappedEmployees.sort((a, b) => (a.employee_id || 0) - (b.employee_id || 0)));
        setDepartments(mappedDepartments);
    } catch (e) {
        showNotification('Failed to fetch data', 'error');
        setEmployees([]);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
      fetchData();
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.employee_name) newErrors.employee_name = 'Name is required';
    if (!formData.department_id) newErrors.department_id = 'Department is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.position) newErrors.position = 'Position is required';
    if (!formData.salary || formData.salary <= 0) newErrors.salary = 'Valid salary is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    // Map to PascalCase as per backend requirement
    const payload = {
        Employee_Name: formData.employee_name,
        Department_ID: formData.department_id,
        Email: formData.email,
        Phone: formData.phone,
        Position: formData.position,
        Salary: formData.salary,
        Hire_Date: formData.hire_date,
        Employee_Status: formData.employee_status
    };

    try {
        if (editingEmployee && editingEmployee.employee_id) {
            await api.put(`http://192.168.40.190:5000/api/employees/${editingEmployee.employee_id}`, payload);
            showNotification('Employee updated successfully', 'success');
        } else {
            await api.post('http://192.168.40.190:5000/api/employees', payload);
            showNotification('Employee added successfully', 'success');
        }
        setIsModalOpen(false);
        fetchData();
    } catch (e) {
        showNotification('Operation failed', 'error');
    }
  };

  const openModal = (employee?: Employee) => {
    setEditingEmployee(employee || null);
    setFormData(employee || {
        employee_name: '',
        department_id: undefined,
        email: '',
        phone: '',
        position: '',
        salary: 0,
        hire_date: new Date().toISOString().split('T')[0],
        employee_status: 'Active'
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const getDepartmentName = (id?: number) => {
      if (!id) return '-';
      return departments.find(d => d.department_id === id)?.department_name || id;
  };

  return (
    <Layout title="Employees">
        <div className="flex justify-end mb-6">
            <button
                onClick={() => openModal()}
                className="bg-[#8B5CF6] text-white px-5 py-2.5 rounded-xl hover:bg-[#7C3AED] transition-all shadow-lg shadow-violet-200 flex items-center font-semibold"
            >
                <Plus size={20} className="mr-2" />
                Add Employee
            </button>
        </div>

        <DataTable<Employee>
            data={employees}
            isLoading={isLoading}
            columns={[
                { header: 'ID', accessor: 'employee_id', className: 'w-16' },
                { header: 'Name', accessor: 'employee_name' },
                { header: 'Department', accessor: (row) => row.department_name || getDepartmentName(row.department_id) },
                { header: 'Position', accessor: 'position' },
                { header: 'Phone', accessor: 'phone' },
                { header: 'Status', accessor: (row) => (
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${
                        row.employee_status === 'Active' ? 'bg-[#ECFDF5] text-[#059669]' : 
                        row.employee_status === 'On Leave' ? 'bg-[#FFFBEB] text-[#D97706]' :
                        'bg-slate-100 text-slate-600'
                    }`}>
                        {row.employee_status}
                    </span>
                )}
            ]}
            onEdit={openModal}
            searchPlaceholder="Search employees..."
        />

        {/* Add/Edit Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingEmployee ? 'Edit Employee' : 'Add New Employee'}>
            <div className="space-y-4">
                <FormInput
                    label="Full Name"
                    value={formData.employee_name || ''}
                    onChange={(e) => setFormData({ ...formData, employee_name: e.target.value })}
                    error={errors.employee_name}
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormSelect
                        label="Department"
                        value={formData.department_id || ''}
                        onChange={(e) => setFormData({ ...formData, department_id: Number(e.target.value) })}
                        error={errors.department_id}
                    >
                        <option value="">Select Department</option>
                        {departments.map(d => (
                            <option key={d.department_id} value={d.department_id}>{d.department_name}</option>
                        ))}
                    </FormSelect>
                    <FormInput
                        label="Position"
                        value={formData.position || ''}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        error={errors.position}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <FormInput
                        label="Email"
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        error={errors.email}
                    />
                    <FormInput
                        label="Phone"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <FormInput
                        label="Salary (PKR)"
                        type="number"
                        value={formData.salary || ''}
                        onChange={(e) => setFormData({ ...formData, salary: parseInt(e.target.value) })}
                        error={errors.salary}
                    />
                    <FormInput
                        label="Hire Date"
                        type="date"
                        value={formData.hire_date ? new Date(formData.hire_date).toISOString().split('T')[0] : ''}
                        onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                    />
                </div>
                <FormSelect
                    label="Status"
                    value={formData.employee_status}
                    onChange={(e) => setFormData({ ...formData, employee_status: e.target.value })}
                >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Leave">On Leave</option>
                </FormSelect>

                <div className="flex justify-end gap-3 mt-8">
                    <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 font-medium">Cancel</button>
                    <button onClick={handleSubmit} className="px-5 py-2.5 bg-[#8B5CF6] text-white rounded-xl hover:bg-[#7C3AED] font-medium shadow-md">
                        {editingEmployee ? 'Update Employee' : 'Save Employee'}
                    </button>
                </div>
            </div>
        </Modal>
    </Layout>
  );
};