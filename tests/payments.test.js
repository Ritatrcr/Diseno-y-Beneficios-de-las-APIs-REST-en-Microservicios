const request = require('supertest')
const app = require('../index')

let token
let paymentId

beforeAll(async () => {
  await request(app).post('/register').send({
    username: 'payer',
    email: 'payer@example.com',
    password: 'password123'
  })

  const login = await request(app).post('/login').send({
    email: 'payer@example.com',
    password: 'password123'
  })

  token = login.body.token
})

describe('Payments', () => {
  it('debe crear un pago', async () => {
    const res = await request(app)
      .post('/payments')
      .set('Authorization', 'Bearer ' + token)
      .send({
        amount: 50,
        currency: 'USD',
        payment_method: 'card',
        description: 'Pago prueba'
      })

    expect(res.statusCode).toBe(201)
    paymentId = res.body.payment_id
  })

  it('debe obtener pagos', async () => {
    const res = await request(app).get('/payments').set('Authorization', 'Bearer ' + token)
    expect(res.statusCode).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
  })

  it('debe eliminar pago', async () => {
    const res = await request(app)
      .delete('/payments/' + paymentId)
      .set('Authorization', 'Bearer ' + token)

    expect(res.statusCode).toBe(200)
  })
})
