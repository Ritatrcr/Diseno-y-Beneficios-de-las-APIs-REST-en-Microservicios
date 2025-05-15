const express = require('express');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Usuarios simulados en memoria
const users = [];

router.post(
  '/',
  [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    body('username').notEmpty().withMessage('Username is required')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, email, password } = req.body;

    // Verificar si el correo ya existe
    const existingUser = users.find(u => u.email === email);
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });

    const newUser = { id: `user${users.length + 1}`, username, email, password };
    users.push(newUser);

    // Token simulado (normalmente usarías JWT real)
    const fakeToken = `fake-token-${newUser.id}`;

    res.status(201).json({ message: 'User registered successfully', token: fakeToken, user: newUser });
  }
);

module.exports = router;
