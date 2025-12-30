import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Users, BedDouble, Key, CalendarCheck, Briefcase, DollarSign } from 'lucide-react';
import { Stats } from '../types';
import { api } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StatCard = ({ title, value, icon: Icon, colorClass, iconColorClass }: { title: string, value: string | number, icon: any, colorClass: string, iconColorClass: string }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group cursor-default">
    <div className={`p-4 rounded-2xl mr-5 ${colorClass} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
      <Icon className={`w-7 h-7 ${iconColorClass}`} />
    </div>
    <div>
      <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1 group-hover:text-[#4A7C59] transition-colors">{title}</p>
      <h3 className="text-2xl font-bold text-[#2C4A3B]">{value}</h3>
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
    { name: 'Mon', revenue: 15000 },
    { name: 'Tue', revenue: 22000 },
    { name: 'Wed', revenue: 18000 },
    { name: 'Thu', revenue: 24000 },
    { name: 'Fri', revenue: 35000 },
    { name: 'Sat', revenue: 42000 },
    { name: 'Sun', revenue: 38000 },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get<Stats>('http://192.168.43.171:5000/api/stats');
        setStats(data);
      } catch (e) {
        console.error("Failed to fetch dashboard stats", e);
        // Fallback for demo if API fails
        setStats({
             totalCustomers: 124,
             totalRooms: 45,
             availableRooms: 12,
             totalBookings: 89,
             totalEmployees: 24,
             totalRevenue: 1250000
        });
      }
    };
    fetchStats();
  }, []);

  return (
    <Layout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Total Customers" 
          value={stats.totalCustomers} 
          icon={Users} 
          colorClass="bg-[#E0FBFC]" 
          iconColorClass="text-[#3D5A80]" 
        />
        <StatCard 
          title="Total Rooms" 
          value={stats.totalRooms} 
          icon={BedDouble} 
          colorClass="bg-[#E6F4EA]" 
          iconColorClass="text-[#4A7C59]" 
        />
        <StatCard 
          title="Available Rooms" 
          value={stats.availableRooms} 
          icon={Key} 
          colorClass="bg-[#FFF8E1]" 
          iconColorClass="text-[#F4D35E]" 
        />
        <StatCard 
          title="Total Bookings" 
          value={stats.totalBookings} 
          icon={CalendarCheck} 
          colorClass="bg-[#FCE8E6]" 
          iconColorClass="text-[#E07A5F]" 
        />
        <StatCard 
          title="Employees" 
          value={stats.totalEmployees} 
          icon={Briefcase} 
          colorClass="bg-[#F0E6EF]" 
          iconColorClass="text-[#9D8189]" 
        />
        <StatCard 
          title="Total Revenue" 
          value={`PKR ${Number(stats.totalRevenue).toLocaleString()}`} 
          icon={DollarSign} 
          colorClass="bg-[#2C4A3B]/10" 
          iconColorClass="text-[#2C4A3B]" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-96 flex flex-col transition-all duration-300 hover:shadow-lg">
          <h3 className="text-lg font-bold text-[#2C4A3B] mb-6">Weekly Revenue Analytics</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="name" tick={{fill: '#6b7280'}} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{fill: '#6b7280'}} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip 
                    cursor={{fill: '#f9fafb'}} 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="revenue" fill="#4A7C59" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-96 flex flex-col justify-center items-center text-center transition-all duration-300 hover:shadow-lg">
            <h3 className="text-lg font-bold text-[#2C4A3B] mb-2">System Health</h3>
            <p className="text-gray-400 text-sm mb-8">Real-time operational status</p>
            <div className="flex flex-col gap-4 w-full px-8">
                 <div className="p-5 bg-[#E6F4EA] rounded-2xl flex items-center justify-between group hover:scale-105 transition-transform duration-300 cursor-default">
                    <span className="text-sm font-bold text-[#4A7C59] uppercase tracking-wide">Uptime</span>
                    <span className="text-2xl font-bold text-[#1E4620]">99.9%</span>
                 </div>
                 <div className="p-5 bg-[#FFF8E1] rounded-2xl flex items-center justify-between group hover:scale-105 transition-transform duration-300 cursor-default">
                    <span className="text-sm font-bold text-[#7A4F01] uppercase tracking-wide">Latency</span>
                    <span className="text-2xl font-bold text-[#7A4F01]">24ms</span>
                 </div>
            </div>
        </div>
      </div>
    </Layout>
  );
};