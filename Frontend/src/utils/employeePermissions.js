
export const EMPLOYEE_PERMISSIONS = {
  viewList:            ['admin', 'manager'],
  viewDetail:          ['admin', 'manager'],
  create:              ['admin'],
  edit:                ['admin', 'manager'],
  delete:              ['admin'],
  manageSystemAccount: ['admin'],
  resetPassword:       ['admin'],
};

export const canEmployee = (role, action) =>
  EMPLOYEE_PERMISSIONS[action]?.includes(role) ?? false;
