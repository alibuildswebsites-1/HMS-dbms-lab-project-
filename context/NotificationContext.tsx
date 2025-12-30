import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  showNotification: (message: string, type: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within a NotificationProvider');
  return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((message: string, type: NotificationType) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`flex items-center w-80 p-4 rounded-xl shadow-xl transform transition-all duration-300 border ${
              n.type === 'success' ? 'bg-[#E6F4EA] border-[#4A7C59] text-[#1E4620]' :
              n.type === 'error' ? 'bg-[#FCE8E6] border-[#E07A5F] text-[#8C1D18]' :
              n.type === 'warning' ? 'bg-[#FFF8E1] border-[#F4D35E] text-[#7A4F01]' :
              'bg-[#E0FBFC] border-[#3D5A80] text-[#1D3557]'
            }`}
          >
            <div className="mr-3">
              {n.type === 'success' && <CheckCircle size={22} className="text-[#4A7C59]" />}
              {n.type === 'error' && <AlertCircle size={22} className="text-[#E07A5F]" />}
              {n.type === 'warning' && <AlertTriangle size={22} className="text-[#F4D35E]" />}
              {n.type === 'info' && <Info size={22} className="text-[#3D5A80]" />}
            </div>
            <div className="flex-1 text-sm font-semibold">{n.message}</div>
            <button onClick={() => removeNotification(n.id)} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};