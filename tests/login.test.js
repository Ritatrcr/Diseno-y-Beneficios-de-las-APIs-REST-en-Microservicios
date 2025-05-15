const request = require('supertest');
const app = require('../index');

describe('POST /login', () => {
  it('debe iniciar sesión con credenciales correctas', async () => {
    await request(app).post('/register').send({
      username: 'testuser',
      email: 'login@example.com',
      password: 'password123',
    });

    const res = await request(app).post('/login').send({
      email: 'login@example.com',
      password: 'password123',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});
