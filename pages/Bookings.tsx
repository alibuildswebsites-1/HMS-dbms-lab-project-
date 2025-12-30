import React, { useEffect, useState, useMemo } from 'react';
import { Layout } from '../components/Layout';
import { DataTable, Modal, ConfirmDialog, FormInput, FormSelect } from '../components/Shared';
import { Booking, BookingStatus, Customer, Room, RoomStatus } from '../types';
import { api } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { Plus } from 'lucide-react';

export const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [deletingBooking, setDeletingBooking] = useState<Booking | null>(null);
  const { showNotification } = useNotification();

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
      const [bookingsData, customersData, roomsData] = await Promise.all([
        api.get<Booking[]>('http://192.168.43.171:5000/api/bookings'),
        api.get<Customer[]>('http://192.168.43.171:5000/api/customers'),
        api.get<Room[]>('http://192.168.43.171:5000/api/rooms')
      ]);
      // Sort bookings by booking_id ascending
      setBookings(bookingsData.sort((a, b) => (a.booking_id || 0) - (b.booking_id || 0)));
      setCustomers(customersData);
      setRooms(roomsData);
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
        await api.put(`http://192.168.43.171:5000/api/bookings/${editingBooking.booking_id}`, payload);
        showNotification('Booking updated', 'success');
      } else {
        await api.post('http://192.168.43.171:5000/api/bookings', payload);
        showNotification('Booking created', 'success');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      showNotification('Operation failed', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingBooking?.booking_id) return;
    try {
      await api.delete(`http://192.168.43.171:5000/api/bookings/${deletingBooking.booking_id}`);
      showNotification('Booking deleted', 'success');
      setDeletingBooking(null);
      fetchData();
    } catch (error) {
       showNotification('Delete failed', 'error');
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
          await api.put(`http://192.168.43.171:5000/api/bookings/${booking.booking_id}`, payload);
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

  // Helper to find names (since API might return IDs only)
  const getCustomerName = (id: number) => customers.find(c => c.customer_id === id)?.customer_name || id;
  const getRoomNumber = (id: number) => rooms.find(r => r.room_id === id)?.room_number || id;

  return (
    <Layout title="Bookings">
      <div className="flex justify-end mb-6">
        <button
          onClick={() => openModal()}
          className="bg-[#4A7C59] text-white px-5 py-2.5 rounded-xl hover:bg-[#3B6347] transition-all shadow-lg shadow-[#4A7C59]/30 flex items-center font-semibold"
        >
          <Plus size={20} className="mr-2" />
          Create Booking
        </button>
      </div>

      <DataTable<Booking>
        data={bookings}
        isLoading={isLoading}
        columns={[
          { header: 'ID', accessor: 'booking_id', className: 'w-16' },
          { header: 'Customer', accessor: (row) => row.customer_name || getCustomerName(row.customer_id) },
          { header: 'Room', accessor: (row) => row.room_number || getRoomNumber(row.room_id) },
          { header: 'Check In', accessor: 'check_in_date' },
          { header: 'Check Out', accessor: 'check_out_date' },
          { header: 'Guests', accessor: 'number_of_guests' },
          { header: 'Total (PKR)', accessor: (row) => row.total_amount.toLocaleString() },
          {
            header: 'Status',
            accessor: (row) => (
              <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${
                row.booking_status === BookingStatus.CONFIRMED ? 'bg-[#E6F4EA] text-[#4A7C59]' :
                row.booking_status === BookingStatus.PENDING ? 'bg-[#FFF8E1] text-[#7A4F01]' :
                row.booking_status === BookingStatus.CANCELLED ? 'bg-[#FCE8E6] text-[#E07A5F]' :
                'bg-[#E0FBFC] text-[#3D5A80]'
              }`}>
                {row.booking_status}
              </span>
            )
          }
        ]}
        onEdit={openModal}
        onDelete={setDeletingBooking}
        renderActions={(row) => (
            row.booking_status !== BookingStatus.CANCELLED && row.booking_status !== BookingStatus.COMPLETED ? (
                <button 
                    onClick={() => handleCancelBooking(row)}
                    className="text-[#E07A5F] hover:text-[#C45F44] font-semibold px-3 py-1.5 hover:bg-[#FFF5F2] rounded-lg transition-colors text-xs mr-2"
                >
                    Cancel
                </button>
            ) : null
        )}
        searchPlaceholder="Search bookings..."
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
                <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 font-medium">Cancel</button>
                <button onClick={handleSubmit} className="px-5 py-2.5 bg-[#4A7C59] text-white rounded-xl hover:bg-[#3B6347] font-medium shadow-md">
                {editingBooking ? 'Update Booking' : 'Create Booking'}
                </button>
            </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingBooking}
        title="Delete Booking"
        message={`Delete booking #${deletingBooking?.booking_id}?`}
        onConfirm={handleDelete}
        onCancel={() => setDeletingBooking(null)}
      />
    </Layout>
  );
};