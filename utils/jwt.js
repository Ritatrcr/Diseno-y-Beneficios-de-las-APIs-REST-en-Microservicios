const jwt = require('jsonwebtoken')

const SECRET = 'mi_secreto_de_prueba'

function sign (payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '1h' })
}

function verify (token) {
  return jwt.verify(token, SECRET)
}

module.exports = { sign, verify, SECRET }
