import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { DataTable, Modal, ConfirmDialog, FormInput, FormSelect } from '../components/Shared';
import { Payment, PaymentStatus, Booking } from '../types';
import { api } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { Plus } from 'lucide-react';

export const Payments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [deletingPayment, setDeletingPayment] = useState<Payment | null>(null);
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState<Partial<Payment>>({});

  const fetchData = async () => {
    setIsLoading(true);
    try {
        const [payData, bookData] = await Promise.all([
            api.get<Payment[]>('http://127.0.0.1:5000/api/payments'),
            api.get<Booking[]>('http://127.0.0.1:5000/api/bookings')
        ]);
        // Sort payments by payment_id ascending
        setPayments(payData.sort((a, b) => (a.payment_id || 0) - (b.payment_id || 0)));
        setBookings(bookData);
    } catch (e) {
        showNotification('Failed to fetch data', 'error');
        setPayments([]);
        setBookings([]);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
     // Map to PascalCase
     const payload = {
         Booking_ID: formData.booking_id,
         Amount: formData.amount,
         Payment_Date: formData.payment_date,
         Payment_Status: formData.payment_status
     };

     try {
        if(editingPayment && editingPayment.payment_id) {
            await api.put(`http://127.0.0.1:5000/api/payments/${editingPayment.payment_id}`, payload);
            showNotification('Payment updated', 'success');
        } else {
            await api.post('http://127.0.0.1:5000/api/payments', payload);
            showNotification('Payment recorded', 'success');
        }
        setIsModalOpen(false);
        fetchData();
     } catch (e) {
         showNotification('Operation failed', 'error');
     }
  };

  const handleDelete = async () => {
      if(!deletingPayment?.payment_id) return;
      try {
          await api.delete(`http://127.0.0.1:5000/api/payments/${deletingPayment.payment_id}`);
          showNotification('Payment deleted', 'success');
          setDeletingPayment(null);
          fetchData();
      } catch (e) {
          showNotification('Delete failed', 'error');
      }
  };

  const openModal = (payment?: Payment) => {
      setEditingPayment(payment || null);
      setFormData(payment || {
          amount: 0,
          payment_date: new Date().toISOString().split('T')[0],
          payment_status: PaymentStatus.PENDING
      });
      setIsModalOpen(true);
  };

  const totalRevenue = payments
    .filter(p => p.payment_status === PaymentStatus.COMPLETED)
    .reduce((sum, p) => sum + p.amount, 0);

  // Helper for displaying customer names if backend only sends booking_id
  const getCustomerNameForPayment = (bookingId: number) => {
      const booking = bookings.find(b => b.booking_id === bookingId);
      return booking ? (booking.customer_name || `Booking #${bookingId}`) : `Booking #${bookingId}`;
  };

  return (
    <Layout title="Payments">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
           <div className="bg-[#01411C] text-[#FDB913] p-4 rounded-lg shadow-md w-full sm:w-auto">
               <p className="text-sm font-medium uppercase tracking-wider text-white">Total Revenue Collected</p>
               <h2 className="text-3xl font-bold mt-1">PKR {totalRevenue.toLocaleString()}</h2>
           </div>
           <button
            onClick={() => openModal()}
            className="bg-[#01411C] text-white px-4 py-2 rounded-lg hover:bg-green-900 transition flex items-center shadow-md h-10 w-full sm:w-auto justify-center"
           >
            <Plus size={20} className="mr-2" />
            Record Payment
           </button>
       </div>

       <DataTable<Payment>
         data={payments}
         isLoading={isLoading}
         columns={[
             { header: 'ID', accessor: 'payment_id', className: 'w-16' },
             { header: 'Booking ID', accessor: 'booking_id' },
             { header: 'Customer', accessor: (row) => row.customer_name || getCustomerNameForPayment(row.booking_id) },
             { header: 'Amount (PKR)', accessor: (row) => row.amount.toLocaleString() },
             { header: 'Date', accessor: 'payment_date' },
             { header: 'Status', accessor: (row) => (
                 <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                     row.payment_status === PaymentStatus.COMPLETED ? 'bg-green-100 text-green-800' :
                     row.payment_status === PaymentStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
                     'bg-red-100 text-red-800'
                 }`}>{row.payment_status}</span>
             )}
         ]}
         onEdit={openModal}
         onDelete={setDeletingPayment}
         searchPlaceholder="Search payments..."
       />

       <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPayment ? 'Edit Payment' : 'Record New Payment'}>
           <div className="space-y-4">
                <FormSelect
                    label="Booking ID"
                    value={formData.booking_id}
                    onChange={(e) => setFormData({...formData, booking_id: Number(e.target.value)})}
                    disabled={!!editingPayment}
                >
                    <option value="">Select Booking</option>
                    {bookings.map(b => <option key={b.booking_id} value={b.booking_id}>Booking #{b.booking_id} - {b.customer_name || 'Customer'}</option>)}
                </FormSelect>
                <FormInput
                    label="Amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: parseInt(e.target.value)})}
                />
                <FormInput
                    label="Date"
                    type="date"
                    value={formData.payment_date ? new Date(formData.payment_date).toISOString().split('T')[0] : ''}
                    onChange={(e) => setFormData({...formData, payment_date: e.target.value})}
                />
                <FormSelect
                    label="Status"
                    value={formData.payment_status}
                    onChange={(e) => setFormData({...formData, payment_status: e.target.value as PaymentStatus})}
                >
                    {Object.values(PaymentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </FormSelect>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-[#01411C] text-white rounded-lg hover:bg-green-900">
                        {editingPayment ? 'Update Payment' : 'Save Payment'}
                    </button>
                </div>
           </div>
       </Modal>
       
       <ConfirmDialog
        isOpen={!!deletingPayment}
        title="Delete Payment"
        message="Are you sure?"
        onConfirm={handleDelete}
        onCancel={() => setDeletingPayment(null)}
       />
    </Layout>
  );
};