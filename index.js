const express = require('express')
const app = express()

app.use(express.json())

app.use('/register', require('./user/register'))
app.use('/login', require('./user/login'))
app.use('/payments', require('./operaciones/payments'))
app.use('/refunds', require('./operaciones/refunds'))

module.exports = app

// test
