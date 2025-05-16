const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/authMiddleware')

// ↪️ vuelve a declarar tu almacenamiento en memoria
const payments = []
let idCounter = 1

// (opcional) si quieres idempotencia, pero no obligatoria:
const idempotencyStore = new Map()

router.post('/', authMiddleware, (req, res) => {
  // Idempotency-Key opcional: si vino y ya se procesó, devuelves la misma respuesta
  const idemKey = req.get('Idempotency-Key')
  if (idemKey && idempotencyStore.has(idemKey)) {
    return res.json(idempotencyStore.get(idemKey))
  }

  const { amount, currency, payment_method, description } = req.body
  if (!amount || !currency || !payment_method || !description) {
    return res.status(400).json({ message: 'Missing required fields' })
  }

  const payment = {
    payment_id:   idCounter++,
    customer_id:  req.user.id,
    amount,
    currency,
    payment_method,
    description,
    status:       'pending',
    created_at:   new Date().toISOString(),
  }

  payments.push(payment)

  const response = {
    ...payment,
    links: {
      self:    `/api/payments/${payment.payment_id}`,
      webhook: '/api/payments/webhook'
    }
  }

  // si vino Idempotency-Key, lo guardas
  if (idemKey) {
    idempotencyStore.set(idemKey, response)
  }

  res.status(201).json(response)
})

router.get('/', authMiddleware, (req, res) => {
  // ahora payments sí está definido
  const userPayments = payments.filter(p => p.customer_id === req.user.id)
  res.json(userPayments)
})

router.get('/:payment_id', authMiddleware, (req, res) => {
  const id = Number(req.params.payment_id)
  const payment = payments.find(p => p.payment_id === id)
  if (!payment) return res.status(404).json({ message: 'Payment not found' })
  res.json(payment)
})

router.put('/webhook', (req, res) => {
  const { event_type, data } = req.body
  if (event_type !== 'payment_status_update' || !data?.payment_id || !data?.new_status) {
    return res.status(400).json({ message: 'Invalid webhook data' })
  }

  const payment = payments.find(p => p.payment_id == data.payment_id)
  if (!payment) return res.status(404).json({ message: 'Payment not found' })

  payment.status     = data.new_status
  payment.updated_at = new Date().toISOString()

  res.json({ message: 'Payment status updated' })
})

router.delete('/:payment_id', authMiddleware, (req, res) => {
  const id = Number(req.params.payment_id)
  const index = payments.findIndex(p => p.payment_id === id)
  if (index === -1) return res.status(404).json({ message: 'Payment not found' })

  if (payments[index].customer_id !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to delete this payment' })
  }

  payments.splice(index, 1)
  res.json({ message: 'Payment deleted successfully' })
})

module.exports = router
