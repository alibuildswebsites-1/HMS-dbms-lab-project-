import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { api } from '../services/api';
import { Play, RotateCcw, Terminal, Clock, AlertTriangle, CheckCircle, Database } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

interface QueryResult {
  [key: string]: any;
}

export const SqlConsole: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<QueryResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [executionTime, setExecutionTime] = useState<number>(0);
  const [history, setHistory] = useState<string[]>([]);
  const { showNotification } = useNotification();

  const examples = [
    "SELECT * FROM Customers",
    "SELECT * FROM Room WHERE room_status = 'Available'",
    "SELECT customer_name, email FROM Customers WHERE nationality = 'Pakistani'",
    "SELECT * FROM Booking ORDER BY check_in_date DESC LIMIT 10",
    "SELECT COUNT(*) as total_bookings FROM Booking"
  ];

  const handleExecute = async () => {
    if (!query.trim()) {
      showNotification("Please enter a SQL query", "warning");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);
    const startTime = performance.now();

    try {
      // Corrected IP address to match the rest of the application
      const response = await api.post<any>('http://192.168.43.171:5000/api/execute-query', { query });
      
      const endTime = performance.now();
      setExecutionTime(Math.round(endTime - startTime));
      
      let rows: QueryResult[] = [];

      // Flexible response parsing: handle raw array or { data: [...] } or { success: true, data: [...] }
      if (Array.isArray(response)) {
        rows = response;
      } else if (response.data && Array.isArray(response.data)) {
        rows = response.data;
      } else if (response.results && Array.isArray(response.results)) {
        rows = response.results;
      } else if (response.rows && Array.isArray(response.rows)) {
        rows = response.rows;
      } else if (typeof response === 'object') {
        // If it returns a single object that isn't wrapped
        rows = [response];
      }

      setResults(rows);
      
      // Update history
      setHistory(prev => {
        const newHistory = [query, ...prev.filter(q => q !== query)];
        return newHistory.slice(0, 5);
      });

      showNotification(`Query executed successfully (${rows.length} rows)`, "success");

    } catch (err: any) {
      console.error(err);
      // The error message now comes from api.ts parsing the backend response
      setError(err.message || "An error occurred while executing the query");
      showNotification("Query execution failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults(null);
    setError(null);
    setExecutionTime(0);
  };

  return (
    <Layout title="SQL Console">
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] p-6 rounded-3xl text-white shadow-lg shadow-violet-200 relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-10 -translate-y-10">
            <Database size={150} />
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Terminal size={24} className="text-[#FFFBEB]" />
              Query Executor
            </h2>
            <p className="text-white/90 mt-1 opacity-90">Execute raw SQL commands directly against the database.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main Editor Column */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Editor Container */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className="bg-slate-800 px-4 py-2 flex justify-between items-center border-b border-slate-700">
                <span className="text-xs font-mono text-[#F472B6] uppercase tracking-wider">SQL Editor</span>
                <div className="flex gap-2">
                   <button 
                    onClick={handleClear}
                    className="text-slate-400 hover:text-white transition-colors text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10"
                   >
                     <RotateCcw size={12} /> Clear
                   </button>
                </div>
              </div>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your SELECT query here... Example: SELECT * FROM Customers"
                className="w-full h-64 p-4 bg-[#1e293b] text-violet-300 font-mono text-sm focus:outline-none resize-y"
                spellCheck={false}
              />
              <div className="bg-slate-50 p-3 border-t border-slate-200 flex justify-end gap-3">
                 <button
                  onClick={handleExecute}
                  disabled={isLoading}
                  className="bg-[#8B5CF6] text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-[#7C3AED] transition-all shadow-lg shadow-violet-200 disabled:opacity-70 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                 >
                   {isLoading ? (
                     <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                   ) : (
                     <Play size={18} fill="currentColor" />
                   )}
                   Execute Query
                 </button>
              </div>
            </div>

            {/* Results / Error Area */}
            {(results || error) && (
              <div className="animate-in fade-in zoom-in duration-300">
                {error ? (
                  <div className="bg-[#FFF1F2] border border-[#FECDD3] rounded-3xl p-6 text-[#E11D48] flex items-start gap-4 shadow-sm">
                    <AlertTriangle className="shrink-0 mt-1" size={24} />
                    <div className="font-mono text-sm whitespace-pre-wrap break-all w-full">
                      <p className="font-bold mb-1">Execution Error:</p>
                      {error}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-[#F5F3FF] px-6 py-3 border-b border-violet-100 flex justify-between items-center text-[#6D28D9]">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={18} className="text-[#8B5CF6]" />
                        <span className="font-semibold text-sm">Query Executed Successfully</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-mono">
                        <span>Rows: <strong>{results?.length}</strong></span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {executionTime}ms</span>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto custom-scrollbar">
                      {results && results.length > 0 ? (
                        <table className="w-full text-left text-sm whitespace-nowrap">
                          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                            <tr>
                              {Object.keys(results[0]).map((key) => (
                                <th key={key} className="px-6 py-3 text-xs uppercase tracking-wider">{key}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {results.map((row, i) => (
                              <tr key={i} className="hover:bg-[#F5F3FF] transition-colors">
                                {Object.values(row).map((val: any, j) => (
                                  <td key={j} className="px-6 py-3 font-mono text-xs text-slate-700">
                                    {val === null ? <span className="text-slate-400 italic">null</span> : (typeof val === 'object' ? JSON.stringify(val) : String(val))}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="p-8 text-center text-slate-400 italic">
                          Query returned no data (0 rows).
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Column: Examples & History */}
          <div className="space-y-6">
            
            {/* Quick Examples */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5">
              <h3 className="text-slate-700 font-bold text-sm uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Example Queries</h3>
              <div className="flex flex-col gap-2">
                {examples.map((ex, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuery(ex)}
                    className="text-left text-xs p-3 rounded-xl bg-slate-50 hover:bg-[#F5F3FF] hover:text-[#7C3AED] hover:border-[#8B5CF6]/30 border border-transparent transition-all duration-200 group truncate"
                    title={ex}
                  >
                    <span className="font-mono text-slate-500 group-hover:text-[#7C3AED] block truncate">
                      {ex}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5 animate-in fade-in slide-in-from-right-4">
                <h3 className="text-slate-700 font-bold text-sm uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex justify-between items-center">
                  Recent History
                  <button onClick={() => setHistory([])} className="text-[10px] text-slate-400 hover:text-red-500">Clear</button>
                </h3>
                <div className="flex flex-col gap-2">
                  {history.map((h, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQuery(h)}
                      className="text-left text-xs p-3 rounded-xl border border-slate-100 hover:border-[#F472B6] hover:bg-[#FDF2F8] transition-all duration-200 truncate font-mono text-slate-600"
                      title={h}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </Layout>
  );
};