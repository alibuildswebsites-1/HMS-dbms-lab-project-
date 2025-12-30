import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { DataTable, Modal } from '../components/Shared';
import { Employee } from '../types';
import { api } from '../services/api';
import { useNotification } from '../context/NotificationContext';

export const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
      const fetchEmployees = async () => {
          setIsLoading(true);
          try {
              const data = await api.get<Employee[]>('/employees');
              setEmployees(data);
          } catch (e) {
              showNotification('Failed to fetch employees', 'error');
              setEmployees([]);
          } finally {
              setIsLoading(false);
          }
      };
      fetchEmployees();
  }, []);

  return (
    <Layout title="Employees">
        <DataTable<Employee>
            data={employees}
            isLoading={isLoading}
            columns={[
                { header: 'ID', accessor: 'employee_id', className: 'w-16' },
                { header: 'Name', accessor: 'employee_name' },
                { header: 'Department', accessor: 'department_name' },
                { header: 'Position', accessor: 'position' },
                { header: 'Phone', accessor: 'phone' },
                { header: 'Status', accessor: (row) => (
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.employee_status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {row.employee_status}
                    </span>
                )}
            ]}
            onView={setViewingEmployee}
            searchPlaceholder="Search employees..."
        />

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
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-t pt-4">
                        <div><p className="text-sm text-gray-500">Department</p><p className="font-medium">{viewingEmployee.department_name}</p></div>
                        <div><p className="text-sm text-gray-500">Status</p><p className="font-medium">{viewingEmployee.employee_status}</p></div>
                        <div><p className="text-sm text-gray-500">Email</p><p className="font-medium">{viewingEmployee.email}</p></div>
                        <div><p className="text-sm text-gray-500">Phone</p><p className="font-medium">{viewingEmployee.phone}</p></div>
                        <div><p className="text-sm text-gray-500">Salary</p><p className="font-medium">PKR {viewingEmployee.salary.toLocaleString()}</p></div>
                        <div><p className="text-sm text-gray-500">Hire Date</p><p className="font-medium">{viewingEmployee.hire_date}</p></div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button onClick={() => setViewingEmployee(null)} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Close</button>
                    </div>
                </div>
            )}
        </Modal>
    </Layout>
  );
};