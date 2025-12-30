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
      const data = await api.get<Room[]>('/rooms');
      setRooms(data);
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
    try {
      if (editingRoom && editingRoom.room_id) {
        await api.put(`/rooms/${editingRoom.room_id}`, formData);
        showNotification('Room updated', 'success');
      } else {
        await api.post('/rooms', formData);
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
      await api.delete(`/rooms/${deletingRoom.room_id}`);
      showNotification('Room deleted', 'success');
      setDeletingRoom(null);
      fetchRooms();
    } catch (error) {
      showNotification('Delete failed', 'error');
    }
  };

  const handleStatusUpdate = async (room: Room, status: string) => {
    try {
      if (room.room_id) {
        await api.put(`/rooms/${room.room_id}`, { ...room, room_status: status });
        showNotification(`Status updated to ${status}`, 'success');
        fetchRooms();
      }
    } catch (error) {
      showNotification('Failed to update status', 'error');
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

  const getStatusColor = (status: RoomStatus) => {
    switch (status) {
      case RoomStatus.AVAILABLE: return 'bg-green-100 text-green-800';
      case RoomStatus.OCCUPIED: return 'bg-red-100 text-red-800';
      case RoomStatus.RESERVED: return 'bg-yellow-100 text-yellow-800';
      case RoomStatus.MAINTENANCE: return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100';
    }
  };

  return (
    <Layout title="Rooms">
      <div className="flex justify-end mb-6">
        <button
          onClick={() => openModal()}
          className="bg-[#01411C] text-white px-4 py-2 rounded-lg hover:bg-green-900 transition flex items-center shadow-md"
        >
          <Plus size={20} className="mr-2" />
          Add New Room
        </button>
      </div>

      <DataTable<Room>
        data={rooms}
        isLoading={isLoading}
        columns={[
          { header: 'Room #', accessor: 'room_number' },
          { header: 'Type', accessor: 'room_type' },
          { header: 'Floor', accessor: 'floor_number' },
          { 
            header: 'Price (PKR)', 
            accessor: (row) => row.price_per_night.toLocaleString() 
          },
          {
            header: 'Status',
            accessor: (row) => (
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(row.room_status)}`}>
                {row.room_status}
              </span>
            )
          }
        ]}
        onEdit={openModal}
        onDelete={setDeletingRoom}
        renderActions={(row) => (
          <select
            className="text-xs border-gray-300 rounded mr-2"
            value={row.room_status}
            onChange={(e) => handleStatusUpdate(row, e.target.value)}
          >
            {Object.values(RoomStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
        searchPlaceholder="Search rooms..."
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRoom ? 'Edit Room' : 'Add New Room'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Room Number"
              value={formData.room_number || ''}
              onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
              error={errors.room_number}
            />
            <FormInput
              label="Floor Number"
              type="number"
              value={formData.floor_number || ''}
              onChange={(e) => setFormData({ ...formData, floor_number: parseInt(e.target.value) })}
            />
          </div>
          <FormSelect
            label="Room Type"
            value={formData.room_type}
            onChange={(e) => setFormData({ ...formData, room_type: e.target.value as RoomType })}
          >
            {Object.values(RoomType).map(t => <option key={t} value={t}>{t}</option>)}
          </FormSelect>
          <FormInput
            label="Price Per Night (PKR)"
            type="number"
            value={formData.price_per_night || ''}
            onChange={(e) => setFormData({ ...formData, price_per_night: parseInt(e.target.value) })}
            error={errors.price_per_night}
          />
          <FormSelect
            label="Status"
            value={formData.room_status}
            onChange={(e) => setFormData({ ...formData, room_status: e.target.value as RoomStatus })}
          >
            {Object.values(RoomStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </FormSelect>

          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleSubmit} className="px-4 py-2 bg-[#01411C] text-white rounded-lg hover:bg-green-900">
              {editingRoom ? 'Update Room' : 'Create Room'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingRoom}
        title="Delete Room"
        message={`Delete room ${deletingRoom?.room_number}?`}
        onConfirm={handleDelete}
        onCancel={() => setDeletingRoom(null)}
      />
    </Layout>
  );
};