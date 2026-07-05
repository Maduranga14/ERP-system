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

// Room module
import RoomList   from './pages/rooms/RoomList';
import RoomDetail from './pages/rooms/RoomDetail';
import AddRoom    from './pages/rooms/AddRoom';

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
      <Route path="/admin/rooms"                    element={<RoomList />} />
      <Route path="/admin/rooms/new"                element={<AddRoom />} />
      <Route path="/admin/rooms/:id"                element={<RoomDetail />} />

      {/* ── Manager (view rooms + history, no add/edit/delete) ── */}
      <Route path="/manager"                        element={<ManagerDashboard />} />
      <Route path="/manager/reservations"           element={<ReservationList />} />
      <Route path="/manager/reservations/:id"       element={<ReservationDetail />} />
      <Route path="/manager/rooms"                  element={<RoomList />} />
      <Route path="/manager/rooms/:id"              element={<RoomDetail />} />

      {/* ── Receptionist (view + status-only edit, no add/delete) ── */}
      <Route path="/receptionist"                   element={<ReceptionistDashboard />} />
      <Route path="/receptionist/reservations"      element={<ReservationList />} />
      <Route path="/receptionist/reservations/new"  element={<NewReservation />} />
      <Route path="/receptionist/reservations/:id"  element={<ReservationDetail />} />
      <Route path="/receptionist/rooms"             element={<RoomList />} />
      <Route path="/receptionist/rooms/:id"         element={<RoomDetail />} />

      {/* ── Housekeeper (view rooms + cleaning status only) ── */}
      <Route path="/housekeeper"                    element={<HousekeeperDashboard />} />
      <Route path="/housekeeper/rooms"              element={<RoomList />} />
      <Route path="/housekeeper/rooms/:id"          element={<RoomDetail />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
