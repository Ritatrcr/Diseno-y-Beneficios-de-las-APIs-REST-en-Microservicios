const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/authMiddleware')

const payments = []
let idCounter = 1

router.post('/', authMiddleware, (req, res) => {
  const { amount, currency, payment_method, description } = req.body
  if (!amount || !currency || !payment_method || !description) { return res.status(400).json({ message: 'Missing required fields' }) }

  const payment = {
    payment_id: idCounter++,
    customer_id: req.user.id,
    amount,
    currency,
    payment_method,
    description,
    status: 'pending',
    created_at: new Date().toISOString()
  }

  payments.push(payment)

  res.status(201).json({
    ...payment,
    links: {
      self: `/api/payments/${payment.payment_id}`,
      webhook: '/api/payments/webhook'
    }
  })
})

router.get('/', authMiddleware, (req, res) => {
  const userPayments = payments.filter(p => p.customer_id === req.user.id)
  res.json(userPayments)
})

router.get('/:payment_id', authMiddleware, (req, res) => {
  const payment = payments.find(p => p.payment_id === req.params.payment_id)
  if (!payment) return res.status(404).json({ message: 'Payment not found' })
  res.json(payment)
})

router.put('/webhook', (req, res) => {
  const { event_type, data } = req.body
  if (event_type !== 'payment_status_update' || !data?.payment_id || !data?.new_status) { return res.status(400).json({ message: 'Invalid webhook data' }) }

  const payment = payments.find(p => p.payment_id === data.payment_id)
  if (!payment) return res.status(404).json({ message: 'Payment not found' })

  payment.status = data.new_status
  payment.updated_at = new Date().toISOString()

  res.json({ message: 'Payment status updated' })
})

router.delete('/:payment_id', authMiddleware, (req, res) => {
  const index = payments.findIndex(p => p.payment_id === req.params.payment_id)
  if (index === -1) return res.status(404).json({ message: 'Payment not found' })

  if (payments[index].customer_id !== req.user.id) { return res.status(403).json({ message: 'Not authorized to delete this payment' }) }

  payments.splice(index, 1)
  res.json({ message: 'Payment deleted successfully' })
})

module.exports = router
