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
      const data = await api.get<Customer[]>('http://localhost:5000/api/customers');
      setCustomers(data);
    } catch (error) {
      showNotification('Failed to fetch customers', 'error');
      setCustomers([]);
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
    if (!formData.id) newErrors.id = 'CNIC/ID is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    // Map to PascalCase for API
    const payload = {
      Customer_Name: formData.customer_name,
      Email: formData.email,
      Phone: formData.phone,
      Address: formData.address,
      Nationality: formData.nationality,
      ID: formData.id // Mapping frontend 'id' (CNIC) to backend 'ID'
    };

    try {
      if (editingCustomer && editingCustomer.customer_id) {
        await api.put(`http://localhost:5000/api/customers/${editingCustomer.customer_id}`, payload);
        showNotification('Customer updated successfully', 'success');
      } else {
        await api.post('http://localhost:5000/api/customers', payload);
        showNotification('Customer added successfully', 'success');
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (error) {
      showNotification('Operation failed', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingCustomer?.customer_id) return;
    try {
      await api.delete(`http://localhost:5000/api/customers/${deletingCustomer.customer_id}`);
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
      id: ''
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
          { header: 'ID', accessor: 'customer_id', className: 'w-16' },
          { header: 'Name', accessor: 'customer_name' },
          { header: 'Email', accessor: 'email' },
          { header: 'Phone', accessor: 'phone' },
          { header: 'Nationality', accessor: 'nationality' },
          { header: 'CNIC', accessor: 'id' },
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
              value={formData.id || ''}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              error={errors.id}
            />
          </div>
          <FormInput
            label="Address"
            value={formData.address || ''}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
               <div><p className="text-sm text-gray-500">CNIC</p><p className="font-medium">{viewingCustomer.id}</p></div>
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