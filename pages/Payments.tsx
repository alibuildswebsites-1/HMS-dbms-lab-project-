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
        const [payRaw, bookRaw] = await Promise.all([
            api.get<any[]>('http://192.168.43.54:5000/api/payments'),
            api.get<any[]>('http://192.168.43.54:5000/api/bookings')
        ]);

        const mappedPayments: Payment[] = payRaw.map(p => ({
            payment_id: p.Payment_ID || p.payment_id,
            booking_id: p.Booking_ID || p.booking_id,
            customer_name: p.Customer_Name || p.customer_name,
            amount: p.Amount || p.amount,
            payment_date: p.Payment_Date || p.payment_date,
            payment_status: p.Payment_Status || p.payment_status
        }));
        
        // We only need basic booking info for the dropdown
        const mappedBookings: Booking[] = bookRaw.map(b => ({
            booking_id: b.Booking_ID || b.booking_id,
            customer_id: b.Customer_ID || b.customer_id,
            room_id: b.Room_ID || b.room_id,
            customer_name: b.Customer_Name || b.customer_name,
            // ... other fields not critical for payment dropdown
            booking_status: b.Booking_Status || b.booking_status,
            check_in_date: b.Check_In_Date || b.check_in_date,
            check_out_date: b.Check_Out_Date || b.check_out_date,
            number_of_guests: b.Number_Of_Guests || b.number_of_guests,
            total_amount: b.Total_Amount || b.total_amount,
        } as Booking));

        setPayments(mappedPayments.sort((a, b) => (a.payment_id || 0) - (b.payment_id || 0)));
        setBookings(mappedBookings);
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
            await api.put(`http://192.168.43.54:5000/api/payments/${editingPayment.payment_id}`, payload);
            showNotification('Payment updated', 'success');
        } else {
            await api.post('http://192.168.43.54:5000/api/payments', payload);
            showNotification('Payment recorded', 'success');
        }
        setIsModalOpen(false);
        fetchData();
     } catch (e) {
         showNotification('Operation failed', 'error');
     }
  };

  const handleDelete = async () => {
      if(!deletingPayment || !deletingPayment.payment_id) {
          showNotification('Error: Invalid Payment ID', 'error');
          return;
      }
      try {
          await api.delete(`http://192.168.43.54:5000/api/payments/${deletingPayment.payment_id}`);
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
           <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white p-6 rounded-3xl shadow-lg shadow-violet-200 w-full sm:w-auto relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2"></div>
               <p className="text-xs font-bold uppercase tracking-widest text-white/80 mb-1">Total Revenue</p>
               <h2 className="text-3xl font-bold tracking-tight">PKR {totalRevenue.toLocaleString()}</h2>
           </div>
           <button
            onClick={() => openModal()}
            className="bg-[#8B5CF6] text-white px-5 py-3 rounded-xl hover:bg-[#7C3AED] transition-all shadow-lg shadow-violet-200 flex items-center h-full w-full sm:w-auto justify-center font-semibold"
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
             { header: 'Amount (PKR)', accessor: (row) => row.amount?.toLocaleString() },
             { header: 'Date', accessor: 'payment_date' },
             { header: 'Status', accessor: (row) => (
                 <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${
                     row.payment_status === PaymentStatus.COMPLETED ? 'bg-[#ECFDF5] text-[#059669]' :
                     row.payment_status === PaymentStatus.PENDING ? 'bg-[#FFFBEB] text-[#D97706]' :
                     'bg-[#FFF1F2] text-[#E11D48]'
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
                <div className="flex justify-end gap-3 mt-8">
                    <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 font-medium">Cancel</button>
                    <button onClick={handleSubmit} className="px-5 py-2.5 bg-[#8B5CF6] text-white rounded-xl hover:bg-[#7C3AED] font-medium shadow-md">
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