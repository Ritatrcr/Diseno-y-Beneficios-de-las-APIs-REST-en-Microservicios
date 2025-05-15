const request = require('supertest')
const app = require('../index')

let token

beforeAll(async () => {
  await request(app).post('/register').send({
    username: 'refunduser',
    email: 'refunduser@example.com',
    password: 'password123'
  })

  const login = await request(app).post('/login').send({
    email: 'refunduser@example.com',
    password: 'password123'
  })

  token = login.body.token
})

describe('Refunds', () => {
  it('debe crear un reembolso', async () => {
    const res = await request(app)
      .post('/refunds')
      .set('Authorization', 'Bearer ' + token)
      .send({
        payment_id: 1,
        reason: 'Producto defectuoso'
      })

    expect(res.statusCode).toBe(201)
    expect(res.body).toHaveProperty('refund_id')
    expect(res.body.status).toBe('pending')
  })

  it('debe listar los reembolsos del usuario', async () => {
    const res = await request(app)
      .get('/refunds')
      .set('Authorization', 'Bearer ' + token)

    expect(res.statusCode).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })
})
