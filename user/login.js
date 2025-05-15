const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const { sign } = require('../utils/jwt')

const { users } = require('./register')

router.post('/', async (req, res) => {
  const { email, password } = req.body
  const user = users.find(u => u.email === email)
  if (!user) return res.status(401).json({ message: 'Invalid credentials' })

  const match = await bcrypt.compare(password, user.password)
  if (!match) return res.status(401).json({ message: 'Invalid credentials' })

  const token = sign({ id: user.id, email: user.email })
  res.json({ message: 'Login successful', token })
})

module.exports = router
