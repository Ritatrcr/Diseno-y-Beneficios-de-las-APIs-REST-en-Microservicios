const express = require('express');
const crypto = require('crypto');
const router = express.Router();

const payments = [];
let idCounter = 1;

// Middleware simulado de autenticación
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: 'No token provided' });
  req.user = { id: 'user123' }; // Simulación
  next();
};

// Crear un nuevo pago
router.post('/', authMiddleware, (req, res) => {
  const { amount, currency, payment_method, description } = req.body;

  // Validar campos obligatorios
  if (!amount || !currency || !payment_method || !description) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const payment = {
    payment_id: idCounter++,
    customer_id: req.user.id,
    amount,
    currency,
    payment_method,
    description,
    status: 'pending',
    created_at: new Date().toISOString()
  };

  payments.push(payment);

  res.status(201).json({
    ...payment,
    links: {
      self: `/api/payments/${payment.payment_id}`,
      webhook: `/api/payments/webhook`
    }
  });
});

// Obtener todos los pagos del usuario
router.get('/', authMiddleware, (req, res) => {
  const userPayments = payments.filter(p => p.customer_id === req.user.id);
  res.status(200).json(userPayments);
});

// Obtener un pago por ID
router.get('/:payment_id', authMiddleware, (req, res) => {
  const payment = payments.find(p => p.payment_id == req.params.payment_id);
  if (!payment) return res.status(404).json({ message: 'Payment not found' });
  res.status(200).json(payment);
});

// Webhook para actualizar estado del pago
router.put('/webhook', (req, res) => {
  const { event_type, data } = req.body;

  if (event_type !== 'payment_status_update' || !data?.payment_id || !data?.new_status) {
    return res.status(400).json({ message: "Invalid webhook data" });
  }

  const payment = payments.find(p => p.payment_id == data.payment_id);
  if (!payment) return res.status(404).json({ message: 'Payment not found' });

  const event_id = req.body.event_id || crypto.randomBytes(8).toString('hex');
  const timestamp = data.timestamp || new Date().toISOString();

  payment.status = data.new_status;
  payment.updated_at = timestamp;

  res.status(200).json({
    message: 'Payment status updated',
    event_id,
    timestamp
  });
});

// Eliminar un pago (solo si pertenece al usuario)
router.delete('/:payment_id', authMiddleware, (req, res) => {
  const index = payments.findIndex(p => p.payment_id == req.params.payment_id);
  if (index === -1) return res.status(404).json({ message: 'Payment not found' });

  if (payments[index].customer_id !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to delete this payment' });
  }

  payments.splice(index, 1);
  res.status(200).json({ message: 'Payment deleted successfully' });
});

module.exports = router;
