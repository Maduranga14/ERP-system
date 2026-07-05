import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Auth
import LoginPage             from './pages/LoginPage';

// Role dashboards
import AdminDashboard        from './pages/AdminDashboard';
import ManagerDashboard      from './pages/ManagerDashboard';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import HousekeeperDashboard  from './pages/HousekeeperDashboard';

// Reservation module
import ReservationList   from './pages/reservations/ReservationList';
import NewReservation    from './pages/reservations/NewReservation';
import ReservationDetail from './pages/reservations/ReservationDetail';

const App = () => (
  <BrowserRouter>
    <Routes>
      {/* Auth */}
      <Route path="/" element={<LoginPage />} />

      {/* ── Admin ── */}
      <Route path="/admin"                          element={<AdminDashboard />} />
      <Route path="/admin/reservations"             element={<ReservationList />} />
      <Route path="/admin/reservations/new"         element={<NewReservation />} />
      <Route path="/admin/reservations/:id"         element={<ReservationDetail />} />

      {/* ── Manager (view + export, no create/edit/cancel) ── */}
      <Route path="/manager"                        element={<ManagerDashboard />} />
      <Route path="/manager/reservations"           element={<ReservationList />} />
      <Route path="/manager/reservations/:id"       element={<ReservationDetail />} />

      {/* ── Receptionist ── */}
      <Route path="/receptionist"                   element={<ReceptionistDashboard />} />
      <Route path="/receptionist/reservations"      element={<ReservationList />} />
      <Route path="/receptionist/reservations/new"  element={<NewReservation />} />
      <Route path="/receptionist/reservations/:id"  element={<ReservationDetail />} />

      {/* ── Housekeeper (no reservation access) ── */}
      <Route path="/housekeeper"                    element={<HousekeeperDashboard />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
