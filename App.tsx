import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { Rooms } from './pages/Rooms';
import { Bookings } from './pages/Bookings';
import { Payments } from './pages/Payments';
import { Employees } from './pages/Employees';

function App() {
  return (
    <NotificationProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;
