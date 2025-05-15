const request = require('supertest');
const express = require('express');
const loginRouter = require('../user/login');

const app = express();
app.use(express.json());
app.use('/login', loginRouter);

describe('Login API', () => {
  it('debe retornar error si faltan email o password', async () => {
    const res = await request(app).post('/login').send({ email: 'user1@example.com' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Email and password required');
  });

  it('debe retornar error si usuario no existe', async () => {
    const res = await request(app).post('/login').send({ email: 'noexiste@example.com', password: 'abc' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('User not found');
  });

  it('debe retornar error si contraseña es incorrecta', async () => {
    const res = await request(app).post('/login').send({ email: 'user1@example.com', password: 'wrongpass' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Invalid credentials');
  });

  it('debe hacer login correctamente y retornar token', async () => {
    const res = await request(app).post('/login').send({ email: 'user1@example.com', password: 'password1' });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Login successful');
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toMatchObject({
      id: 'user1',
      email: 'user1@example.com',
      username: 'UserOne',
      role: 'admin'
    });
  });
});
