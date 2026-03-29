// src/components/ExpenseForm.jsx
import { useState } from 'react'

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
  const [category]                    = useState(initialData?.category || 'Students')
  const [date, setDate]               = useState(initialData?.date || today())
  const [description, setDescription] = useState(initialData?.description || '')
  const [items, setItems]             = useState(
    initialData?.items?.length
      ? initialData.items.map(i => ({ subject: i.subject, amount: String(i.amount) }))
      : [blankItem()]
  )
  const [errors, setErrors] = useState({})

  const runningTotal = items.reduce((sum, item) => {
    const v = parseFloat(item.amount)
    return sum + (isNaN(v) ? 0 : v)
  }, 0)

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
    if (items.length === 1) return
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  function validate() {
    const e = {}

    if (!date) e.date = 'Select a date'

    // Description is now required
    if (!description.trim()) e.description = 'Description is required'

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

  function handleSubmit() {
    if (!validate()) return

    onSave({
      category,
      date,
      description: description.trim(),
      items: items.map(item => ({
        subject: item.subject.trim(),
        amount: parseFloat(item.amount),
      })),
    })
  }

  return (
    <div style={styles.page}>

       <div style={styles.topBar}>
    <button style={styles.backBtn} onClick={onCancel}>
      <span style={styles.backArrow}>←</span>
      Back to Dashboard
    </button>
  </div>

    <div style={styles.cardWrapper}>
      <div style={styles.card}>
        {/* Coloured header */}
        <div style={{ ...styles.cardHeader, background: headerColor }}>
          <h1 style={styles.title}>{title}</h1>
          <p style={styles.subtitle}>{subtitle}</p>
        </div>

        {/* Scrollable body */}
        <div style={styles.body}>

          {/* ── Category + Date row ── */}
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Category *</label>
              <input
                type="text"
                value="Student"
                disabled
                style={{ ...styles.input, background: '#f3f4f6', cursor: 'not-allowed' }}
              />
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

          {/* ── Description (required) ── */}
          <div style={styles.field}>
            <label style={styles.label}>Description *</label>
            <input
              type="text"
              value={description}
              onChange={e => {
                setDescription(e.target.value)
                // Clear error as user types
                if (errors.description) setErrors(prev => ({ ...prev, description: undefined }))
              }}
              placeholder="e.g. Monthly grocery run"
              style={{
                ...styles.input,
                ...(errors.description ? { borderColor: 'var(--danger)' } : {})
              }}
              maxLength={500}
            />
            {/* Inline notification — no alert() */}
            {errors.description && (
              <div style={styles.fieldError}>
                <span style={styles.fieldErrorIcon}>⚠</span>
                {errors.description}
              </div>
            )}
          </div>

          {/* ── Items section — scrollable ── */}
          <div style={styles.itemsSection}>
            <div style={styles.itemsHeader}>
              <span style={styles.itemsTitle}>Expense Items</span>
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

            {/* Scrollable item rows */}
            <div style={styles.itemsScroll}>
              {items.map((item, i) => (
                <div key={i} style={styles.itemRow}>
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

                  <button
                    style={{ ...styles.removeBtn, opacity: items.length === 1 ? 0.4 : 1 }}
                    onClick={() => removeItem(i)}
                    disabled={items.length === 1}
                    title="Remove item"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <button style={styles.addItemBtn} onClick={addItem}>
              + Add Another Item
            </button>
          </div>

          {/* ── Summary box — always visible at bottom ── */}
          <div style={styles.summaryBox}>
            <div style={styles.summaryRow}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Number of items</span>
              <span style={{ fontWeight: 600 }}>{items.length}</span>
            </div>
            <div style={{ ...styles.summaryRow, marginBottom: 0 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Grand Total</span>
              <span style={styles.grandTotal}>₹{runningTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* ── Action buttons ── */}
          <div style={styles.actions}>
            <button style={styles.cancelBtn} onClick={onCancel}>Cancel</button>
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
    </div>
  )
}

const styles = {
  page: {
    maxWidth: 760,
    margin: '0 auto',
    padding: '24px 16px',
    // Make the whole page scroll, card stays in place
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },

  // ── Modern back button ──
//   backBtn: {
//     display: 'inline-flex',
//     alignItems: 'center',
//     gap: 8,
//     padding: '8px 16px',
//     borderRadius: 99,
//     border: '1.5px solid var(--border)',
//     background: '#fff',
//     color: 'var(--text-secondary)',
//     fontSize: 13,
//     fontWeight: 500,
//     cursor: 'pointer',
//     fontFamily: 'var(--font-body)',
//     marginBottom: 20,
//     alignSelf: 'flex-start', // stays left
//     boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
//     transition: 'all 0.15s',
//   },
  backArrow: {
    fontSize: 15,
    lineHeight: 1,
  },

  card: {
  position: 'fixed',        // ← pins it in place
  top: 80,                  // ← below navbar
  left: '50%',              // ← center horizontally
  transform: 'translateX(-50%)',  // ← true centering trick
  width: '90%',             // ← responsive width
  maxWidth: 760,
  maxHeight: 'calc(100vh - 120px)',
  background: '#fff',
  borderRadius: 16,
  boxShadow: 'var(--shadow-lg)',
  border: '1px solid var(--border)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  zIndex: 5,
},

  cardHeader: { padding: '28px 32px', flexShrink: 0 },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 24, fontWeight: 700,
    color: '#fff', marginBottom: 4,
  },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.85)' },

  // Scrollable body
  body: {
    padding: '28px 32px',
    overflowY: 'auto',
    flex: 1,
  },

  row: { display: 'flex', gap: 20, marginBottom: 20, flexWrap: 'wrap' },
  field: {
    display: 'flex', flexDirection: 'column',
    gap: 6, flex: 1, minWidth: 200, marginBottom: 20,
  },
  label: { fontSize: 13, fontWeight: 600, color: '#374151' },
  input: {
    padding: '10px 13px',
    borderRadius: 'var(--radius-sm)',
    border: '1.5px solid var(--border)',
    fontSize: 14, color: 'var(--text-primary)',
    background: '#fff', width: '100%',
    fontFamily: 'var(--font-body)',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  err: { fontSize: 12, color: 'var(--danger)', marginTop: 2 },

  // Inline field-level error notification (replaces alert)
  fieldError: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    padding: '7px 12px',
    borderRadius: 8,
    background: '#FEF2F2',
    border: '1px solid #FECACA',
    color: '#DC2626',
    fontSize: 13,
    fontWeight: 500,
  },
  fieldErrorIcon: {
    fontSize: 14,
    flexShrink: 0,
  },

  itemsSection: {
    borderTop: '1px solid #F3F4F6',
    paddingTop: 24,
    marginBottom: 20,
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

  // Scrollable item list — max 3 rows visible, then scrolls
  itemsScroll: {
    maxHeight: 200,
    overflowY: 'auto',
    paddingRight: 4,
  },

  itemRow: {
    display: 'flex', gap: 12,
    alignItems: 'flex-start', marginBottom: 10,
  },
  removeBtn: {
    width: 36, height: 40,
    borderRadius: 'var(--radius-sm)',
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
    // Always visible — sticks after items scroll
    flexShrink: 0,
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
    flexShrink: 0,
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
  backBtn: {
  position: 'fixed',   // ← add this
  top: 80,             // ← below your navbar
  left: 24,            // ← left edge
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 16px',
  borderRadius: 99,
  border: '1.5px solid var(--border)',
  background: '#fff',
  color: 'var(--text-secondary)',
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: 'var(--font-body)',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  zIndex: 10,
}
}