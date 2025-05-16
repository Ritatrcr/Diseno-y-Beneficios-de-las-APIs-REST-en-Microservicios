const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/authMiddleware')

// ↪️ declara tu almacenamiento en memoria
const refunds = []
let idCounter = 1

// Crear un reembolso
router.post('/', authMiddleware, (req, res) => {
  const { payment_id, reason } = req.body

  if (!payment_id || !reason) {
    return res.status(400).json({ message: 'payment_id and reason are required' })
  }

  const refund = {
    refund_id:   idCounter++,
    payment_id,
    customer_id: req.user.id,
    reason,
    status:      'pending',
    created_at:  new Date().toISOString()
  }

  refunds.push(refund)
  return res.status(201).json(refund)
})

// Listar todos los reembolsos del usuario autenticado
router.get('/', authMiddleware, (req, res) => {
  const userRefunds = refunds.filter(r => r.customer_id === req.user.id)
  return res.json(userRefunds)
})

module.exports = router
