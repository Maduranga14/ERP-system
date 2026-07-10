import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';


import LoginPage             from './pages/LoginPage';


import AdminDashboard        from './pages/AdminDashboard';
import ManagerDashboard      from './pages/ManagerDashboard';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import HousekeeperDashboard  from './pages/HousekeeperDashboard';


import ReservationList   from './pages/reservations/ReservationList';
import NewReservation    from './pages/reservations/NewReservation';
import ReservationDetail from './pages/reservations/ReservationDetail';

import RoomList   from './pages/rooms/RoomList';
import RoomDetail from './pages/rooms/RoomDetail';
import AddRoom    from './pages/rooms/AddRoom';


import CustomerList   from './pages/customers/CustomerList';
import CustomerDetail from './pages/customers/CustomerDetail';
import AddCustomer    from './pages/customers/AddCustomer';
import EditCustomer   from './pages/customers/EditCustomer';


import HousekeepingList from './pages/housekeeping/HousekeepingList';
import TaskDetail       from './pages/housekeeping/TaskDetail';
import AssignTask       from './pages/housekeeping/AssignTask';


import BillingList      from './pages/billing/BillingList';
import InvoiceDetail    from './pages/billing/InvoiceDetail';
import GenerateInvoice  from './pages/billing/GenerateInvoice';
import PrintInvoice     from './pages/billing/PrintInvoice';


import EmployeeList   from './pages/employees/EmployeeList';
import EmployeeDetail from './pages/employees/EmployeeDetail';
import AddEmployee    from './pages/employees/AddEmployee';
import EditEmployee   from './pages/employees/EditEmployee';


import CheckInPage  from './pages/checkin/CheckInPage';
import CheckOutPage from './pages/checkout/CheckOutPage';


import MaintenancePage    from './pages/maintenance/MaintenancePage';
import CleaningHistoryPage from './pages/cleaning/CleaningHistoryPage';

const App = () => (
  <BrowserRouter>
    <Routes>
      
      <Route path="/" element={<LoginPage />} />

      
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
      <Route path="/admin/billing/:id/print"        element={<PrintInvoice />} />
      <Route path="/admin/employees"                element={<EmployeeList />} />
      <Route path="/admin/employees/new"            element={<AddEmployee />} />
      <Route path="/admin/employees/:id"            element={<EmployeeDetail />} />
      <Route path="/admin/employees/:id/edit"       element={<EditEmployee />} />
      <Route path="/admin/check-in"                 element={<CheckInPage />} />
      <Route path="/admin/check-out"                element={<CheckOutPage />} />
      <Route path="/admin/maintenance"              element={<MaintenancePage />} />
      <Route path="/admin/cleaning-history"         element={<CleaningHistoryPage />} />

      
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
      <Route path="/manager/employees"              element={<EmployeeList />} />
      <Route path="/manager/employees/:id"          element={<EmployeeDetail />} />
      <Route path="/manager/employees/:id/edit"     element={<EditEmployee />} />
      <Route path="/manager/maintenance"            element={<MaintenancePage />} />
      <Route path="/manager/cleaning-history"       element={<CleaningHistoryPage />} />
      <Route path="/manager/billing"                element={<BillingList />} />
      <Route path="/manager/billing/:id"            element={<InvoiceDetail />} />
      <Route path="/manager/billing/:id/print"      element={<PrintInvoice />} />

      
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
      <Route path="/receptionist/billing/:id/print" element={<PrintInvoice />} />
      <Route path="/receptionist/check-in"          element={<CheckInPage />} />
      <Route path="/receptionist/check-out"         element={<CheckOutPage />} />

      
      <Route path="/housekeeper"                    element={<HousekeeperDashboard />} />
      <Route path="/housekeeper/rooms"              element={<RoomList />} />
      <Route path="/housekeeper/rooms/:id"          element={<RoomDetail />} />
      <Route path="/housekeeper/housekeeping"       element={<HousekeepingList />} />
      <Route path="/housekeeper/housekeeping/:id"   element={<TaskDetail />} />
      <Route path="/housekeeper/maintenance"        element={<MaintenancePage />} />
      <Route path="/housekeeper/history"            element={<CleaningHistoryPage />} />

    
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
