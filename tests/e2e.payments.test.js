// test/e2e.payments.test.js
const request = require('supertest')
const app     = require('../app')  

describe('Flujo completo de pagos', () => {
  let token, paymentId

  it('Registra un usuario y recibe token', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        username: 'testuser',
        email:    'test@example.com',
        password: 'password123'
      })
    expect(res.statusCode).toBe(201)
    expect(res.body.token).toBeDefined()
  })

  it('Hace login y extrae token', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'test@example.com', password: 'password123' })
    expect(res.statusCode).toBe(200)
    token = res.body.token
  })

  it('Crea un pago usando el token', async () => {
    const res = await request(app)
      .post('/payments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount:         50,
        currency:       'USD',
        payment_method: 'card',
        description:    'Compra prueba'
      })
    expect(res.statusCode).toBe(201)
    paymentId = res.body.payment_id
  })

  it('Actualiza el estado vía webhook', async () => {
    const res = await request(app)
      .put('/payments/webhook')
      .send({
        event_type: 'payment_status_update',
        data: {
          payment_id: paymentId,
          new_status: 'completed'
        }
      })
    expect(res.statusCode).toBe(200)
    expect(res.body.message).toBe('Payment status updated')
  })
})
