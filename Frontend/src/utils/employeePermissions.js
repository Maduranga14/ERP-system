/**
 * Role-based permission definitions for the Employee Management module.
 *
 * | Feature                | Admin | Manager | Receptionist | Housekeeper |
 * | viewList               |  ✅   |   ✅    |      ❌      |     ❌      |
 * | viewDetail             |  ✅   |   ✅    |      ❌      |     ❌      |
 * | create                 |  ✅   |   ❌    |      ❌      |     ❌      |
 * | edit                   |  ✅   |   ❌    |      ❌      |     ❌      |
 * | delete                 |  ✅   |   ❌    |      ❌      |     ❌      |
 * | manageSystemAccount    |  ✅   |   ❌    |      ❌      |     ❌      |
 * | resetPassword          |  ✅   |   ❌    |      ❌      |     ❌      |
 */
export const EMPLOYEE_PERMISSIONS = {
  viewList:            ['admin', 'manager'],
  viewDetail:          ['admin', 'manager'],
  create:              ['admin'],
  edit:                ['admin'],
  delete:              ['admin'],
  manageSystemAccount: ['admin'],
  resetPassword:       ['admin'],
};

export const canEmployee = (role, action) =>
  EMPLOYEE_PERMISSIONS[action]?.includes(role) ?? false;
