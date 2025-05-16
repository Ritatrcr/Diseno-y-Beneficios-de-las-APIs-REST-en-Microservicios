const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'Payments API', version: '1.0.0' },
    components: {
      securitySchemes: {
        BearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    },
    security: [{ BearerAuth: [] }]
  },
  apis: ['./routes/*.js']
};

const spec = swaggerJSDoc(options);
module.exports = [swaggerUi.serve, swaggerUi.setup(spec)];