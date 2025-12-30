import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react';

// --- MODAL ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C4A3B]/60 backdrop-blur-sm transition-all duration-300">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} overflow-hidden animate-in fade-in zoom-in duration-300 border border-gray-100 transform transition-all`}>
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-[#4A7C59] text-white">
          <h3 className="text-lg font-bold tracking-wide">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-all duration-200 hover:rotate-90">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[85vh]">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- DATA TABLE ---
interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  isLoading?: boolean;
  searchPlaceholder?: string;
  renderActions?: (item: T) => React.ReactNode;
}

export function DataTable<T>({ 
  data, 
  columns, 
  onEdit, 
  onDelete, 
  onView,
  isLoading,
  searchPlaceholder = "Search...",
  renderActions
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter data
  const filteredData = data.filter((item) =>
    Object.values(item as any).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-[#4A7C59]" size={48} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md">
      {/* Header / Search */}
      <div className="p-5 border-b border-gray-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4A7C59] transition-colors duration-300" size={18} />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4A7C59]/20 focus:border-[#4A7C59] outline-none text-sm transition-all duration-300 text-gray-700 placeholder-gray-400 hover:bg-white"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-[#4A7C59] text-white uppercase text-xs font-bold tracking-wider">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`px-6 py-4 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
              {(onEdit || onDelete || onView || renderActions) && <th className="px-6 py-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#F3F6F4] transition-colors duration-200 group">
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="px-6 py-4 whitespace-nowrap font-medium text-gray-700 group-hover:text-[#2C4A3B] transition-colors">
                      {typeof col.accessor === 'function'
                        ? col.accessor(row)
                        : (row[col.accessor] as React.ReactNode)}
                    </td>
                  ))}
                  {(onEdit || onDelete || onView || renderActions) && (
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity duration-200">
                        {renderActions && renderActions(row)}
                        {onView && (
                          <button
                            onClick={() => onView(row)}
                            className="text-[#3D5A80] hover:text-[#293241] font-semibold px-3 py-1.5 hover:bg-[#E0FBFC] rounded-lg transition-all duration-200 text-xs hover:scale-105"
                          >
                            View
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(row)}
                            className="text-[#4A7C59] hover:text-[#2C4A3B] font-semibold px-3 py-1.5 hover:bg-[#E6F4EA] rounded-lg transition-all duration-200 text-xs hover:scale-105"
                          >
                            Edit
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(row)}
                            className="text-[#E07A5F] hover:text-[#C45F44] font-semibold px-3 py-1.5 hover:bg-[#FFF5F2] rounded-lg transition-all duration-200 text-xs hover:scale-105"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-16 text-center text-gray-400 italic">
                  No data found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <span className="text-sm text-gray-500 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:border-[#4A7C59] hover:text-[#4A7C59] transition-all duration-200 shadow-sm hover:scale-105 active:scale-95"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:border-[#4A7C59] hover:text-[#4A7C59] transition-all duration-200 shadow-sm hover:scale-105 active:scale-95"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- CONFIRM DIALOG ---
interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isProcessing
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} size="md">
      <div className="flex flex-col gap-4">
        <p className="text-gray-600 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-all duration-200 hover:scale-105"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="px-5 py-2.5 bg-[#E07A5F] text-white rounded-xl font-medium hover:bg-[#C45F44] disabled:opacity-70 flex items-center shadow-lg shadow-[#E07A5F]/20 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            {isProcessing && <Loader2 className="animate-spin mr-2" size={16} />}
            Yes, Delete
          </button>
        </div>
      </div>
    </Modal>
  );
};

// --- FORM INPUTS ---
export const FormInput = ({ label, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string, error?: string }) => (
  <div className="mb-5 group">
    <label className="block text-sm font-semibold text-[#2C4A3B] mb-2 group-hover:text-[#4A7C59] transition-colors duration-200">{label}</label>
    <input
      {...props}
      className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-[#4A7C59]/20 focus:border-[#4A7C59] outline-none transition-all duration-200 text-gray-800 hover:bg-white ${
        error ? 'border-[#E07A5F] focus:ring-[#E07A5F]/20' : 'border-gray-200'
      }`}
    />
    {error && <p className="mt-1.5 text-xs text-[#E07A5F] font-medium animate-pulse">{error}</p>}
  </div>
);

export const FormSelect = ({ label, error, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string, error?: string }) => (
  <div className="mb-5 group">
    <label className="block text-sm font-semibold text-[#2C4A3B] mb-2 group-hover:text-[#4A7C59] transition-colors duration-200">{label}</label>
    <select
      {...props}
      className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-[#4A7C59]/20 focus:border-[#4A7C59] outline-none transition-all duration-200 text-gray-800 hover:bg-white ${
        error ? 'border-[#E07A5F] focus:ring-[#E07A5F]/20' : 'border-gray-200'
      }`}
    >
      {children}
    </select>
    {error && <p className="mt-1.5 text-xs text-[#E07A5F] font-medium animate-pulse">{error}</p>}
  </div>
);