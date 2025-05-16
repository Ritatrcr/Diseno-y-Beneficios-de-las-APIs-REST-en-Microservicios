const { Joi, Segments } = require('celebrate');

exports.login = {
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required()
  })
};