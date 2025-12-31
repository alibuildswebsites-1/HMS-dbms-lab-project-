import React, { useEffect, useState, useMemo } from 'react';
import { Layout } from '../components/Layout';
import { DataTable, Modal, FormInput, FormSelect } from '../components/Shared';
import { Booking, BookingStatus, Customer, Room, RoomStatus } from '../types';
import { api } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { Plus, Filter, RotateCcw } from 'lucide-react';

export const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const { showNotification } = useNotification();

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');

  const [formData, setFormData] = useState<Partial<Booking>>({});
  
  // Calculate total automatically
  const calculatedTotal = useMemo(() => {
    if (!formData.check_in_date || !formData.check_out_date || !formData.room_id) return 0;
    const start = new Date(formData.check_in_date);
    const end = new Date(formData.check_out_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    // Find room price
    const room = rooms.find(r => r.room_id === Number(formData.room_id));
    if (!room) return 0;
    
    return diffDays * room.price_per_night;
  }, [formData.check_in_date, formData.check_out_date, formData.room_id, rooms]);

  // Update form data when calc total changes
  useEffect(() => {
    if(calculatedTotal > 0 && isModalOpen) {
        setFormData(prev => ({...prev, total_amount: calculatedTotal}));
    }
  }, [calculatedTotal, isModalOpen]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [bookingsRaw, customersRaw, roomsRaw] = await Promise.all([
        api.get<any[]>('http://192.168.40.190:5000/api/bookings'),
        api.get<any[]>('http://192.168.40.190:5000/api/customers'),
        api.get<any[]>('http://192.168.40.190:5000/api/rooms')
      ]);

      const mappedBookings: Booking[] = bookingsRaw.map(b => ({
          booking_id: b.Booking_ID || b.booking_id,
          customer_id: b.Customer_ID || b.customer_id,
          room_id: b.Room_ID || b.room_id,
          customer_name: b.Customer_Name || b.customer_name,
          room_number: b.Room_Number || b.room_number,
          booking_date: b.Booking_Date || b.booking_date,
          check_in_date: b.Check_In_Date || b.check_in_date,
          check_out_date: b.Check_Out_Date || b.check_out_date,
          number_of_guests: b.Number_Of_Guests || b.number_of_guests,
          total_amount: b.Total_Amount || b.total_amount,
          booking_status: b.Booking_Status || b.booking_status,
      }));

      const mappedCustomers: Customer[] = customersRaw.map(item => ({
        customer_id: item.Customer_ID || item.customer_id,
        customer_name: item.Customer_Name || item.customer_name,
        email: item.Email || item.email,
        phone: item.Phone || item.phone,
        address: item.Address || item.address,
        nationality: item.Nationality || item.nationality,
        id: item.ID || item.id || item.CNIC
      }));

      const mappedRooms: Room[] = roomsRaw.map(item => ({
        room_id: item.Room_ID || item.room_id,
        room_number: item.Room_Number || item.room_number,
        room_type: item.Room_Type || item.room_type,
        floor_number: item.Floor_Number || item.floor_number,
        price_per_night: item.Price_Per_Night || item.price_per_night,
        room_status: item.Room_Status || item.room_status,
      }));

      setBookings(mappedBookings.sort((a, b) => (a.booking_id || 0) - (b.booking_id || 0)));
      setCustomers(mappedCustomers);
      setRooms(mappedRooms);
    } catch (error) {
       showNotification('Failed to fetch data', 'error');
       setBookings([]);
       setCustomers([]);
       setRooms([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper to find names (since API might return IDs only)
  const getCustomerName = (id: number) => customers.find(c => c.customer_id === id)?.customer_name || String(id);
  const getRoomNumber = (id: number) => rooms.find(r => r.room_id === id)?.room_number || String(id);

  const filteredBookings = useMemo(() => {
      return bookings.filter(b => {
          const cName = b.customer_name || getCustomerName(b.customer_id);
          const matchesCustomer = customerSearch === '' || cName?.toLowerCase().includes(customerSearch.toLowerCase());
          const matchesStatus = statusFilter === '' || b.booking_status === statusFilter;
          
          let matchesDate = true;
          if (startDate && b.check_in_date < startDate) matchesDate = false;
          if (endDate && b.check_in_date > endDate) matchesDate = false;

          return matchesCustomer && matchesStatus && matchesDate;
      });
  }, [bookings, customerSearch, statusFilter, startDate, endDate, customers]);

  const clearFilters = () => {
      setCustomerSearch('');
      setStatusFilter('');
      setStartDate('');
      setEndDate('');
  };

  const handleSubmit = async () => {
    // Map to PascalCase for API
    const payload = {
        Customer_ID: formData.customer_id,
        Room_ID: formData.room_id,
        Booking_Date: new Date().toISOString().split('T')[0], // Set current date as Booking Date
        Check_In_Date: formData.check_in_date,
        Check_Out_Date: formData.check_out_date,
        Number_Of_Guests: formData.number_of_guests,
        Total_Amount: formData.total_amount,
        Booking_Status: formData.booking_status
    };

    try {
      if (editingBooking && editingBooking.booking_id) {
        await api.put(`http://192.168.40.190:5000/api/bookings/${editingBooking.booking_id}`, payload);
        showNotification('Booking updated', 'success');
      } else {
        await api.post('http://192.168.40.190:5000/api/bookings', payload);
        showNotification('Booking created', 'success');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      showNotification('Operation failed', 'error');
    }
  };

  const handleCancelBooking = async (booking: Booking) => {
    try {
        if (booking.booking_id) {
          const payload = {
              Customer_ID: booking.customer_id,
              Room_ID: booking.room_id,
              Booking_Date: booking.booking_date || new Date().toISOString().split('T')[0],
              Check_In_Date: booking.check_in_date,
              Check_Out_Date: booking.check_out_date,
              Number_Of_Guests: booking.number_of_guests,
              Total_Amount: booking.total_amount,
              Booking_Status: BookingStatus.CANCELLED
          };
          await api.put(`http://192.168.40.190:5000/api/bookings/${booking.booking_id}`, payload);
          showNotification('Booking cancelled', 'success');
          fetchData();
        }
    } catch (error) {
        showNotification('Failed to cancel', 'error');
    }
  };

  const openModal = (booking?: Booking) => {
    setEditingBooking(booking || null);
    setFormData(booking || {
      check_in_date: '',
      check_out_date: '',
      number_of_guests: 1,
      total_amount: 0,
      booking_status: BookingStatus.PENDING
    });
    setIsModalOpen(true);
  };

  return (
    <Layout title="Bookings">
       {/* Actions */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
         <div className="flex gap-2">
            <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 rounded-xl border flex items-center transition-all duration-200 ${showFilters ? 'bg-[#8B5CF6] text-white border-[#8B5CF6]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
            >
            <Filter size={18} className="mr-2" />
            Filters
            </button>
            {(statusFilter || customerSearch || startDate || endDate) && (
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
          Create Booking
        </button>
      </div>

       {/* Advanced Filters */}
       {showFilters && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-6 animate-in fade-in slide-in-from-top-2">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Customer Name</label>
                    <input 
                        type="text"
                        placeholder="Search customer..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] outline-none transition-all"
                     />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] outline-none transition-all"
                    >
                        <option value="">All Statuses</option>
                        {Object.values(BookingStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-2">From Date</label>
                     <input 
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] outline-none transition-all"
                     />
                </div>
                <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-2">To Date</label>
                     <input 
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] outline-none transition-all"
                     />
                </div>
           </div>
        </div>
      )}

      <DataTable<Booking>
        data={filteredBookings}
        isLoading={isLoading}
        columns={[
          { header: 'ID', accessor: 'booking_id', className: 'w-16' },
          { header: 'Customer', accessor: (row) => row.customer_name || getCustomerName(row.customer_id) },
          { header: 'Room', accessor: (row) => row.room_number || getRoomNumber(row.room_id) },
          { header: 'Check In', accessor: 'check_in_date' },
          { header: 'Check Out', accessor: 'check_out_date' },
          { header: 'Guests', accessor: 'number_of_guests' },
          { header: 'Total (PKR)', accessor: (row) => row.total_amount?.toLocaleString() },
          {
            header: 'Status',
            accessor: (row) => (
              <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${
                row.booking_status === BookingStatus.CONFIRMED ? 'bg-[#ECFDF5] text-[#059669]' :
                row.booking_status === BookingStatus.PENDING ? 'bg-[#FFFBEB] text-[#D97706]' :
                row.booking_status === BookingStatus.CANCELLED ? 'bg-[#FFF1F2] text-[#E11D48]' :
                'bg-[#EFF6FF] text-[#2563EB]'
              }`}>
                {row.booking_status}
              </span>
            )
          }
        ]}
        onEdit={openModal}
        renderActions={(row) => (
            row.booking_status !== BookingStatus.CANCELLED && row.booking_status !== BookingStatus.COMPLETED ? (
                <button 
                    onClick={() => handleCancelBooking(row)}
                    className="text-[#FB7185] hover:text-[#E11D48] font-semibold px-3 py-1.5 hover:bg-[#FFF1F2] rounded-lg transition-colors text-xs mr-2"
                >
                    Cancel
                </button>
            ) : null
        )}
        searchPlaceholder="Quick filter..."
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingBooking ? 'Edit Booking' : 'Create Booking'}>
        <div className="space-y-4">
            <FormSelect
                label="Customer"
                value={formData.customer_id}
                onChange={(e) => setFormData({...formData, customer_id: Number(e.target.value)})}
            >
                <option value="">Select Customer</option>
                {customers.map(c => <option key={c.customer_id} value={c.customer_id}>{c.customer_name} ({c.id})</option>)}
            </FormSelect>

            <FormSelect
                label="Room"
                value={formData.room_id}
                onChange={(e) => setFormData({...formData, room_id: Number(e.target.value)})}
            >
                <option value="">Select Room</option>
                {rooms.map(r => (
                    <option key={r.room_id} value={r.room_id}>
                        {r.room_number} - {r.room_type} ({r.price_per_night} PKR) {r.room_status !== RoomStatus.AVAILABLE && !editingBooking ? '(Not Available)' : ''}
                    </option>
                ))}
            </FormSelect>

            <div className="grid grid-cols-2 gap-4">
                <FormInput 
                    label="Check In" 
                    type="date" 
                    value={formData.check_in_date ? new Date(formData.check_in_date).toISOString().split('T')[0] : ''}
                    onChange={(e) => setFormData({...formData, check_in_date: e.target.value})}
                />
                <FormInput 
                    label="Check Out" 
                    type="date"
                    value={formData.check_out_date ? new Date(formData.check_out_date).toISOString().split('T')[0] : ''}
                    onChange={(e) => setFormData({...formData, check_out_date: e.target.value})}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormInput 
                    label="Number of Guests" 
                    type="number"
                    value={formData.number_of_guests}
                    onChange={(e) => setFormData({...formData, number_of_guests: parseInt(e.target.value)})}
                />
                <FormInput 
                    label="Total Amount" 
                    type="number"
                    value={formData.total_amount}
                    disabled
                    // This is auto calculated
                />
            </div>
            
            <FormSelect
                label="Status"
                value={formData.booking_status}
                onChange={(e) => setFormData({...formData, booking_status: e.target.value as BookingStatus})}
            >
                 {Object.values(BookingStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </FormSelect>

            <div className="flex justify-end gap-3 mt-8">
                <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 font-medium">Cancel</button>
                <button onClick={handleSubmit} className="px-5 py-2.5 bg-[#8B5CF6] text-white rounded-xl hover:bg-[#7C3AED] font-medium shadow-md">
                {editingBooking ? 'Update Booking' : 'Create Booking'}
                </button>
            </div>
        </div>
      </Modal>
    </Layout>
  );
};