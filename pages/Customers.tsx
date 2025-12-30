import React, { useEffect, useState, useMemo } from 'react';
import { Layout } from '../components/Layout';
import { DataTable, Modal, FormInput } from '../components/Shared';
import { Customer } from '../types';
import { api } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { Plus, Filter, RotateCcw } from 'lucide-react';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const { showNotification } = useNotification();

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [nationalityFilter, setNationalityFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Customer>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<any[]>('http://192.168.43.54:5000/api/customers');
      // Map PascalCase from API to snake_case for frontend
      const mappedData: Customer[] = data.map(item => ({
        customer_id: item.Customer_ID || item.customer_id,
        customer_name: item.Customer_Name || item.customer_name,
        email: item.Email || item.email,
        phone: item.Phone || item.phone,
        address: item.Address || item.address,
        nationality: item.Nationality || item.nationality,
        id: item.ID || item.id || item.CNIC // Handle variations
      }));
      setCustomers(mappedData.sort((a, b) => (a.customer_id || 0) - (b.customer_id || 0)));
    } catch (error) {
      showNotification('Failed to fetch customers', 'error');
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Derived State for Filtering
  const uniqueNationalities = useMemo(() => {
    return Array.from(new Set(customers.map(c => c.nationality).filter(Boolean))).sort();
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const matchesSearch = 
        searchQuery === '' || 
        customer.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone?.includes(searchQuery);
      
      const matchesNationality = 
        nationalityFilter === '' || 
        customer.nationality === nationalityFilter;

      return matchesSearch && matchesNationality;
    });
  }, [customers, searchQuery, nationalityFilter]);

  const clearFilters = () => {
    setSearchQuery('');
    setNationalityFilter('');
  };

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

    const payload = {
      Customer_Name: formData.customer_name,
      Email: formData.email,
      Phone: formData.phone,
      Address: formData.address,
      Nationality: formData.nationality,
      ID: formData.id
    };

    try {
      if (editingCustomer && editingCustomer.customer_id) {
        await api.put(`http://192.168.43.54:5000/api/customers/${editingCustomer.customer_id}`, payload);
        showNotification('Customer updated successfully', 'success');
      } else {
        await api.post('http://192.168.43.54:5000/api/customers', payload);
        showNotification('Customer added successfully', 'success');
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (error) {
      showNotification('Operation failed', 'error');
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
      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex gap-2">
            <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 rounded-xl border flex items-center transition-all duration-200 ${showFilters ? 'bg-[#8B5CF6] text-white border-[#8B5CF6]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
            >
            <Filter size={18} className="mr-2" />
            Filters
            </button>
            {(searchQuery || nationalityFilter) && (
                 <button
                 onClick={clearFilters}
                 className="px-4 py-2.5 rounded-xl border border-red-100 text-red-600 bg-red-50 hover:bg-red-100 flex items-center transition-all duration-200"
                 >
                 <RotateCcw size={18} className="mr-2" />
                 Reset
                 </button>
            )}
        </div>
        <button
          onClick={() => openModal()}
          className="bg-[#8B5CF6] text-white px-5 py-2.5 rounded-xl hover:bg-[#7C3AED] transition-all shadow-lg shadow-violet-200 flex items-center font-semibold"
        >
          <Plus size={20} className="mr-2" />
          Add Customer
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-6 animate-in fade-in slide-in-from-top-2">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Search</label>
                    <input 
                        type="text"
                        placeholder="Name, Email, or Phone"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] outline-none transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Nationality</label>
                    <select
                        value={nationalityFilter}
                        onChange={(e) => setNationalityFilter(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] outline-none transition-all"
                    >
                        <option value="">All Nationalities</option>
                        {uniqueNationalities.map(nat => (
                            <option key={nat} value={nat}>{nat}</option>
                        ))}
                    </select>
                </div>
           </div>
        </div>
      )}

      <DataTable<Customer>
        data={filteredCustomers}
        isLoading={isLoading}
        // Disable internal search as we have external logic
        searchPlaceholder="Filter results..."
        columns={[
          { header: 'ID', accessor: 'customer_id', className: 'w-16' },
          { header: 'Name', accessor: 'customer_name' },
          { header: 'Email', accessor: 'email' },
          { header: 'Phone', accessor: 'phone' },
          { header: 'Nationality', accessor: 'nationality' },
          { header: 'CNIC', accessor: 'id' },
        ]}
        onEdit={(item) => openModal(item)}
        onView={(item) => setViewingCustomer(item)}
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
          <div className="flex justify-end gap-3 mt-8">
            <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 font-medium">Cancel</button>
            <button onClick={handleSubmit} className="px-5 py-2.5 bg-[#8B5CF6] text-white rounded-xl hover:bg-[#7C3AED] font-medium shadow-md">
              {editingCustomer ? 'Update Customer' : 'Save Customer'}
            </button>
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={!!viewingCustomer} onClose={() => setViewingCustomer(null)} title="Customer Details">
        {viewingCustomer && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-2">
                <div className="w-16 h-16 rounded-full bg-[#F5F3FF] flex items-center justify-center text-[#8B5CF6] text-xl font-bold border border-violet-100">
                    {viewingCustomer.customer_name.charAt(0)}
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-700">{viewingCustomer.customer_name}</h3>
                    <p className="text-slate-500">{viewingCustomer.email}</p>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-6 border-t border-slate-100 pt-6">
               <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Phone</p><p className="font-medium text-slate-800 mt-1">{viewingCustomer.phone}</p></div>
               <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wide">CNIC</p><p className="font-medium text-slate-800 mt-1">{viewingCustomer.id}</p></div>
               <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Nationality</p><p className="font-medium text-slate-800 mt-1">{viewingCustomer.nationality}</p></div>
               <div className="col-span-2"><p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Address</p><p className="font-medium text-slate-800 mt-1">{viewingCustomer.address}</p></div>
            </div>
            <div className="mt-8 flex justify-end">
              <button onClick={() => setViewingCustomer(null)} className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 font-medium">Close</button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};