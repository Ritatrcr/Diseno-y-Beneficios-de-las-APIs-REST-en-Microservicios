const express = require('express');
const router = express.Router();

// Simulación de usuarios en memoria con password "plain text" para test
const users = [
  { id: 'user1', email: 'user1@example.com', password: 'password1', username: 'UserOne', role: 'admin' },
  { id: 'user2', email: 'user2@example.com', password: 'password2', username: 'UserTwo', role: 'user' },
];

// POST /login
router.post('/', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ message: 'User not found' });

  if (user.password !== password) return res.status(400).json({ message: 'Invalid credentials' });

  // Simulamos un token simple (en realidad usarías jwt)
  const token = `fake-jwt-token-for-${user.id}`;

  res.status(200).json({ message: 'Login successful', token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
});

module.exports = router;
