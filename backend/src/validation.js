'use strict';

const { AppError } = require('./errors');

function validate(schema, location = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[location]);
    if (!result.success) {
      return next(new AppError(422, 'VALIDATION_ERROR', 'Request validation failed', result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message
      }))));
    }
    req[location] = result.data;
    return next();
  };
}

module.exports = { validate };
