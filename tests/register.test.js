const request = require('supertest')
const app = require('../app')
const jwt = require('jsonwebtoken')

describe('POST /register', () => {
  it('debe registrar un usuario y devolver token', async () => {
    const res = await request(app).post('/register').send({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    })

    expect(res.statusCode).toBe(201)
    expect(res.body.token).toBeDefined()

    const payload = jwt.verify(res.body.token, 'mi_secreto_de_prueba')
    expect(payload.email).toBe('test@example.com')
  })
})
