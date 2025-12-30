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
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`flex items-center w-80 p-4 rounded-lg shadow-lg text-white transform transition-all duration-300 ${
              n.type === 'success' ? 'bg-[#01411C]' :
              n.type === 'error' ? 'bg-red-600' :
              n.type === 'warning' ? 'bg-[#FDB913] text-black' :
              'bg-blue-600'
            }`}
          >
            <div className="mr-3">
              {n.type === 'success' && <CheckCircle size={20} />}
              {n.type === 'error' && <AlertCircle size={20} />}
              {n.type === 'warning' && <AlertTriangle size={20} />}
              {n.type === 'info' && <Info size={20} />}
            </div>
            <div className="flex-1 text-sm font-medium">{n.message}</div>
            <button onClick={() => removeNotification(n.id)} className="ml-2 hover:opacity-75">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
