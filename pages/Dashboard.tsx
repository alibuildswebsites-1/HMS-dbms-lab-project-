import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Users, BedDouble, Key, CalendarCheck, Briefcase, DollarSign } from 'lucide-react';
import { Stats } from '../types';
import { api } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StatCard = ({ title, value, icon: Icon, colorClass, iconColorClass }: { title: string, value: string | number, icon: any, colorClass: string, iconColorClass: string }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group cursor-default">
    <div className={`p-4 rounded-2xl mr-5 ${colorClass} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
      <Icon className={`w-7 h-7 ${iconColorClass}`} />
    </div>
    <div>
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 group-hover:text-[#8B5CF6] transition-colors">{title}</p>
      <h3 className="text-2xl font-bold text-slate-700">{value}</h3>
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
        const data = await api.get<Stats>('http://192.168.43.54:5000/api/stats');
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
          colorClass="bg-[#EFF6FF]" 
          iconColorClass="text-[#60A5FA]" 
        />
        <StatCard 
          title="Total Rooms" 
          value={stats.totalRooms} 
          icon={BedDouble} 
          colorClass="bg-[#F5F3FF]" 
          iconColorClass="text-[#A78BFA]" 
        />
        <StatCard 
          title="Available Rooms" 
          value={stats.availableRooms} 
          icon={Key} 
          colorClass="bg-[#FFFBEB]" 
          iconColorClass="text-[#FBBF24]" 
        />
        <StatCard 
          title="Total Bookings" 
          value={stats.totalBookings} 
          icon={CalendarCheck} 
          colorClass="bg-[#FFF1F2]" 
          iconColorClass="text-[#FB7185]" 
        />
        <StatCard 
          title="Employees" 
          value={stats.totalEmployees} 
          icon={Briefcase} 
          colorClass="bg-[#FDF2F8]" 
          iconColorClass="text-[#F472B6]" 
        />
        <StatCard 
          title="Total Revenue" 
          value={`PKR ${Number(stats.totalRevenue).toLocaleString()}`} 
          icon={DollarSign} 
          colorClass="bg-[#ECFDF5]" 
          iconColorClass="text-[#34D399]" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-96 flex flex-col transition-all duration-300 hover:shadow-lg">
          <h3 className="text-lg font-bold text-slate-700 mb-6">Weekly Revenue Analytics</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip 
                    cursor={{fill: '#f8fafc'}} 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#fff'}}
                />
                <Bar dataKey="revenue" fill="#A78BFA" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-96 flex flex-col justify-center items-center text-center transition-all duration-300 hover:shadow-lg">
            <h3 className="text-lg font-bold text-slate-700 mb-2">System Health</h3>
            <p className="text-slate-400 text-sm mb-8">Real-time operational status</p>
            <div className="flex flex-col gap-4 w-full px-8">
                 <div className="p-5 bg-[#ECFDF5] rounded-2xl flex items-center justify-between group hover:scale-105 transition-transform duration-300 cursor-default border border-emerald-100">
                    <span className="text-sm font-bold text-[#34D399] uppercase tracking-wide">Uptime</span>
                    <span className="text-2xl font-bold text-[#059669]">99.9%</span>
                 </div>
                 <div className="p-5 bg-[#FFFBEB] rounded-2xl flex items-center justify-between group hover:scale-105 transition-transform duration-300 cursor-default border border-amber-100">
                    <span className="text-sm font-bold text-[#FBBF24] uppercase tracking-wide">Latency</span>
                    <span className="text-2xl font-bold text-[#D97706]">24ms</span>
                 </div>
            </div>
        </div>
      </div>
    </Layout>
  );
};