
export const API_BASE = 'http://localhost:8080';


const authHeader = () => {
  const token = localStorage.getItem('jwtToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};


export const apiGet = async (path) => {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...authHeader() },
  });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
};


export const apiPost = async (path, body) => {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json();
};


export const apiPut = async (path, body) => {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PUT ${path} failed: ${res.status}`);
  return res.json();
};


export const apiDelete = async (path) => {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
  });
  if (!res.ok) throw new Error(`DELETE ${path} failed: ${res.status}`);
  return res.ok;
};




export const getRooms       = ()       => apiGet('/api/rooms');
export const getRoomById    = (id)     => apiGet(`/api/rooms/${id}`);
export const createRoom     = (room)   => apiPost('/api/rooms', room);
export const updateRoom     = (id, r)  => apiPut(`/api/rooms/${id}`, r);
export const deleteRoom     = (id)     => apiDelete(`/api/rooms/${id}`);


export const getCustomers    = ()      => apiGet('/api/customers');
export const getCustomerById = (id)    => apiGet(`/api/customers/${id}`);
export const createCustomer  = (c)     => apiPost('/api/customers', c);
export const updateCustomer  = (id, c) => apiPut(`/api/customers/${id}`, c);
export const deleteCustomer  = (id)    => apiDelete(`/api/customers/${id}`);


export const getReservations    = ()      => apiGet('/api/reservations');
export const getReservationById = (id)    => apiGet(`/api/reservations/${id}`);
export const createReservation  = (r)     => apiPost('/api/reservations', r);
export const updateReservation  = (id, r) => apiPut(`/api/reservations/${id}`, r);
export const checkIn            = (id)    => apiPost(`/api/reservations/${id}/check-in`, {});
export const checkOut           = (id)    => apiPost(`/api/reservations/${id}/check-out`, {});
export const deleteReservation  = (id)    => apiDelete(`/api/reservations/${id}`);


export const getHousekeepingTasks = ()       => apiGet('/api/housekeeping');
export const getHousekeepingById  = (id)     => apiGet(`/api/housekeeping/${id}`);
export const createHousekeepingTask = (t)    => apiPost('/api/housekeeping', t);
export const updateHousekeepingTask = (id,t) => apiPut(`/api/housekeeping/${id}`, t);
export const updateTaskStatus       = (id, status) => apiPut(`/api/housekeeping/${id}/status?status=${encodeURIComponent(status)}`, {});
export const deleteHousekeepingTask = (id)   => apiDelete(`/api/housekeeping/${id}`);


export const getInvoices    = ()      => apiGet('/api/billing');
export const getInvoiceById = (id)    => apiGet(`/api/billing/${id}`);
export const createInvoice  = (inv)   => apiPost('/api/billing', inv);
export const updateInvoice  = (id, inv) => apiPut(`/api/billing/${id}`, inv);
export const addPayment     = (id, p) => apiPost(`/api/billing/${id}/payments`, p);
export const deleteInvoice  = (id)    => apiDelete(`/api/billing/${id}`);


export const getEmployees    = ()      => apiGet('/api/employees');
export const getEmployeeById = (id)    => apiGet(`/api/employees/${id}`);
export const createEmployee  = (e)     => apiPost('/api/employees', e);
export const updateEmployee  = (id, e) => apiPut(`/api/employees/${id}`, e);
export const deleteEmployee  = (id)    => apiDelete(`/api/employees/${id}`);


export const getMaintenanceRequests = ()       => apiGet('/api/maintenance');
export const getMaintenanceById     = (id)     => apiGet(`/api/maintenance/${id}`);
export const createMaintenance      = (m)      => apiPost('/api/maintenance', m);
export const updateMaintenance      = (id, m)  => apiPut(`/api/maintenance/${id}`, m);
export const updateMaintenanceStatus = (id, s) => apiPut(`/api/maintenance/${id}/status?status=${encodeURIComponent(s)}`, {});
export const deleteMaintenance      = (id)     => apiDelete(`/api/maintenance/${id}`);
