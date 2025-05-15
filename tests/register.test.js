const request = require('supertest');
const express = require('express');
const registerRouter = require('../user/register');

const app = express();
app.use(express.json());
app.use('/register', registerRouter);

describe('Register API', () => {
  it('debe validar campos requeridos y retornar errores', async () => {
    const res = await request(app).post('/register').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('debe registrar un usuario correctamente', async () => {
    const res = await request(app).post('/register').send({
      username: 'TestUser',
      email: 'test@example.com',
      password: 'testpass123'
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('User registered successfully');
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('test@example.com');
  });

  it('debe rechazar un email duplicado', async () => {
    await request(app).post('/register').send({
      username: 'User1',
      email: 'duplicate@example.com',
      password: 'password123'
    });

    const res = await request(app).post('/register').send({
      username: 'User2',
      email: 'duplicate@example.com',
      password: 'password123'
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Email already exists');
  });
});
