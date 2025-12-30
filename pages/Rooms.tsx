import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { DataTable, Modal, ConfirmDialog, FormInput, FormSelect } from '../components/Shared';
import { Room, RoomType, RoomStatus } from '../types';
import { api } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { Plus } from 'lucide-react';

export const Rooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deletingRoom, setDeletingRoom] = useState<Room | null>(null);
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState<Partial<Room>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<Room[]>('http://192.168.43.171:5000/api/rooms');
      // Sort by room_number using numeric sort (handles "10", "2" correctly)
      setRooms(data.sort((a, b) => a.room_number.localeCompare(b.room_number, undefined, { numeric: true })));
    } catch (error) {
      showNotification('Failed to fetch rooms', 'error');
      setRooms([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.room_number) newErrors.room_number = 'Required';
    if (!formData.price_per_night || Number(formData.price_per_night) <= 0) newErrors.price_per_night = 'Invalid Price';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    // Map to PascalCase for API
    const payload = {
      Room_Number: formData.room_number,
      Room_Type: formData.room_type,
      Floor_Number: formData.floor_number,
      Price_Per_Night: formData.price_per_night,
      Room_Status: formData.room_status
    };

    try {
      if (editingRoom && editingRoom.room_id) {
        await api.put(`http://192.168.43.171:5000/api/rooms/${editingRoom.room_id}`, payload);
        showNotification('Room updated', 'success');
      } else {
        await api.post('http://192.168.43.171:5000/api/rooms', payload);
        showNotification('Room created', 'success');
      }
      setIsModalOpen(false);
      fetchRooms();
    } catch (error) {
      showNotification('Operation failed', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingRoom?.room_id) return;
    try {
      await api.delete(`http://192.168.43.171:5000/api/rooms/${deletingRoom.room_id}`);
      showNotification('Room deleted', 'success');
      setDeletingRoom(null);
      fetchRooms();
    } catch (error) {
      showNotification('Delete failed', 'error');
    }
  };

  const openModal = (room?: Room) => {
    setEditingRoom(room || null);
    setFormData(room || {
      room_number: '',
      room_type: RoomType.SINGLE,
      floor_number: 1,
      price_per_night: 0,
      room_status: RoomStatus.AVAILABLE
    });
    setErrors({});
    setIsModalOpen(true);
  };

  return (
    <Layout title="Rooms">
      <div className="flex justify-end mb-6">
        <button
          onClick={() => openModal()}
          className="bg-[#4A7C59] text-white px-5 py-2.5 rounded-xl hover:bg-[#3B6347] transition-all shadow-lg shadow-[#4A7C59]/30 flex items-center font-semibold"
        >
          <Plus size={20} className="mr-2" />
          Add Room
        </button>
      </div>

      <DataTable<Room>
        data={rooms}
        isLoading={isLoading}
        columns={[
          { header: 'Room #', accessor: 'room_number', className: 'w-24 font-bold text-[#2C4A3B]' },
          { header: 'Type', accessor: 'room_type' },
          { header: 'Floor', accessor: 'floor_number' },
          { header: 'Price (PKR)', accessor: (row) => row.price_per_night.toLocaleString() },
          { 
            header: 'Status', 
            accessor: (row) => (
              <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${
                row.room_status === RoomStatus.AVAILABLE ? 'bg-[#E6F4EA] text-[#4A7C59]' :
                row.room_status === RoomStatus.OCCUPIED ? 'bg-[#FCE8E6] text-[#E07A5F]' :
                row.room_status === RoomStatus.RESERVED ? 'bg-[#FFF8E1] text-[#7A4F01]' :
                'bg-gray-100 text-gray-600'
              }`}>
                {row.room_status}
              </span>
            ) 
          }
        ]}
        onEdit={openModal}
        onDelete={setDeletingRoom}
        searchPlaceholder="Search rooms..."
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRoom ? 'Edit Room' : 'Add Room'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput 
              label="Room Number" 
              value={formData.room_number || ''} 
              onChange={(e) => setFormData({...formData, room_number: e.target.value})}
              error={errors.room_number}
            />
            <FormInput 
              label="Floor Number" 
              type="number"
              value={formData.floor_number} 
              onChange={(e) => setFormData({...formData, floor_number: parseInt(e.target.value)})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <FormSelect 
                label="Room Type" 
                value={formData.room_type} 
                onChange={(e) => setFormData({...formData, room_type: e.target.value as RoomType})}
              >
                {Object.values(RoomType).map(t => <option key={t} value={t}>{t}</option>)}
             </FormSelect>
             <FormInput 
                label="Price Per Night" 
                type="number"
                value={formData.price_per_night} 
                onChange={(e) => setFormData({...formData, price_per_night: parseInt(e.target.value)})}
                error={errors.price_per_night}
              />
          </div>

          <FormSelect 
            label="Status" 
            value={formData.room_status} 
            onChange={(e) => setFormData({...formData, room_status: e.target.value as RoomStatus})}
          >
            {Object.values(RoomStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </FormSelect>

          <div className="flex justify-end gap-3 mt-8">
            <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 font-medium">Cancel</button>
            <button onClick={handleSubmit} className="px-5 py-2.5 bg-[#4A7C59] text-white rounded-xl hover:bg-[#3B6347] font-medium shadow-md">
              {editingRoom ? 'Update Room' : 'Save Room'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingRoom}
        title="Delete Room"
        message={`Delete Room ${deletingRoom?.room_number}?`}
        onConfirm={handleDelete}
        onCancel={() => setDeletingRoom(null)}
      />
    </Layout>
  );
};