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

// Customer module
import CustomerList   from './pages/customers/CustomerList';
import CustomerDetail from './pages/customers/CustomerDetail';
import AddCustomer    from './pages/customers/AddCustomer';
import EditCustomer   from './pages/customers/EditCustomer';

// Housekeeping module
import HousekeepingList from './pages/housekeeping/HousekeepingList';
import TaskDetail       from './pages/housekeeping/TaskDetail';
import AssignTask       from './pages/housekeeping/AssignTask';

// Billing module
import BillingList      from './pages/billing/BillingList';
import InvoiceDetail    from './pages/billing/InvoiceDetail';
import GenerateInvoice  from './pages/billing/GenerateInvoice';

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
      <Route path="/admin/customers"                element={<CustomerList />} />
      <Route path="/admin/customers/new"            element={<AddCustomer />} />
      <Route path="/admin/customers/:id"            element={<CustomerDetail />} />
      <Route path="/admin/customers/:id/edit"       element={<EditCustomer />} />
      <Route path="/admin/housekeeping"             element={<HousekeepingList />} />
      <Route path="/admin/housekeeping/assign"      element={<AssignTask />} />
      <Route path="/admin/housekeeping/:id"         element={<TaskDetail />} />
      <Route path="/admin/billing"                  element={<BillingList />} />
      <Route path="/admin/billing/generate"         element={<GenerateInvoice />} />
      <Route path="/admin/billing/:id"              element={<InvoiceDetail />} />

      {/* ── Manager (view rooms + history, no add/edit/delete) ── */}
      <Route path="/manager"                        element={<ManagerDashboard />} />
      <Route path="/manager/reservations"           element={<ReservationList />} />
      <Route path="/manager/reservations/:id"       element={<ReservationDetail />} />
      <Route path="/manager/rooms"                  element={<RoomList />} />
      <Route path="/manager/rooms/:id"              element={<RoomDetail />} />
      <Route path="/manager/customers"              element={<CustomerList />} />
      <Route path="/manager/customers/:id"          element={<CustomerDetail />} />
      <Route path="/manager/housekeeping"           element={<HousekeepingList />} />
      <Route path="/manager/housekeeping/assign"    element={<AssignTask />} />
      <Route path="/manager/housekeeping/:id"       element={<TaskDetail />} />
      <Route path="/manager/billing"                element={<BillingList />} />
      <Route path="/manager/billing/:id"            element={<InvoiceDetail />} />

      {/* ── Receptionist (view + status-only edit, no add/delete) ── */}
      <Route path="/receptionist"                   element={<ReceptionistDashboard />} />
      <Route path="/receptionist/reservations"      element={<ReservationList />} />
      <Route path="/receptionist/reservations/new"  element={<NewReservation />} />
      <Route path="/receptionist/reservations/:id"  element={<ReservationDetail />} />
      <Route path="/receptionist/rooms"             element={<RoomList />} />
      <Route path="/receptionist/rooms/:id"         element={<RoomDetail />} />
      <Route path="/receptionist/customers"         element={<CustomerList />} />
      <Route path="/receptionist/customers/new"     element={<AddCustomer />} />
      <Route path="/receptionist/customers/:id"     element={<CustomerDetail />} />
      <Route path="/receptionist/customers/:id/edit" element={<EditCustomer />} />
      <Route path="/receptionist/housekeeping"      element={<HousekeepingList />} />
      <Route path="/receptionist/housekeeping/assign" element={<AssignTask />} />
      <Route path="/receptionist/housekeeping/:id"  element={<TaskDetail />} />
      <Route path="/receptionist/billing"           element={<BillingList />} />
      <Route path="/receptionist/billing/generate"  element={<GenerateInvoice />} />
      <Route path="/receptionist/billing/:id"       element={<InvoiceDetail />} />

      {/* ── Housekeeper (view rooms + cleaning status only) ── */}
      <Route path="/housekeeper"                    element={<HousekeeperDashboard />} />
      <Route path="/housekeeper/rooms"              element={<RoomList />} />
      <Route path="/housekeeper/rooms/:id"          element={<RoomDetail />} />
      <Route path="/housekeeper/housekeeping"       element={<HousekeepingList />} />
      <Route path="/housekeeper/housekeeping/:id"   element={<TaskDetail />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
