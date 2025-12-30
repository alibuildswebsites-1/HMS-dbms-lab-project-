import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { DataTable, Modal, ConfirmDialog, FormInput } from '../components/Shared';
import { Customer } from '../types';
import { api } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { Plus } from 'lucide-react';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const { showNotification } = useNotification();

  // Form State
  const [formData, setFormData] = useState<Partial<Customer>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<Customer[]>('/customers');
      setCustomers(data);
    } catch (error) {
      showNotification('Failed to fetch customers', 'error');
      // Mock Data for Demo
      setCustomers([
        { id: 1, customer_name: 'Ali Khan', email: 'ali@example.com', phone: '03001234567', address: 'Lahore', nationality: 'Pakistani', cnic_id: '35202-1234567-1' },
        { id: 2, customer_name: 'Sara Ahmed', email: 'sara@example.com', phone: '03217654321', address: 'Karachi', nationality: 'Pakistani', cnic_id: '42101-7654321-2' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.customer_name) newErrors.customer_name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (!formData.nationality) newErrors.nationality = 'Nationality is required';
    if (!formData.cnic_id) newErrors.cnic_id = 'CNIC is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer.id}`, formData);
        showNotification('Customer updated successfully', 'success');
      } else {
        await api.post('/customers', formData);
        showNotification('Customer added successfully', 'success');
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (error) {
      showNotification('Operation failed', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingCustomer?.id) return;
    try {
      await api.delete(`/customers/${deletingCustomer.id}`);
      showNotification('Customer deleted successfully', 'success');
      setDeletingCustomer(null);
      fetchCustomers();
    } catch (error) {
      showNotification('Delete failed', 'error');
    }
  };

  const openModal = (customer?: Customer) => {
    setEditingCustomer(customer || null);
    setFormData(customer || {
      customer_name: '',
      email: '',
      phone: '',
      address: '',
      nationality: '',
      cnic_id: ''
    });
    setErrors({});
    setIsModalOpen(true);
  };

  return (
    <Layout title="Customers">
      <div className="flex justify-end mb-6">
        <button
          onClick={() => openModal()}
          className="bg-[#01411C] text-white px-4 py-2 rounded-lg hover:bg-green-900 transition flex items-center shadow-md"
        >
          <Plus size={20} className="mr-2" />
          Add New Customer
        </button>
      </div>

      <DataTable<Customer>
        data={customers}
        isLoading={isLoading}
        columns={[
          { header: 'ID', accessor: 'id', className: 'w-16' },
          { header: 'Name', accessor: 'customer_name' },
          { header: 'Email', accessor: 'email' },
          { header: 'Phone', accessor: 'phone' },
          { header: 'Nationality', accessor: 'nationality' },
          { header: 'CNIC', accessor: 'cnic_id' },
        ]}
        onEdit={(item) => openModal(item)}
        onDelete={(item) => setDeletingCustomer(item)}
        onView={(item) => setViewingCustomer(item)}
        searchPlaceholder="Search customers..."
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
      >
        <div className="space-y-4">
          <FormInput
            label="Full Name"
            value={formData.customer_name || ''}
            onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
            error={errors.customer_name}
          />
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
              error={errors.phone}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Nationality"
              value={formData.nationality || ''}
              onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
              error={errors.nationality}
            />
            <FormInput
              label="CNIC / ID"
              value={formData.cnic_id || ''}
              onChange={(e) => setFormData({ ...formData, cnic_id: e.target.value })}
              error={errors.cnic_id}
            />
          </div>
          <FormInput
            label="Address"
            value={formData.address || ''}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            // Address not required
          />
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleSubmit} className="px-4 py-2 bg-[#01411C] text-white rounded-lg hover:bg-green-900">
              {editingCustomer ? 'Update Customer' : 'Save Customer'}
            </button>
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={!!viewingCustomer} onClose={() => setViewingCustomer(null)} title="Customer Details">
        {viewingCustomer && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div><p className="text-sm text-gray-500">Name</p><p className="font-medium">{viewingCustomer.customer_name}</p></div>
               <div><p className="text-sm text-gray-500">Email</p><p className="font-medium">{viewingCustomer.email}</p></div>
               <div><p className="text-sm text-gray-500">Phone</p><p className="font-medium">{viewingCustomer.phone}</p></div>
               <div><p className="text-sm text-gray-500">CNIC</p><p className="font-medium">{viewingCustomer.cnic_id}</p></div>
               <div><p className="text-sm text-gray-500">Nationality</p><p className="font-medium">{viewingCustomer.nationality}</p></div>
               <div className="col-span-2"><p className="text-sm text-gray-500">Address</p><p className="font-medium">{viewingCustomer.address}</p></div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setViewingCustomer(null)} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Close</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingCustomer}
        title="Delete Customer"
        message={`Are you sure you want to delete ${deletingCustomer?.customer_name}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeletingCustomer(null)}
      />
    </Layout>
  );
};