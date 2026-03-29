// src/pages/DashboardPage.jsx
// Main dashboard — shows all expenses for the logged-in user.
//
// Features:
// → Orange "Add Expense" button → goes to /expenses/add
// → Table of all expenses sorted newest first
// → Click any row → expands to show all line items
// → Edit button → goes to /expenses/edit/:id
// → Delete button → confirms and removes
// → Grand total shown in header
// → Empty state when no expenses yet

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

export default function DashboardPage() {
  const navigate = useNavigate()

  const [expenses, setExpenses]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [expandedId, setExpandedId] = useState(null) // which row is expanded

  // Fetch all expenses for the logged-in user
  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/expenses')
      setExpenses(res.data)
    } catch {
      setError('Failed to load expenses. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchExpenses() }, [fetchExpenses])

  // Delete expense
  async function handleDelete(id) {
    if (!window.confirm('Delete this expense?')) return
    setDeletingId(id)
    try {
      await api.delete(`/expenses/${id}`)
      // Remove from state without refetching
      setExpenses(prev => prev.filter(e => e.id !== id))
    } catch {
      alert('Failed to delete. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  // Toggle row expansion to show line items
  function toggleExpand(id) {
    setExpandedId(prev => prev === id ? null : id)
  }

  // Grand total across all visible expenses
  const grandTotal = expenses.reduce((sum, e) => sum + e.total, 0)

  return (
    <div style={styles.page}>

      {/* ── Header ── */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Expenses</h1>
          <div style={styles.meta}>
            <span style={styles.count}>
              {expenses.length} {expenses.length === 1 ? 'record' : 'records'}
            </span>
            {grandTotal > 0 && (
              <span style={styles.totalBadge}>
                Total: ₹{grandTotal.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Orange Add Expense button */}
        <button
          style={styles.addBtn}
          onClick={() => navigate('/expenses/add')}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--orange-dark)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--orange)'}
        >
          <span style={{ fontSize: 20, lineHeight: 1 }}>+</span>
          Add Expense
        </button>
      </div>

      {/* ── States ── */}
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchExpenses} />
      ) : expenses.length === 0 ? (
        <EmptyState onAdd={() => navigate('/expenses/add')} />
      ) : (
        // ── Expense Table ──
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Description</th>
                <th style={styles.th}>Items</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Total (₹)</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(expense => (
                <>
                  {/* ── Main row ── */}
                  <tr
                    key={expense.id}
                    style={styles.tr}
                    onClick={() => toggleExpand(expense.id)}
                    onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  >
                    {/* Date */}
                    <td style={styles.td}>
                      {new Date(expense.date).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>

                    {/* Category with color badge */}
                    <td style={styles.td}>
                      <span style={{
                        ...styles.categoryBadge,
                        ...getCategoryStyle(expense.category)
                      }}>
                        {expense.category}
                      </span>
                    </td>

                    {/* Description */}
                    <td style={{ ...styles.td, color: 'var(--text-secondary)', fontSize: 13 }}>
                      {expense.description || '—'}
                    </td>

                    {/* Items count + expand arrow */}
                    <td style={styles.td}>
                      <span style={styles.itemCount}>
                        {expense.items.length} item{expense.items.length !== 1 ? 's' : ''}
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                          {expandedId === expense.id ? ' ▲' : ' ▼'}
                        </span>
                      </span>
                    </td>

                    {/* Total */}
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <strong style={{ color: 'var(--text-primary)', fontSize: 15 }}>
                        ₹{expense.total.toFixed(2)}
                      </strong>
                    </td>

                    {/* Actions — stopPropagation so row click doesn't fire */}
                    <td
                      style={styles.td}
                      onClick={e => e.stopPropagation()}
                    >
                      <div style={styles.actions}>
                        <button
                          style={styles.editBtn}
                          onClick={() => navigate(`/expenses/edit/${expense.id}`)}
                        >
                          Edit
                        </button>
                        <button
                          style={styles.deleteBtn}
                          onClick={() => handleDelete(expense.id)}
                          disabled={deletingId === expense.id}
                        >
                          {deletingId === expense.id ? '…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* ── Expanded items row ── */}
                  {expandedId === expense.id && (
                    <tr key={`${expense.id}-items`} style={{ background: '#FAFAFA' }}>
                      <td colSpan={6} style={{ padding: '10px 16px 16px' }}>
                        <div style={styles.itemsGrid}>
                          {expense.items.map((item, i) => (
                            <div key={i} style={styles.itemCard}>
                              <span style={styles.itemSubject}>{item.subject}</span>
                              <span style={styles.itemAmount}>₹{item.amount.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div style={styles.center}>
      <div style={styles.spinner} />
      <p style={{ color: 'var(--text-muted)', marginTop: 12 }}>Loading…</p>
    </div>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <div style={styles.errorBox}>
      <p>{message}</p>
      <button style={styles.retryBtn} onClick={onRetry}>Retry</button>
    </div>
  )
}

function EmptyState({ onAdd }) {
  return (
    <div style={styles.center}>
      <div style={{ fontSize: 52, marginBottom: 12 }}>🧾</div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 8 }}>
        No expenses yet
      </h3>
      <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: 14 }}>
        Click "Add Expense" to log your first entry
      </p>
      <button
        style={styles.addBtn}
        onClick={onAdd}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--orange-dark)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--orange)'}
      >
        + Add Expense
      </button>
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────
function getCategoryStyle(category) {
  const map = {
    'Students':                      { background: '#EEF2FF', color: '#4F46E5' },
    'Office/Shopkeepers/Freelancer': { background: '#FFF7ED', color: '#C2410C' },
    'Housewives':                    { background: '#F0FDF4', color: '#15803D' },
  }
  return map[category] || { background: '#F3F4F6', color: '#6B7280' }
}

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = {
  page: { width: '100%' },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 28,
    flexWrap: 'wrap',
    gap: 16,
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 26,
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: 6,
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  count: { fontSize: 14, color: 'var(--text-secondary)' },
  totalBadge: {
    background: 'var(--orange-light)',
    color: 'var(--orange)',
    padding: '2px 10px',
    borderRadius: 99,
    fontSize: 13,
    fontWeight: 600,
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'var(--orange)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 10,
    padding: '11px 22px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s',
    fontFamily: 'var(--font-body)',
    boxShadow: 'var(--shadow-orange)',
  },
  tableWrapper: {
    background: '#fff',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow)',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    background: '#F9FAFB',
    borderBottom: '1px solid var(--border)',
  },
  tr: {
    borderBottom: '1px solid #F3F4F6',
    cursor: 'pointer',
    transition: 'background 0.15s',
    background: '#fff',
  },
  td: {
    padding: '14px 16px',
    fontSize: 14,
    verticalAlign: 'middle',
  },
  categoryBadge: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: 99,
    fontSize: 12,
    fontWeight: 600,
  },
  itemCount: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 13,
    color: 'var(--text-secondary)',
  },
  actions: { display: 'flex', gap: 8 },
  editBtn: {
    padding: '5px 14px',
    borderRadius: 'var(--radius-xs)',
    border: '1.5px solid var(--border)',
    background: '#fff',
    color: 'var(--text-primary)',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
  },
  deleteBtn: {
    padding: '5px 14px',
    borderRadius: 'var(--radius-xs)',
    border: '1.5px solid var(--danger-border)',
    background: 'var(--danger-light)',
    color: 'var(--danger)',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
  },
  itemsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  itemCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: '#fff',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '7px 14px',
  },
  itemSubject: { fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 },
  itemAmount:  { fontSize: 13, color: 'var(--orange)', fontWeight: 700 },
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  spinner: {
    width: 36, height: 36,
    borderRadius: '50%',
    border: '3px solid var(--border)',
    borderTopColor: 'var(--orange)',
    animation: 'spin 0.8s linear infinite',
  },
  errorBox: {
    textAlign: 'center',
    padding: 40,
    background: '#FFF5F5',
    borderRadius: 'var(--radius)',
    color: 'var(--danger)',
  },
  retryBtn: {
    marginTop: 12,
    padding: '8px 20px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--danger)',
    background: 'transparent',
    color: 'var(--danger)',
    cursor: 'pointer',
    fontSize: 13,
  },
}