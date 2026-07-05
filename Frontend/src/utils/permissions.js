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
