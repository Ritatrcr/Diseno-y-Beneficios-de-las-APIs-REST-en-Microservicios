const express = require('express');
const crypto = require('crypto');
const router = express.Router();

const refunds = [];
let refundIdCounter = 1;

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: 'No token provided' });
  req.user = { id: 'user123' };
  next();
};

// Crear reembolso
router.post('/', authMiddleware, (req, res) => {
  const { payment_id, amount, reason } = req.body;
  if (!payment_id || !amount || !reason) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  const refund = {
    refund_id: refundIdCounter++,
    customer_id: req.user.id,
    payment_id,
    amount,
    reason,
    status: 'pending',
    created_at: new Date().toISOString()
  };
  refunds.push(refund);
  res.status(201).json({ refund_id: refund.refund_id });
});

// Obtener todos los reembolsos del usuario
router.get('/', authMiddleware, (req, res) => {
  const userRefunds = refunds.filter(r => r.customer_id === req.user.id);
  res.status(200).json(userRefunds);
});

// Obtener reembolso por ID
router.get('/:refund_id', authMiddleware, (req, res) => {
  const refund = refunds.find(r => r.refund_id == req.params.refund_id);
  if (!refund) return res.status(404).json({ message: 'Refund not found' });
  if (refund.customer_id !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
  res.status(200).json(refund);
});

// Webhook actualizar estado
router.put('/webhook', (req, res) => {
  const { event_type, data } = req.body;
  if (event_type !== 'refund_status_update' || !data?.refund_id || !data?.new_status) {
    return res.status(400).json({ message: "Invalid webhook data" });
  }
  const refund = refunds.find(r => r.refund_id == data.refund_id);
  if (!refund) return res.status(404).json({ message: 'Refund not found' });

  refund.status = data.new_status;
  refund.updated_at = new Date().toISOString();

  res.status(200).json({ message: 'Refund status updated' });
});

// Eliminar reembolso
router.delete('/:refund_id', authMiddleware, (req, res) => {
  const index = refunds.findIndex(r => r.refund_id == req.params.refund_id);
  if (index === -1) return res.status(404).json({ message: 'Refund not found' });
  if (refunds[index].customer_id !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to delete this refund' });
  }
  refunds.splice(index, 1);
  res.status(200).json({ message: 'Refund deleted successfully' });
});

module.exports = router;
