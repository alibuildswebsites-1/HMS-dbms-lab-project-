import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { api } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { GitMerge, ArrowRight, Play, Database, Info, Download } from 'lucide-react';

interface JoinResult {
  [key: string]: any;
}

interface RelationConfig {
  table1: string;
  table2: string;
  on: string;
  description: string;
}

// Predefined valid relationships in the schema
const RELATIONSHIPS: RelationConfig[] = [
  { table1: 'Customers', table2: 'Booking', on: 'Customers.Customer_ID = Booking.Customer_ID', description: 'See which customers have bookings' },
  { table1: 'Room', table2: 'Booking', on: 'Room.Room_ID = Booking.Room_ID', description: 'See which rooms are booked' },
  { table1: 'Booking', table2: 'Payment', on: 'Booking.Booking_ID = Payment.Booking_ID', description: 'Track payments for specific bookings' },
  { table1: 'Department', table2: 'Employee', on: 'Department.Department_ID = Employee.Department_ID', description: 'List employees by department' }
];

const JOIN_TYPES = [
  { value: 'INNER JOIN', label: 'Inner Join', desc: 'Returns records that have matching values in both tables.' },
  { value: 'LEFT JOIN', label: 'Left Join', desc: 'Returns all records from the left table, and the matched records from the right table.' },
  { value: 'RIGHT JOIN', label: 'Right Join', desc: 'Returns all records from the right table, and the matched records from the left table.' },
  { value: 'FULL OUTER JOIN', label: 'Full Outer Join', desc: 'Returns all records when there is a match in either left or right table.' }
];

export const Joins: React.FC = () => {
  const [selectedRelation, setSelectedRelation] = useState<number>(0);
  const [joinType, setJoinType] = useState<string>('INNER JOIN');
  const [generatedQuery, setGeneratedQuery] = useState('');
  const [results, setResults] = useState<JoinResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  // Update query when selections change
  useEffect(() => {
    const rel = RELATIONSHIPS[selectedRelation];
    const query = `SELECT * FROM ${rel.table1} ${joinType} ${rel.table2} ON ${rel.on}`;
    setGeneratedQuery(query);
  }, [selectedRelation, joinType]);

  const handleExecute = async () => {
    setIsLoading(true);
    setError(null);
    setResults([]);
    
    try {
      // Re-using the SQL endpoint since it executes raw queries
      const response = await api.post<any>('http://192.168.40.190:5000/api/execute-query', { query: generatedQuery });
      
      if (response.success && response.data) {
        setResults(response.data);
        showNotification(`Query returned ${response.data.length} rows`, 'success');
      } else {
        setError(response.message || response.error || 'No data returned');
        showNotification('Query execution failed', 'error');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to execute join');
      showNotification('Failed to execute join', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout title="Join Explorer">
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-violet-600 p-6 rounded-3xl text-white shadow-lg shadow-blue-200 relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-10 -translate-y-10">
            <GitMerge size={150} />
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <GitMerge size={24} className="text-blue-100" />
              Advanced Data Joining
            </h2>
            <p className="text-white/90 mt-1 opacity-90 max-w-2xl">
              Visualize relationships between tables. Select a relationship and a join type to see how data is merged from different entities in the database.
            </p>
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            
            {/* 1. Relationship Selector */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                <Database size={16} className="text-[#8B5CF6]" /> 1. Select Tables
              </label>
              <div className="relative">
                <select
                  value={selectedRelation}
                  onChange={(e) => setSelectedRelation(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] outline-none appearance-none font-medium text-slate-700"
                >
                  {RELATIONSHIPS.map((rel, idx) => (
                    <option key={idx} value={idx}>
                      {rel.table1} ↔ {rel.table2}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
              </div>
              <p className="text-xs text-slate-500 pl-1">{RELATIONSHIPS[selectedRelation].description}</p>
            </div>

            {/* 2. Join Type Selector */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                <GitMerge size={16} className="text-[#8B5CF6]" /> 2. Join Type
              </label>
              <div className="relative">
                <select
                  value={joinType}
                  onChange={(e) => setJoinType(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] outline-none appearance-none font-medium text-slate-700"
                >
                  {JOIN_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                 <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
              </div>
              <p className="text-xs text-slate-500 pl-1">
                {JOIN_TYPES.find(t => t.value === joinType)?.desc}
              </p>
            </div>

            {/* 3. Action */}
            <div>
              <button
                onClick={handleExecute}
                disabled={isLoading}
                className="w-full py-3 bg-[#8B5CF6] text-white rounded-xl font-bold text-lg hover:bg-[#7C3AED] transition-all shadow-lg shadow-violet-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? <span className="animate-spin text-xl">◌</span> : <Play size={20} fill="currentColor" />}
                Run Join
              </button>
            </div>
          </div>

          {/* SQL Preview */}
          <div className="mt-8 bg-slate-800 rounded-xl p-4 border border-slate-700 relative group">
            <span className="absolute -top-3 left-4 bg-slate-800 text-slate-300 text-xs px-2 font-mono">Generated SQL</span>
            <code className="text-green-400 font-mono text-sm break-all">
              {generatedQuery}
            </code>
          </div>
        </div>

        {/* Results Area */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden min-h-[300px] flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
              <Download size={18} className="text-slate-400" />
              Result Set
            </h3>
            {results.length > 0 && (
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-lg">
                {results.length} Rows Found
              </span>
            )}
          </div>

          <div className="flex-1 overflow-x-auto custom-scrollbar p-0">
            {error ? (
              <div className="p-10 flex flex-col items-center justify-center text-center text-red-500">
                <Info size={48} className="mb-4 opacity-50" />
                <p className="font-bold">Error Executing Join</p>
                <p className="text-sm mt-2 max-w-lg">{error}</p>
                {joinType === 'FULL OUTER JOIN' && (
                    <p className="text-xs text-slate-400 mt-4 bg-slate-100 p-2 rounded">
                        Note: MySQL does not support FULL OUTER JOIN natively. If you are using MySQL, consider using UNION of LEFT and RIGHT joins manually in SQL Console.
                    </p>
                )}
              </div>
            ) : results.length > 0 ? (
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    {Object.keys(results[0]).map((key) => (
                      <th key={key} className="px-6 py-3 text-xs uppercase tracking-wider bg-slate-100/50 sticky top-0 backdrop-blur-sm">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.map((row, i) => (
                    <tr key={i} className="hover:bg-blue-50/50 transition-colors">
                      {Object.values(row).map((val: any, j) => (
                        <td key={j} className="px-6 py-3 font-mono text-xs text-slate-700 border-r border-slate-50 last:border-0">
                          {val === null ? <span className="text-slate-300 italic">NULL</span> : (typeof val === 'object' ? JSON.stringify(val) : String(val))}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Database size={48} className="mb-4 opacity-20" />
                <p>No data to display. Run a join query to see results.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};