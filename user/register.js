const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const { sign } = require('../utils/jwt')

const users = []

router.post('/', async (req, res) => {
  const { username, email, password } = req.body

  if (!username || !email || !password) { return res.status(400).json({ message: 'Missing fields' }) }

  const exists = users.find(u => u.email === email)
  if (exists) return res.status(400).json({ message: 'Email already exists' })

  const hashed = await bcrypt.hash(password, 10)
  const user = { id: `user${users.length + 1}`, username, email, password: hashed }
  users.push(user)

  const token = sign({ id: user.id, email: user.email })

  res.status(201).json({ message: 'User registered successfully', token, user })
})

module.exports = router
module.exports.users = users // Exportamos para acceder en login
