/**
 * Role-based permission definitions for the Reservation module.
 *
 * | Feature              | Admin | Receptionist | Manager   | Housekeeper |
 * | view                 |  ✅   |      ✅       |    ✅     |     ❌      |
 * | create               |  ✅   |      ✅       |    ❌     |     ❌      |
 * | edit                 |  ✅   |      ✅       |    ❌     |     ❌      |
 * | cancel               |  ✅   |      ✅       |    ❌     |     ❌      |
 * | checkInOut           |  ✅   |      ✅       | view only |     ❌      |
 * | export               |  ✅   |   optional   |    ✅     |     ❌      |
 */
export const RESERVATION_PERMISSIONS = {
  view:       ['admin', 'receptionist', 'manager'],
  create:     ['admin', 'receptionist'],
  edit:       ['admin', 'receptionist'],
  cancel:     ['admin', 'receptionist'],
  checkInOut: ['admin', 'receptionist'],
  export:     ['admin', 'receptionist', 'manager'],
};

export const can = (role, action) =>
  RESERVATION_PERMISSIONS[action]?.includes(role) ?? false;

/**
 * Role-based permission definitions for the Customer module.
 *
 * | Feature              | Admin | Receptionist | Manager | Housekeeper |
 * | view                 |  ✅   |      ✅       |   ✅    |     ❌      |
 * | create               |  ✅   |      ✅       |   ❌    |     ❌      |
 * | edit                 |  ✅   |      ✅       |   ❌    |     ❌      |
 * | delete               |  ✅   |      ❌       |   ❌    |     ❌      |
 * | viewBookingHistory   |  ✅   |      ✅       |   ✅    |     ❌      |
 * | viewPaymentHistory   |  ✅   |      ❌       |   ✅    |     ❌      |
 */
export const CUSTOMER_PERMISSIONS = {
  view:               ['admin', 'receptionist', 'manager'],
  create:             ['admin', 'receptionist'],
  edit:               ['admin', 'receptionist'],
  delete:             ['admin'],
  viewBookingHistory: ['admin', 'receptionist', 'manager'],
  viewPaymentHistory: ['admin', 'manager'],
};

export const canCustomer = (role, action) =>
  CUSTOMER_PERMISSIONS[action]?.includes(role) ?? false;

/**
 * Role-based permission definitions for the Housekeeping module.
 *
 * | Feature                  | Admin | Receptionist | Manager | Housekeeper |
 * | viewTasks                |  ✅   |    basic     |   ✅    |     ✅      |
 * | assignTasks              |  ✅   |      ❌      |   ✅    |     ❌      |
 * | updateStatus             |  ✅   |      ❌      |   ✅    |     ✅      |
 * | reportMaintenance        |  ✅   |      ❌      |   ✅    |     ✅      |
 * | viewHistory              |  ✅   |      ❌      |   ✅    |     ✅      |
 * | manageStaff              |  ✅   |      ❌      |   ✅    |     ❌      |
 * | exportList               |  ✅   |      ❌      |   ✅    |     ❌      |
 * | broadcastAlert           |  ✅   |      ❌      |   ✅    |     ❌      |
 */
export const HOUSEKEEPING_PERMISSIONS = {
  viewTasks:         ['admin', 'receptionist', 'manager', 'housekeeper'],
  assignTasks:       ['admin', 'manager', 'receptionist'],
  updateStatus:      ['admin', 'manager', 'housekeeper'],
  reportMaintenance: ['admin', 'manager', 'housekeeper'],
  viewHistory:       ['admin', 'manager', 'housekeeper'],
  manageStaff:       ['admin', 'manager'],
  exportList:        ['admin', 'manager'],
  broadcastAlert:    ['admin', 'manager'],
};

export const canHousekeeping = (role, action) =>
  HOUSEKEEPING_PERMISSIONS[action]?.includes(role) ?? false;
