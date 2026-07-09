
export const ROOM_PERMISSIONS = {
  view:            ['admin', 'receptionist', 'manager', 'housekeeper'],
  add:             ['admin'],
  edit:            ['admin', 'receptionist'],  
  editFull:        ['admin'],                  
  changeStatus:    ['admin', 'receptionist', 'housekeeper'],
  delete:          ['admin'],
  viewMaintenance: ['admin', 'receptionist', 'manager', 'housekeeper'],
};

export const canRoom = (role, action) =>
  ROOM_PERMISSIONS[action]?.includes(role) ?? false;


export const canEditFull   = (role) => role === 'admin';
export const canEditStatus = (role) => ['admin', 'receptionist', 'manager', 'housekeeper'].includes(role);


export const HOUSEKEEPER_ALLOWED_STATUSES = ['Available', 'Cleaning', 'Maintenance'];
export const STATUS_OPTIONS_FOR_ROLE = (role) => {
  if (role === 'housekeeper' || role === 'manager') return HOUSEKEEPER_ALLOWED_STATUSES;
  return ['Available', 'Occupied', 'Reserved', 'Cleaning', 'Maintenance', 'Down'];
};
