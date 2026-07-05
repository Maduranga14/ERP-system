import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage             from './pages/LoginPage';
import AdminDashboard        from './pages/AdminDashboard';
import ManagerDashboard      from './pages/ManagerDashboard';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import HousekeeperDashboard  from './pages/HousekeeperDashboard';

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/"              element={<LoginPage />} />
      <Route path="/admin/*"       element={<AdminDashboard />} />
      <Route path="/manager/*"     element={<ManagerDashboard />} />
      <Route path="/receptionist/*"element={<ReceptionistDashboard />} />
      <Route path="/housekeeper/*" element={<HousekeeperDashboard />} />
      <Route path="*"              element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
