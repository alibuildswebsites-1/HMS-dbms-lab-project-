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
    
    // Find room price - Updated to use room_id
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
        api.get<Booking[]>('/bookings'),
        api.get<Customer[]>('/customers'),
        api.get<Room[]>('/rooms')
      ]);
      setBookings(bookingsData);
      setCustomers(customersData);
      setRooms(roomsData);
    } catch (error) {
       // Mock fallback
       setBookings([
         { booking_id: 1, customer_id: 1, room_id: 2, customer_name: 'Ali Khan', room_number: '102', room_type: 'Double', check_in_date: '2023-10-01', check_out_date: '2023-10-05', number_of_guests: 2, total_amount: 32000, booking_status: BookingStatus.CONFIRMED },
       ]);
       setCustomers([{ customer_id: 1, customer_name: 'Ali Khan' } as any]);
       setRooms([{ room_id: 2, room_number: '102', price_per_night: 8000 } as any]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    try {
      if (editingBooking && editingBooking.booking_id) {
        await api.put(`/bookings/${editingBooking.booking_id}`, formData);
        showNotification('Booking updated', 'success');
      } else {
        await api.post('/bookings', formData);
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
      await api.delete(`/bookings/${deletingBooking.booking_id}`);
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
          await api.put(`/bookings/${booking.booking_id}`, { ...booking, booking_status: BookingStatus.CANCELLED });
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
      <div className="flex justify-end mb-6">
        <button
          onClick={() => openModal()}
          className="bg-[#01411C] text-white px-4 py-2 rounded-lg hover:bg-green-900 transition flex items-center shadow-md"
        >
          <Plus size={20} className="mr-2" />
          Create New Booking
        </button>
      </div>

      <DataTable<Booking>
        data={bookings}
        isLoading={isLoading}
        columns={[
          { header: 'ID', accessor: 'booking_id', className: 'w-16' },
          { header: 'Customer', accessor: 'customer_name' },
          { header: 'Room', accessor: 'room_number' },
          { header: 'Check In', accessor: 'check_in_date' },
          { header: 'Check Out', accessor: 'check_out_date' },
          { header: 'Guests', accessor: 'number_of_guests' },
          { header: 'Total (PKR)', accessor: (row) => row.total_amount.toLocaleString() },
          {
            header: 'Status',
            accessor: (row) => (
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                row.booking_status === BookingStatus.CONFIRMED ? 'bg-green-100 text-green-800' :
                row.booking_status === BookingStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
                row.booking_status === BookingStatus.CANCELLED ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
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
                    className="text-orange-600 hover:text-orange-800 font-medium px-2 py-1 hover:bg-orange-50 rounded mr-2"
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
                {customers.map(c => <option key={c.customer_id} value={c.customer_id}>{c.customer_name} ({c.cnic_id})</option>)}
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

            <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button onClick={handleSubmit} className="px-4 py-2 bg-[#01411C] text-white rounded-lg hover:bg-green-900">
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
