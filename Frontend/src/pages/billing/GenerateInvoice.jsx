import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ChevronRight, Plus, Trash2, FileText, User,
  BedDouble, Save, X,
} from 'lucide-react';

import DashboardLayout from '../../components/templates/DashboardLayout';
import { useRole }     from '../../hooks/useRole';

const USER_NAMES = { admin: 'Admin User', manager: 'Alex Sterling', receptionist: 'Sarah Mitchell' };
const USER_ROLES = { admin: 'Super Administrator', manager: 'General Manager', receptionist: 'Front Desk Lead' };

const EMPTY_ITEM = { description: '', qty: 1, unitPrice: 0 };

const GenerateInvoice = () => {
  const navigate = useNavigate();
  const role     = useRole();

  const basePath = role === 'admin' ? '/admin' : role === 'manager' ? '/manager' : '/receptionist';

  const [form, setForm] = useState({
    reservationId: '',
    guestName:     '',
    guestPhone:    '',
    guestEmail:    '',
    roomNumber:    '',
    roomType:      '',
    checkIn:       '',
    checkOut:      '',
    method:        'Credit Card',
    taxRate:       10,
    discount:      0,
    notes:         'Thank you for choosing Hotel Grande Resort. We hope you enjoyed your stay.',
  });

  const [lineItems, setLineItems] = useState([{ ...EMPTY_ITEM }]);
  const [submitted, setSubmitted] = useState(false);

  /* ── Derived totals ── */
  const subtotal    = lineItems.reduce((sum, i) => sum + Number(i.qty) * Number(i.unitPrice), 0);
  const tax         = subtotal * (form.taxRate / 100);
  const discount    = Number(form.discount);
  const grandTotal  = subtotal + tax - discount;

  const updateItem = (idx, field, value) => {
    const updated = lineItems.map((item, i) =>
      i === idx ? { ...item, [field]: value } : item
    );
    setLineItems(updated);
  };

  const addItem    = () => setLineItems([...lineItems, { ...EMPTY_ITEM }]);
  const removeItem = (idx) => setLineItems(lineItems.filter((_, i) => i !== idx));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => navigate(`${basePath}/billing`), 1500);
  };

  return (
    <DashboardLayout
      role={role}
      userName={USER_NAMES[role]}
      userRole={USER_ROLES[role]}
      notificationCount={3}
      searchPlaceholder="Search for guest, room or booking ID..."
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
        <Link to={`${basePath}/billing`} className="hover:text-amber-600 font-medium transition-colors">
          Billing &amp; Payments
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-600 font-medium">Generate Invoice</span>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Generate Invoice</h1>
          <p className="text-sm text-gray-400 mt-0.5">Create a new billing invoice for a guest reservation.</p>
        </div>
        <button
          onClick={() => navigate(`${basePath}/billing`)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {submitted && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-2 text-sm text-green-700 font-medium">
          Invoice generated successfully! Redirecting…
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Guest & Reservation */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold text-gray-800">Guest &amp; Reservation Details</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <Field label="Reservation ID" required>
              <input
                required
                type="text"
                value={form.reservationId}
                onChange={(e) => setForm({ ...form, reservationId: e.target.value })}
                placeholder="e.g. RES-1001"
                className="input-style"
              />
            </Field>
            <Field label="Guest Name" required>
              <input
                required
                type="text"
                value={form.guestName}
                onChange={(e) => setForm({ ...form, guestName: e.target.value })}
                placeholder="Full name"
                className="input-style"
              />
            </Field>
            <Field label="Phone">
              <input
                type="text"
                value={form.guestPhone}
                onChange={(e) => setForm({ ...form, guestPhone: e.target.value })}
                placeholder="+1 555-0000"
                className="input-style"
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={form.guestEmail}
                onChange={(e) => setForm({ ...form, guestEmail: e.target.value })}
                placeholder="guest@email.com"
                className="input-style"
              />
            </Field>
            <Field label="Payment Method" required>
              <select
                value={form.method}
                onChange={(e) => setForm({ ...form, method: e.target.value })}
                className="input-style bg-white"
              >
                <option>Credit Card</option>
                <option>Debit Card</option>
                <option>Cash</option>
                <option>Online Transfer</option>
                <option>Cheque</option>
              </select>
            </Field>
          </div>
        </div>

        {/* Room & Stay */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <BedDouble className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold text-gray-800">Room &amp; Stay Details</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <Field label="Room Number">
              <input
                type="text"
                value={form.roomNumber}
                onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
                placeholder="e.g. 402"
                className="input-style"
              />
            </Field>
            <Field label="Room Type">
              <input
                type="text"
                value={form.roomType}
                onChange={(e) => setForm({ ...form, roomType: e.target.value })}
                placeholder="e.g. Deluxe Sea View"
                className="input-style"
              />
            </Field>
            <Field label="Check-In Date">
              <input
                type="date"
                value={form.checkIn}
                onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
                className="input-style"
              />
            </Field>
            <Field label="Check-Out Date">
              <input
                type="date"
                value={form.checkOut}
                onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                className="input-style"
              />
            </Field>
          </div>
        </div>

        {/* Line Items */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold text-gray-800">Line Items</h2>
          </div>

          <table className="w-full text-sm mb-3">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left pb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-1/2">Description</th>
                <th className="text-right pb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-20">Qty</th>
                <th className="text-right pb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-28">Unit Price</th>
                <th className="text-right pb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-24">Amount</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-50">
                  <td className="py-2 pr-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(idx, 'description', e.target.value)}
                      placeholder="e.g. Room Charges"
                      className="input-style w-full text-xs"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) => updateItem(idx, 'qty', e.target.value)}
                      className="input-style w-full text-xs text-right"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(idx, 'unitPrice', e.target.value)}
                        className="input-style w-full text-xs text-right pl-5"
                      />
                    </div>
                  </td>
                  <td className="py-2 pl-2 text-right">
                    <span className="font-semibold text-amber-700 text-xs">
                      ${(Number(item.qty) * Number(item.unitPrice)).toFixed(2)}
                    </span>
                  </td>
                  <td className="py-2 pl-2">
                    {lineItems.length > 1 && (
                      <button type="button" onClick={() => removeItem(idx)}
                        className="text-gray-300 hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button type="button" onClick={addItem}
            className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 transition-colors">
            <Plus className="w-3.5 h-3.5" />
            Add Line Item
          </button>
        </div>

        {/* Totals + Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Notes */}
          <div className="card p-5">
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
              Terms &amp; Notes
            </label>
            <textarea
              rows={5}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="input-style w-full resize-none text-xs"
            />
          </div>

          {/* Totals */}
          <div className="card p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Invoice Summary</p>
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Tax Rate (%)</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.taxRate}
                  onChange={(e) => setForm({ ...form, taxRate: e.target.value })}
                  className="w-16 text-right border border-gray-200 rounded px-2 py-0.5 text-xs outline-none focus:border-amber-400"
                />
              </div>
              <div className="flex justify-between text-sm text-gray-500 pl-4">
                <span>Tax Amount</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-red-500">
                <span>Discount ($)</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.discount}
                  onChange={(e) => setForm({ ...form, discount: e.target.value })}
                  className="w-20 text-right border border-gray-200 rounded px-2 py-0.5 text-xs outline-none focus:border-amber-400 text-gray-700"
                />
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-200">
                <span className="font-bold text-gray-900">Grand Total</span>
                <span className="font-bold text-navy-900 text-lg">${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pb-6">
          <button type="button" onClick={() => navigate(`${basePath}/billing`)}
            className="px-6 py-2.5 border border-gray-200 text-sm font-semibold text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="submit"
            className="px-6 py-2.5 bg-navy-900 text-white text-sm font-semibold rounded-lg hover:bg-navy-800 transition-colors flex items-center gap-2">
            <Save className="w-4 h-4" />
            Generate Invoice
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
};

/* Small helper wrapper for form fields */
const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 mb-1.5">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    {children}
  </div>
);

export default GenerateInvoice;
