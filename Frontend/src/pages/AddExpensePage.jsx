// src/pages/AddExpensePage.jsx
// Form to create a new expense.
// User adds as many items as they want.
// Total updates live as amounts are typed.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import ExpenseForm from '../components/ExpenseForm'

export default function AddExpensePage() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  async function handleSave(formData) {
    setSaving(true)
    try {
      await api.post('/expenses', formData)
      navigate('/dashboard')
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ExpenseForm
      title="Add Expense"
      subtitle="Log what you spent, item by item"
      headerColor="linear-gradient(135deg, #FF6B2B 0%, #FF8C42 100%)"
      onSave={handleSave}
      onCancel={() => navigate('/dashboard')}
      saving={saving}
      saveLabel="Save Expense"
    />
  )
}