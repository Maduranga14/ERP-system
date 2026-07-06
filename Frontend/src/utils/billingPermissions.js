/**
 * Role-based permission definitions for the Billing & Payments module.
 *
 * | Feature               | Admin | Receptionist | Manager | Housekeeper |
 * | viewInvoices          |  ✅   |      ✅       |   ✅    |     ❌      |
 * | generateInvoice       |  ✅   |      ✅       |   ❌    |     ❌      |
 * | recordPayment         |  ✅   |      ✅       |   ❌    |     ❌      |
 * | printInvoice          |  ✅   |      ✅       |   ✅    |     ❌      |
 * | viewRevenueSummary    |  ✅   |   Limited    |   ✅    |     ❌      |
 * | exportBillingReports  |  ✅   |      ❌       |   ✅    |     ❌      |
 */
export const BILLING_PERMISSIONS = {
  viewInvoices:         ['admin', 'receptionist', 'manager'],
  generateInvoice:      ['admin', 'receptionist'],
  recordPayment:        ['admin', 'receptionist'],
  printInvoice:         ['admin', 'receptionist', 'manager'],
  viewRevenueSummary:   ['admin', 'receptionist', 'manager'], // receptionist = limited view
  exportBillingReports: ['admin', 'manager'],
};

export const canBilling = (role, action) =>
  BILLING_PERMISSIONS[action]?.includes(role) ?? false;

/** Receptionist gets a limited revenue summary (no breakdown charts, no export) */
export const isLimitedRevenue = (role) => role === 'receptionist';
