import React, { useEffect, useState, useMemo } from 'react';
import { Layout } from '../components/Layout';
import { DataTable, Modal, ConfirmDialog, FormInput, FormSelect } from '../components/Shared';
import { Room, RoomType, RoomStatus } from '../types';
import { api } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { Plus, Filter, RotateCcw } from 'lucide-react';

export const Rooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deletingRoom, setDeletingRoom] = useState<Room | null>(null);
  const { showNotification } = useNotification();

  // Filters State
  const [showFilters, setShowFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');

  const [formData, setFormData] = useState<Partial<Room>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<Room[]>('http://192.168.43.54:5000/api/rooms');
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
  }, []);

  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      const matchesType = typeFilter === '' || room.room_type === typeFilter;
      const matchesStatus = statusFilter === '' || room.room_status === statusFilter;
      const matchesMinPrice = minPrice === '' || room.price_per_night >= minPrice;
      const matchesMaxPrice = maxPrice === '' || room.price_per_night <= maxPrice;
      
      return matchesType && matchesStatus && matchesMinPrice && matchesMaxPrice;
    });
  }, [rooms, typeFilter, statusFilter, minPrice, maxPrice]);

  const clearFilters = () => {
    setTypeFilter('');
    setStatusFilter('');
    setMinPrice('');
    setMaxPrice('');
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.room_number) newErrors.room_number = 'Required';
    if (!formData.price_per_night || Number(formData.price_per_night) <= 0) newErrors.price_per_night = 'Invalid Price';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload = {
      Room_Number: formData.room_number,
      Room_Type: formData.room_type,
      Floor_Number: formData.floor_number,
      Price_Per_Night: formData.price_per_night,
      Room_Status: formData.room_status
    };

    try {
      if (editingRoom && editingRoom.room_id) {
        await api.put(`http://192.168.43.54:5000/api/rooms/${editingRoom.room_id}`, payload);
        showNotification('Room updated', 'success');
      } else {
        await api.post('http://192.168.43.54:5000/api/rooms', payload);
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
      await api.delete(`http://192.168.43.54:5000/api/rooms/${deletingRoom.room_id}`);
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
            {(typeFilter || statusFilter || minPrice !== '' || maxPrice !== '') && (
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
          Add Room
        </button>
      </div>

       {/* Advanced Filters */}
       {showFilters && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-6 animate-in fade-in slide-in-from-top-2">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Room Type</label>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] outline-none transition-all"
                    >
                        <option value="">All Types</option>
                        {Object.values(RoomType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] outline-none transition-all"
                    >
                        <option value="">All Statuses</option>
                        {Object.values(RoomStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-2">Min Price</label>
                     <input 
                        type="number"
                        placeholder="0"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value ? parseInt(e.target.value) : '')}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] outline-none transition-all"
                     />
                </div>
                <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-2">Max Price</label>
                     <input 
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value ? parseInt(e.target.value) : '')}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] outline-none transition-all"
                     />
                </div>
           </div>
        </div>
      )}

      <DataTable<Room>
        data={filteredRooms}
        isLoading={isLoading}
        columns={[
          { header: 'Room #', accessor: 'room_number', className: 'w-24 font-bold text-[#8B5CF6]' },
          { header: 'Type', accessor: 'room_type' },
          { header: 'Floor', accessor: 'floor_number' },
          { header: 'Price (PKR)', accessor: (row) => row.price_per_night.toLocaleString() },
          { 
            header: 'Status', 
            accessor: (row) => (
              <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${
                row.room_status === RoomStatus.AVAILABLE ? 'bg-[#ECFDF5] text-[#059669]' :
                row.room_status === RoomStatus.OCCUPIED ? 'bg-[#FFF1F2] text-[#E11D48]' :
                row.room_status === RoomStatus.RESERVED ? 'bg-[#FFFBEB] text-[#D97706]' :
                'bg-slate-100 text-slate-600'
              }`}>
                {row.room_status}
              </span>
            ) 
          }
        ]}
        onEdit={openModal}
        onDelete={setDeletingRoom}
        searchPlaceholder="Quick filter..."
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
            <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 font-medium">Cancel</button>
            <button onClick={handleSubmit} className="px-5 py-2.5 bg-[#8B5CF6] text-white rounded-xl hover:bg-[#7C3AED] font-medium shadow-md">
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