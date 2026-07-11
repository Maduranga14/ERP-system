import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getInvoiceById } from '../../utils/api';

const STATUS_COLORS = {
  Paid:     { bg: '#dcfce7', color: '#15803d' },
  Pending:  { bg: '#fef9c3', color: '#a16207' },
  Partial:  { bg: '#fef3c7', color: '#b45309' },
  Refunded: { bg: '#f3e8ff', color: '#7e22ce' },
  Overdue:  { bg: '#fee2e2', color: '#b91c1c' },
};

const PrintInvoice = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getInvoiceById(id)
      .then(data => {
        setInvoice(data);
      })
      .catch(() => setError('Failed to load invoice.'));
  }, [id]);

  useEffect(() => {
    if (invoice) {
      document.title = `Invoice – INV-${String(invoice.id).padStart(3, '0')}`;
      // auto-trigger print once rendered
      setTimeout(() => window.print(), 500);
    }
  }, [invoice]);

  if (error) return <p style={{ padding: 32, color: '#ef4444', fontFamily: 'sans-serif' }}>{error}</p>;
  if (!invoice) return <p style={{ padding: 32, color: '#6b7280', fontFamily: 'sans-serif' }}>Loading...</p>;

  const invoiceCode = `INV-${String(invoice.id).padStart(3, '0')}`;
  const reservationCode = invoice.reservation ? `RES-${10000 + invoice.reservation.id}` : '—';
  const balance = invoice.grandTotal - invoice.amountPaid;
  const statusStyle = STATUS_COLORS[invoice.status] || STATUS_COLORS.Pending;

  return (
    <div style={s.page}>
      {/* ── Header ── */}
      <div style={s.header}>
        <div style={s.hotelBrand}>
          <div style={s.hotelIcon}>
            <span style={{ fontSize: 22, color: '#f59e0b' }}>🏨</span>
          </div>
          <div>
            <div style={s.hotelName}>Hotel Grande Resort</div>
            <div style={s.hotelAddress}>123 Azure Coast Blvd, Sapphire Bay, Luxury Isles 45012</div>
            <div style={s.hotelAddress}>Tel: +1 (800) 555-0199 · billing@hotelgrande.com</div>
          </div>
        </div>
        <div style={s.invoiceMeta}>
          <span style={{ ...s.badge, background: statusStyle.bg, color: statusStyle.color }}>
            {invoice.status.toUpperCase()}
          </span>
          <div style={{ marginTop: 10 }}>
            <div style={s.metaLabel}>Invoice No.</div>
            <div style={s.metaValue}>{invoiceCode}</div>
          </div>
          <div style={{ marginTop: 6 }}>
            <div style={s.metaLabel}>Date</div>
            <div style={s.metaValueSm}>{invoice.date}</div>
          </div>
        </div>
      </div>

      <div style={s.divider} />

      {/* ── Guest + Stay ── */}
      <div style={s.twoCol}>
        <div>
          <div style={s.sectionLabel}>Guest Details</div>
          <div style={s.guestName}>{invoice.guestName}</div>
          {invoice.phone && <div style={s.detail}>📞 {invoice.phone}</div>}
          {invoice.email && <div style={s.detail}>✉️ {invoice.email}</div>}
          <div style={{ ...s.twoCol, marginTop: 12, gap: 12 }}>
            <div>
              <div style={s.fieldLabel}>Reservation ID</div>
              <div style={s.fieldValueAmber}>{reservationCode}</div>
            </div>
            <div>
              <div style={s.fieldLabel}>Room</div>
              <div style={s.fieldValueAmber}>{invoice.roomNumber} – {invoice.roomType}</div>
            </div>
          </div>
        </div>
        <div>
          <div style={s.sectionLabel}>Stay Information</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={s.fieldLabel}>Check-In</div>
              <div style={s.fieldValue}>{invoice.checkIn}</div>
            </div>
            <div>
              <div style={s.fieldLabel}>Check-Out</div>
              <div style={s.fieldValue}>{invoice.checkOut}</div>
            </div>
            <div>
              <div style={s.fieldLabel}>Duration</div>
              <div style={s.fieldValue}>{invoice.nights} Night{invoice.nights !== 1 ? 's' : ''}</div>
            </div>
            <div>
              <div style={s.fieldLabel}>Room Type</div>
              <div style={s.fieldValue}>{invoice.roomType}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={s.divider} />

      {/* ── Line Items ── */}
      <table style={s.table}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            <th style={{ ...s.th, textAlign: 'left' }}>Description</th>
            <th style={{ ...s.th, textAlign: 'right' }}>Qty</th>
            <th style={{ ...s.th, textAlign: 'right' }}>Unit Price</th>
            <th style={{ ...s.th, textAlign: 'right' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.lineItems.map((item, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={s.td}>{item.description}</td>
              <td style={{ ...s.td, textAlign: 'right', color: '#6b7280' }}>{item.qty}</td>
              <td style={{ ...s.td, textAlign: 'right', color: '#6b7280' }}>${item.unitPrice.toFixed(2)}</td>
              <td style={{ ...s.td, textAlign: 'right', fontWeight: 600, color: '#b45309' }}>${item.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── Totals ── */}
      <div style={s.totalsRow}>
        <div style={s.totalsBox}>
          <div style={s.totalLine}>
            <span>Subtotal</span><span>${invoice.subtotal.toFixed(2)}</span>
          </div>
          <div style={s.totalLine}>
            <span>Tax (10%)</span><span>${invoice.tax.toFixed(2)}</span>
          </div>
          {invoice.discount !== 0 && (
            <div style={{ ...s.totalLine, color: '#ef4444', fontWeight: 600 }}>
              <span>Discount</span><span>-${Math.abs(invoice.discount).toFixed(2)}</span>
            </div>
          )}
          <div style={s.grandTotalLine}>
            <span>Grand Total</span><span>${invoice.grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* ── Payment Summary ── */}
      <div style={s.paymentSummary}>
        <div style={s.payItem}>
          <div style={s.fieldLabel}>Total Amount</div>
          <div style={{ ...s.fieldValue, fontSize: 15, fontWeight: 700 }}>${invoice.grandTotal.toFixed(2)}</div>
        </div>
        <div style={s.payItem}>
          <div style={s.fieldLabel}>Amount Paid</div>
          <div style={{ ...s.fieldValue, fontSize: 15, fontWeight: 700, color: '#16a34a' }}>${invoice.amountPaid.toFixed(2)}</div>
        </div>
        <div style={s.payItem}>
          <div style={s.fieldLabel}>Balance Due</div>
          <div style={{ ...s.fieldValue, fontSize: 15, fontWeight: 700, color: balance > 0 ? '#d97706' : '#16a34a' }}>
            ${balance.toFixed(2)}
          </div>
        </div>
        <div style={s.payItem}>
          <div style={s.fieldLabel}>Payment Method</div>
          <div style={s.fieldValue}>{invoice.method}</div>
        </div>
      </div>

      {/* ── Terms ── */}
      {invoice.notes && (
        <div style={s.terms}>
          <div style={s.sectionLabel}>Terms &amp; Notes</div>
          <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.6, marginTop: 4 }}>{invoice.notes}</div>
        </div>
      )}

      {/* ── Footer ── */}
      <div style={s.footer}>
        <span>Hotel Grande Resort · 123 Azure Coast Blvd · billing@hotelgrande.com</span>
        <span>Thank you for your stay!</span>
      </div>
    </div>
  );
};

/* ── Inline styles (no Tailwind needed for print page) ── */
const s = {
  page:          { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13, color: '#1f2937', maxWidth: 800, margin: '0 auto', padding: 40, background: '#fff' },
  header:        { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  hotelBrand:    { display: 'flex', alignItems: 'center', gap: 14 },
  hotelIcon:     { width: 52, height: 52, background: '#0D2137', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  hotelName:     { fontSize: 16, fontWeight: 700, color: '#0D2137' },
  hotelAddress:  { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  invoiceMeta:   { textAlign: 'right' },
  badge:         { display: 'inline-block', padding: '3px 12px', borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: '0.05em' },
  metaLabel:     { fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', fontWeight: 600 },
  metaValue:     { fontSize: 15, fontWeight: 700, color: '#0D2137', marginTop: 2 },
  metaValueSm:   { fontSize: 13, fontWeight: 600, color: '#374151', marginTop: 2 },
  divider:       { borderTop: '1px solid #e5e7eb', margin: '20px 0' },
  twoCol:        { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 20 },
  sectionLabel:  { fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', fontWeight: 700, marginBottom: 10 },
  guestName:     { fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 6 },
  detail:        { fontSize: 12, color: '#6b7280', marginBottom: 3 },
  fieldLabel:    { fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', fontWeight: 600 },
  fieldValue:    { fontSize: 13, fontWeight: 600, color: '#1f2937', marginTop: 2 },
  fieldValueAmber: { fontSize: 13, fontWeight: 700, color: '#b45309', marginTop: 2 },
  table:         { width: '100%', borderCollapse: 'collapse', marginBottom: 20 },
  th:            { padding: '8px 10px', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af', fontWeight: 600, borderBottom: '2px solid #e5e7eb' },
  td:            { padding: '10px 10px', fontSize: 13, color: '#374151' },
  totalsRow:     { display: 'flex', justifyContent: 'flex-end', marginBottom: 20 },
  totalsBox:     { width: 280 },
  totalLine:     { display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#4b5563', marginBottom: 6 },
  grandTotalLine:{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700, color: '#0D2137', borderTop: '2px solid #e5e7eb', paddingTop: 10, marginTop: 6 },
  paymentSummary:{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 10, padding: 16, marginBottom: 20 },
  payItem:       { },
  terms:         { background: '#f8fafc', borderRadius: 8, padding: 14, marginBottom: 20 },
  footer:        { display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e5e7eb', paddingTop: 16, fontSize: 11, color: '#9ca3af' },
};

export default PrintInvoice;
