import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Users, BedDouble, Key, CalendarCheck, Briefcase, DollarSign } from 'lucide-react';
import { Stats } from '../types';
import { api } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: any, color: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center transition-transform hover:-translate-y-1 hover:shadow-md">
    <div className={`p-4 rounded-full mr-4 ${color} bg-opacity-10 text-${color.replace('bg-', '')}`}>
      <Icon className={`w-8 h-8 ${color.replace('bg-', 'text-')}`} />
    </div>
    <div>
      <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalCustomers: 0,
    totalRooms: 0,
    availableRooms: 0,
    totalBookings: 0,
    totalEmployees: 0,
    totalRevenue: 0
  });

  const chartData = [
    { name: 'Mon', revenue: 0 },
    { name: 'Tue', revenue: 0 },
    { name: 'Wed', revenue: 0 },
    { name: 'Thu', revenue: 0 },
    { name: 'Fri', revenue: 0 },
    { name: 'Sat', revenue: 0 },
    { name: 'Sun', revenue: 0 },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get<Stats>('http://192.168.100.14:5000/api/stats');
        setStats(data);
      } catch (e) {
        console.error("Failed to fetch dashboard stats", e);
      }
    };
    fetchStats();
  }, []);

  return (
    <Layout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Customers" value={stats.totalCustomers} icon={Users} color="bg-blue-600" />
        <StatCard title="Total Rooms" value={stats.totalRooms} icon={BedDouble} color="bg-indigo-600" />
        <StatCard title="Available Rooms" value={stats.availableRooms} icon={Key} color="bg-green-600" />
        <StatCard title="Total Bookings" value={stats.totalBookings} icon={CalendarCheck} color="bg-orange-500" />
        <StatCard title="Employees" value={stats.totalEmployees} icon={Briefcase} color="bg-purple-600" />
        <StatCard title="Total Revenue" value={`PKR ${Number(stats.totalRevenue).toLocaleString()}`} icon={DollarSign} color="bg-[#FDB913]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96 flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Weekly Revenue</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip cursor={{fill: '#f9fafb'}} />
                <Bar dataKey="revenue" fill="#01411C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96 flex flex-col justify-center items-center text-center">
            <h3 className="text-lg font-bold text-gray-800 mb-2">System Status</h3>
            <p className="text-gray-500">All systems operational.</p>
            <div className="mt-6 flex gap-4">
                 <div className="p-4 bg-green-50 rounded-lg">
                    <span className="block text-2xl font-bold text-green-700">100%</span>
                    <span className="text-xs text-green-600">Uptime</span>
                 </div>
                 <div className="p-4 bg-yellow-50 rounded-lg">
                    <span className="block text-2xl font-bold text-yellow-700">0ms</span>
                    <span className="text-xs text-yellow-600">Latency</span>
                 </div>
            </div>
        </div>
      </div>
    </Layout>
  );
};