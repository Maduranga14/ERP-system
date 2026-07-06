/**
 * Room module permissions
 *
 * | Feature                  | Admin | Receptionist           | Manager   | Housekeeper             |
 * | view                     |  ✅   |  ✅                    |  ✅       |  ✅                     |
 * | add                      |  ✅   |  ❌                    |  ❌       |  ❌                     |
 * | edit                     |  ✅   |  limited (status only) |  ❌       |  ❌                     |
 * | changeStatus             |  ✅   |  ✅                    |  view only|  ✅ (cleaning only)     |
 * | delete                   |  ✅   |  ❌                    |  ❌       |  ❌                     |
 * | viewMaintenance          |  ✅   |  ✅                    |  ✅       |  ✅                     |
 */
export const ROOM_PERMISSIONS = {
  view:            ['admin', 'receptionist', 'manager', 'housekeeper'],
  add:             ['admin'],
  edit:            ['admin', 'receptionist'],   // receptionist = status-only
  editFull:        ['admin'],                   // full field editing
  changeStatus:    ['admin', 'receptionist', 'housekeeper'],
  delete:          ['admin'],
  viewMaintenance: ['admin', 'receptionist', 'manager', 'housekeeper'],
};

export const canRoom = (role, action) =>
  ROOM_PERMISSIONS[action]?.includes(role) ?? false;

/** Receptionist can only change status, not full edit */
export const canEditFull   = (role) => role === 'admin';
export const canEditStatus = (role) => ['admin', 'receptionist'].includes(role);

/** Housekeeper can only set Cleaning / Available statuses */
export const HOUSEKEEPER_ALLOWED_STATUSES = ['Available', 'Cleaning'];
export const STATUS_OPTIONS_FOR_ROLE = (role) => {
  if (role === 'housekeeper') return HOUSEKEEPER_ALLOWED_STATUSES;
  if (role === 'manager')     return [];  // view-only
  return ['Available', 'Occupied', 'Reserved', 'Cleaning', 'Maintenance', 'Down'];
};
