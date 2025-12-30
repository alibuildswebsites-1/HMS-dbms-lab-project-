import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { DataTable, Modal, ConfirmDialog, FormInput, FormSelect } from '../components/Shared';
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
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  
  const { showNotification } = useNotification();
  
  const [formData, setFormData] = useState<Partial<Employee>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchData = async () => {
    setIsLoading(true);
    try {
        const [empData, deptData] = await Promise.all([
            api.get<Employee[]>('http://192.168.100.14:5000/api/employees'),
            api.get<Department[]>('http://192.168.100.14:5000/api/departments')
        ]);
        setEmployees(empData);
        setDepartments(deptData);
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
            await api.put(`http://192.168.100.14:5000/api/employees/${editingEmployee.employee_id}`, payload);
            showNotification('Employee updated successfully', 'success');
        } else {
            await api.post('http://192.168.100.14:5000/api/employees', payload);
            showNotification('Employee added successfully', 'success');
        }
        setIsModalOpen(false);
        fetchData();
    } catch (e) {
        showNotification('Operation failed', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingEmployee?.employee_id) return;
    try {
        await api.delete(`http://192.168.100.14:5000/api/employees/${deletingEmployee.employee_id}`);
        showNotification('Employee deleted successfully', 'success');
        setDeletingEmployee(null);
        fetchData();
    } catch (e) {
        showNotification('Delete failed', 'error');
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
                className="bg-[#01411C] text-white px-4 py-2 rounded-lg hover:bg-green-900 transition flex items-center shadow-md"
            >
                <Plus size={20} className="mr-2" />
                Add New Employee
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
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.employee_status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {row.employee_status}
                    </span>
                )}
            ]}
            onEdit={openModal}
            onDelete={setDeletingEmployee}
            onView={setViewingEmployee}
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

                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-[#01411C] text-white rounded-lg hover:bg-green-900">
                        {editingEmployee ? 'Update Employee' : 'Save Employee'}
                    </button>
                </div>
            </div>
        </Modal>

        {/* View Modal */}
        <Modal isOpen={!!viewingEmployee} onClose={() => setViewingEmployee(null)} title="Employee Details">
            {viewingEmployee && (
                <div className="space-y-4">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-[#01411C] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                            {viewingEmployee.employee_name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">{viewingEmployee.employee_name}</h3>
                            <p className="text-gray-500">{viewingEmployee.position}</p>
                            <p className="text-sm text-green-700 font-medium">{viewingEmployee.email}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-t pt-4">
                        <div><p className="text-sm text-gray-500">Department</p><p className="font-medium">{viewingEmployee.department_name || getDepartmentName(viewingEmployee.department_id)}</p></div>
                        <div><p className="text-sm text-gray-500">Status</p><p className="font-medium">{viewingEmployee.employee_status}</p></div>
                        <div><p className="text-sm text-gray-500">Phone</p><p className="font-medium">{viewingEmployee.phone || '-'}</p></div>
                        <div><p className="text-sm text-gray-500">Salary</p><p className="font-medium">PKR {viewingEmployee.salary.toLocaleString()}</p></div>
                        <div><p className="text-sm text-gray-500">Hire Date</p><p className="font-medium">{viewingEmployee.hire_date}</p></div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button onClick={() => setViewingEmployee(null)} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Close</button>
                    </div>
                </div>
            )}
        </Modal>

        <ConfirmDialog
            isOpen={!!deletingEmployee}
            title="Delete Employee"
            message={`Are you sure you want to delete ${deletingEmployee?.employee_name}?`}
            onConfirm={handleDelete}
            onCancel={() => setDeletingEmployee(null)}
        />
    </Layout>
  );
};