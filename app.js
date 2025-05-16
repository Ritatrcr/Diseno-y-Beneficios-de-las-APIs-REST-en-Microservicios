const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { errors } = require('celebrate');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middlewares globales
app.use(express.json());
app.use(helmet());
app.use(rateLimit({ windowMs: 60_000, max: 60 }));
app.use(morgan('combined', { stream: { write: msg => require('./logger').info(msg.trim()) } }));

// Rutas versionadas
app.use('/register', require('./user/register'));
app.use('/login', require('./user/login'));
app.use('/payments', require('./operaciones/payments'));
app.use('/refunds', require('./operaciones/refunds'));

// Observabilidad: healthcheck y métricas
const client = require('prom-client');
client.collectDefaultMetrics();
app.get('/health', (_req, res) => res.send('OK'));
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// Manejo de errores de validación
app.use(errors());

module.exports = app;