const request = require('supertest');
const express = require('express');
const refundsRouter = require('../operaciones/refunds');

const app = express();
app.use(express.json());
app.use('/refunds', refundsRouter);

const token = 'mocked_token';
let createdRefundId;

describe('Refunds API', () => {
  it('debe crear un nuevo reembolso', async () => {
    const res = await request(app)
      .post('/refunds')
      .set('Authorization', token)
      .send({
        payment_id: 'payment1',
        amount: 100,
        reason: 'Producto defectuoso'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.refund_id).toBeDefined();
    createdRefundId = res.body.refund_id;
  });

  it('debe obtener todos los reembolsos del usuario', async () => {
    const res = await request(app)
      .get('/refunds')
      .set('Authorization', token);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('debe obtener un reembolso por ID', async () => {
    const res = await request(app)
      .get(`/refunds/${createdRefundId}`)
      .set('Authorization', token);

    expect(res.statusCode).toBe(200);
    expect(res.body.refund_id).toBe(createdRefundId);
  });

  it('debe actualizar el estado del reembolso vía webhook', async () => {
    const res = await request(app)
      .put('/refunds/webhook')
      .send({
        event_type: 'refund_status_update',
        data: {
          refund_id: createdRefundId,
          new_status: 'approved'
        }
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Refund status updated');
  });

  it('debe eliminar un reembolso', async () => {
    const res = await request(app)
      .delete(`/refunds/${createdRefundId}`)
      .set('Authorization', token);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Refund deleted successfully');
  });
});
