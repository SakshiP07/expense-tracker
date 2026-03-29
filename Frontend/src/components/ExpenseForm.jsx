// src/components/ExpenseForm.jsx
// Shared form used by both AddExpensePage and EditExpensePage.
// Props:
//   title, subtitle, headerColor → visual customization
//   initialData                  → pre-fills form for edit mode
//   onSave(formData)             → called with validated data on submit
//   onCancel()                   → called when Cancel is clicked
//   saving                       → disables button while API call runs
//   saveLabel                    → "Save Expense" or "Update Expense"

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const CATEGORIES = [
  'Students',
  'Office/Shopkeepers/Freelancer',
  'Housewives',
]

const blankItem = () => ({ subject: '', amount: '' })

function today() {
  return new Date().toISOString().split('T')[0]
}

export default function ExpenseForm({
  title,
  subtitle,
  headerColor,
  initialData = null,
  onSave,
  onCancel,
  saving,
  saveLabel,
}) {
  // Pre-fill from initialData (edit mode) or use defaults (add mode)
  const [category, setCategory]       = useState(initialData?.category || CATEGORIES[0])
  const [date, setDate]               = useState(initialData?.date || today())
  const [description, setDescription] = useState(initialData?.description || '')
  const [items, setItems]             = useState(
    initialData?.items?.length
      ? initialData.items.map(i => ({ subject: i.subject, amount: String(i.amount) }))
      : [blankItem()]
  )
  const [errors, setErrors] = useState({})

  // Live total — updates as user types amounts
  const runningTotal = items.reduce((sum, item) => {
    const v = parseFloat(item.amount)
    return sum + (isNaN(v) ? 0 : v)
  }, 0)

  // ── Item handlers ──────────────────────────────────────────────────────
  function updateItem(index, field, value) {
    setItems(prev => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
  }

  function addItem() {
    setItems(prev => [...prev, blankItem()])
  }

  function removeItem(index) {
    if (items.length === 1) return // always keep one row
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  // ── Validation ─────────────────────────────────────────────────────────
  function validate() {
    const e = {}

    if (!category) e.category = 'Select a category'
    if (!date)     e.date     = 'Select a date'

    const itemErrors = items.map(item => {
      const ie = {}
      if (!item.subject.trim()) ie.subject = 'Required'
      const amt = parseFloat(item.amount)
      if (!item.amount)    ie.amount = 'Required'
      else if (isNaN(amt)) ie.amount = 'Must be a number'
      else if (amt <= 0)   ie.amount = 'Must be greater than 0'
      return ie
    })

    if (itemErrors.some(ie => Object.keys(ie).length > 0)) {
      e.items = itemErrors
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Submit ─────────────────────────────────────────────────────────────
  function handleSubmit() {
    if (!validate()) return

    onSave({
      category,
      date,
      description: description.trim() || null,
      items: items.map(item => ({
        subject: item.subject.trim(),
        amount: parseFloat(item.amount),
      })),
    })
  }

  return (
    <div style={styles.page}>
      {/* Back link */}
      <button style={styles.backBtn} onClick={onCancel}>
        ← Back to Dashboard
      </button>

      <div style={styles.card}>
        {/* Coloured header */}
        <div style={{ ...styles.cardHeader, background: headerColor }}>
          <h1 style={styles.title}>{title}</h1>
          <p style={styles.subtitle}>{subtitle}</p>
        </div>

        <div style={styles.body}>
          {/* ── Category + Date row ── */}
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Category *</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                style={styles.input}
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.category && <span style={styles.err}>{errors.category}</span>}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Date *</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                max={today()}
                style={{ ...styles.input, ...(errors.date ? { borderColor: 'var(--danger)' } : {}) }}
              />
              {errors.date && <span style={styles.err}>{errors.date}</span>}
            </div>
          </div>

          {/* ── Description ── */}
          <div style={styles.field}>
            <label style={styles.label}>
              Description <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Monthly grocery run"
              style={styles.input}
              maxLength={500}
            />
          </div>

          {/* ── Items section ── */}
          <div style={styles.itemsSection}>
            <div style={styles.itemsHeader}>
              <span style={styles.itemsTitle}>Expense Items</span>
              {/* Live total updates as user types */}
              <span style={styles.totalPill}>
                Total: ₹{runningTotal.toFixed(2)}
              </span>
            </div>

            {/* Column headers */}
            <div style={styles.colHeaders}>
              <span style={{ flex: 1 }}>Where did you spend? (Subject)</span>
              <span style={{ width: 140 }}>Amount (₹)</span>
              <span style={{ width: 40 }} />
            </div>

            {/* Item rows */}
            {items.map((item, i) => (
              <div key={i} style={styles.itemRow}>
                {/* Subject */}
                <div style={{ flex: 1 }}>
                  <input
                    type="text"
                    placeholder="e.g. Notebook, Lunch, Rent"
                    value={item.subject}
                    onChange={e => updateItem(i, 'subject', e.target.value)}
                    style={{
                      ...styles.input,
                      ...(errors.items?.[i]?.subject ? { borderColor: 'var(--danger)' } : {})
                    }}
                  />
                  {errors.items?.[i]?.subject && (
                    <span style={styles.err}>{errors.items[i].subject}</span>
                  )}
                </div>

                {/* Amount */}
                <div style={{ width: 140 }}>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={item.amount}
                    onChange={e => updateItem(i, 'amount', e.target.value)}
                    min="0.01"
                    step="0.01"
                    style={{
                      ...styles.input,
                      ...(errors.items?.[i]?.amount ? { borderColor: 'var(--danger)' } : {})
                    }}
                  />
                  {errors.items?.[i]?.amount && (
                    <span style={styles.err}>{errors.items[i].amount}</span>
                  )}
                </div>

                {/* Remove row */}
                <button
                  style={{
                    ...styles.removeBtn,
                    opacity: items.length === 1 ? 0.4 : 1,
                  }}
                  onClick={() => removeItem(i)}
                  disabled={items.length === 1}
                  title="Remove item"
                >
                  ✕
                </button>
              </div>
            ))}

            {/* Add another item button */}
            <button style={styles.addItemBtn} onClick={addItem}>
              + Add Another Item
            </button>
          </div>

          {/* ── Summary box ── */}
          <div style={styles.summaryBox}>
            <div style={styles.summaryRow}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Number of items
              </span>
              <span style={{ fontWeight: 600 }}>{items.length}</span>
            </div>
            <div style={{ ...styles.summaryRow, marginBottom: 0 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Grand Total
              </span>
              <span style={styles.grandTotal}>
                ₹{runningTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* ── Action buttons ── */}
          <div style={styles.actions}>
            <button style={styles.cancelBtn} onClick={onCancel}>
              Cancel
            </button>
            <button
              style={{ ...styles.saveBtn, opacity: saving ? 0.7 : 1 }}
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? 'Saving…' : saveLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { maxWidth: 760, margin: '0 auto' },
  backBtn: {
    background: 'none', border: 'none', padding: 0,
    color: 'var(--text-secondary)', fontSize: 14,
    cursor: 'pointer', marginBottom: 20,
    fontFamily: 'var(--font-body)',
  },
  card: {
    background: '#fff', borderRadius: 16,
    boxShadow: 'var(--shadow-lg)',
    border: '1px solid var(--border)',
    overflow: 'hidden',
  },
  cardHeader: { padding: '28px 32px' },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 24, fontWeight: 700,
    color: '#fff', marginBottom: 4,
  },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.85)' },
  body: { padding: '28px 32px' },
  row: { display: 'flex', gap: 20, marginBottom: 20, flexWrap: 'wrap' },
  field: {
    display: 'flex', flexDirection: 'column',
    gap: 6, flex: 1, minWidth: 200, marginBottom: 20,
  },
  label: { fontSize: 13, fontWeight: 600, color: '#374151' },
  input: {
    padding: '10px 13px', borderRadius: 'var(--radius-sm)',
    border: '1.5px solid var(--border)',
    fontSize: 14, color: 'var(--text-primary)',
    background: '#fff', width: '100%',
    fontFamily: 'var(--font-body)',
    transition: 'border-color 0.2s',
  },
  err: { fontSize: 12, color: 'var(--danger)', marginTop: 2 },
  itemsSection: {
    borderTop: '1px solid #F3F4F6',
    paddingTop: 24, marginBottom: 20,
  },
  itemsHeader: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 16,
  },
  itemsTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 16, fontWeight: 700,
    color: 'var(--text-primary)',
  },
  totalPill: {
    background: 'var(--orange-light)',
    color: 'var(--orange)',
    padding: '4px 14px', borderRadius: 99,
    fontSize: 14, fontWeight: 700,
  },
  colHeaders: {
    display: 'flex', gap: 12, marginBottom: 10,
    fontSize: 12, fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  itemRow: {
    display: 'flex', gap: 12,
    alignItems: 'flex-start', marginBottom: 10,
  },
  removeBtn: {
    width: 36, height: 40, borderRadius: 'var(--radius-sm)',
    border: '1.5px solid var(--danger-border)',
    background: 'var(--danger-light)',
    color: 'var(--danger)', fontSize: 14,
    cursor: 'pointer', flexShrink: 0,
    display: 'flex', alignItems: 'center',
    justifyContent: 'center',
  },
  addItemBtn: {
    marginTop: 8, padding: '9px 18px',
    borderRadius: 'var(--radius-sm)',
    border: '1.5px dashed var(--border)',
    background: '#FAFAFA',
    color: 'var(--text-secondary)',
    fontSize: 13, fontWeight: 500,
    cursor: 'pointer', width: '100%',
    fontFamily: 'var(--font-body)',
  },
  summaryBox: {
    background: '#F9FAFB', borderRadius: 10,
    padding: '16px 20px',
    border: '1px solid var(--border)',
    marginBottom: 24,
  },
  summaryRow: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  grandTotal: {
    fontSize: 20, fontWeight: 700,
    color: 'var(--orange)',
    fontFamily: 'var(--font-display)',
  },
  actions: {
    display: 'flex', gap: 12,
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    padding: '11px 24px', borderRadius: 9,
    border: '1.5px solid var(--border)',
    background: '#fff', color: 'var(--text-secondary)',
    fontSize: 14, fontWeight: 500,
    cursor: 'pointer', fontFamily: 'var(--font-body)',
  },
  saveBtn: {
    padding: '11px 28px', borderRadius: 9,
    border: 'none', background: 'var(--orange)',
    color: '#fff', fontSize: 14, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'var(--font-body)',
    boxShadow: 'var(--shadow-orange)',
    transition: 'opacity 0.2s',
  },
}