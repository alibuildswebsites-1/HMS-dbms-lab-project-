import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { DataTable, Modal, FormInput, FormSelect } from '../components/Shared';
import { Payment, PaymentStatus, Booking, Customer } from '../types';
import { api } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { Plus } from 'lucide-react';

export const Payments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState<Partial<Payment>>({});

  const fetchData = async () => {
    setIsLoading(true);
    try {
        const [payRaw, bookRaw, custRaw] = await Promise.all([
            api.get<any[]>('http://192.168.40.190:5000/api/payments'),
            api.get<any[]>('http://192.168.40.190:5000/api/bookings'),
            api.get<any[]>('http://192.168.40.190:5000/api/customers')
        ]);

        const mappedPayments: Payment[] = payRaw.map(p => ({
            payment_id: p.Payment_ID || p.payment_id,
            booking_id: p.Booking_ID || p.booking_id,
            customer_name: p.Customer_Name || p.customer_name,
            amount: parseFloat(p.Amount || p.amount || 0), // Ensure this is a number
            payment_date: p.Payment_Date || p.payment_date,
            payment_status: p.Payment_Status || p.payment_status
        }));
        
        const mappedBookings: Booking[] = bookRaw.map(b => ({
            booking_id: b.Booking_ID || b.booking_id,
            customer_id: b.Customer_ID || b.customer_id,
            room_id: b.Room_ID || b.room_id,
            customer_name: b.Customer_Name || b.customer_name,
            booking_status: b.Booking_Status || b.booking_status,
            check_in_date: b.Check_In_Date || b.check_in_date,
            check_out_date: b.Check_Out_Date || b.check_out_date,
            number_of_guests: b.Number_Of_Guests || b.number_of_guests,
            total_amount: b.Total_Amount || b.total_amount,
        } as Booking));

        const mappedCustomers: Customer[] = custRaw.map(c => ({
            customer_id: c.Customer_ID || c.customer_id,
            customer_name: c.Customer_Name || c.customer_name,
            email: c.Email || c.email,
            phone: c.Phone || c.phone,
            address: c.Address || c.address,
            nationality: c.Nationality || c.nationality,
            id: c.ID || c.id || c.CNIC
        }));

        setPayments(mappedPayments.sort((a, b) => (a.payment_id || 0) - (b.payment_id || 0)));
        setBookings(mappedBookings);
        setCustomers(mappedCustomers);
    } catch (e) {
        showNotification('Failed to fetch data', 'error');
        setPayments([]);
        setBookings([]);
        setCustomers([]);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
     const payload = {
         Booking_ID: formData.booking_id,
         Amount: Number(formData.amount),
         Payment_Date: formData.payment_date,
         Payment_Status: formData.payment_status
     };

     try {
        if(editingPayment && editingPayment.payment_id) {
            await api.put(`http://192.168.40.190:5000/api/payments/${editingPayment.payment_id}`, payload);
            showNotification('Payment updated', 'success');
        } else {
            await api.post('http://192.168.40.190:5000/api/payments', payload);
            showNotification('Payment recorded', 'success');
        }
        setIsModalOpen(false);
        fetchData();
     } catch (e) {
         showNotification('Operation failed', 'error');
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

  // Case-insensitive check for completed status
  const totalRevenue = payments
    .filter(p => p.payment_status?.toLowerCase() === 'completed')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const getCustomerNameForPayment = (bookingId: number) => {
      const booking = bookings.find(b => b.booking_id === bookingId);
      if (!booking) return `Booking #${bookingId}`;
      
      // If booking has customer_name (joined query)
      if (booking.customer_name) return booking.customer_name;

      // Fallback: find in customers list
      const customer = customers.find(c => c.customer_id === booking.customer_id);
      return customer ? customer.customer_name : `Customer ${booking.customer_id}`;
  };

  const formatDate = (dateStr: string) => {
      if (!dateStr) return '-';
      return new Date(dateStr).toLocaleDateString();
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
             { header: 'Amount (PKR)', accessor: (row) => Number(row.amount)?.toLocaleString() },
             { header: 'Date', accessor: (row) => formatDate(row.payment_date) },
             { header: 'Status', accessor: (row) => {
                 const status = row.payment_status?.toLowerCase() || '';
                 return (
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${
                        status === 'completed' ? 'bg-[#ECFDF5] text-[#059669]' :
                        status === 'pending' ? 'bg-[#FFFBEB] text-[#D97706]' :
                        'bg-[#FFF1F2] text-[#E11D48]'
                    }`}>{row.payment_status}</span>
                 );
             }}
         ]}
         onEdit={openModal}
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
                    {bookings.map(b => (
                        <option key={b.booking_id} value={b.booking_id}>
                            Booking #{b.booking_id} - {getCustomerNameForPayment(b.booking_id || 0)}
                        </option>
                    ))}
                </FormSelect>
                <FormInput
                    label="Amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
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
    </Layout>
  );
};