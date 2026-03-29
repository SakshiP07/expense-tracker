// src/pages/EditExpensePage.jsx
// Pre-fills the form with existing expense data.
// User can add/remove items. Total recalculates live.

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../utils/api'
import ExpenseForm from '../components/ExpenseForm'

export default function EditExpensePage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [initialData, setInitialData] = useState(null)
  const [fetching, setFetching]       = useState(true)
  const [saving, setSaving]           = useState(false)

  // Load existing expense to pre-fill the form
  useEffect(() => {
    api.get(`/expenses/${id}`)
      .then(res => setInitialData(res.data))
      .catch(() => {
        alert('Could not load this expense.')
        navigate('/dashboard')
      })
      .finally(() => setFetching(false))
  }, [id])

  async function handleSave(formData) {
    setSaving(true)
    try {
      await api.patch(`/expenses/${id}`, formData)
      navigate('/dashboard')
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update.')
    } finally {
      setSaving(false)
    }
  }

  if (fetching) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 80 }}>
        <div style={spinnerStyle} />
      </div>
    )
  }

  return (
    <ExpenseForm
      title="Edit Expense"
      subtitle="Update your expense details"
      headerColor="linear-gradient(135deg, #1A1D27 0%, #2D3142 100%)"
      initialData={initialData}
      onSave={handleSave}
      onCancel={() => navigate('/dashboard')}
      saving={saving}
      saveLabel="Update Expense"
    />
  )
}

const spinnerStyle = {
  width: 36, height: 36,
  borderRadius: '50%',
  border: '3px solid #E8EAF0',
  borderTopColor: '#FF6B2B',
  animation: 'spin 0.8s linear infinite',
}