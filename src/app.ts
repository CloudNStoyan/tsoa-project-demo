import express, {
  json,
  urlencoded,
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
} from 'express';
import swaggerUi from 'swagger-ui-express';

import { ValidateError } from 'tsoa';
import { RegisterRoutes } from './generated/routes.js';
import { AuthError } from './auth.js';
import swaggerDoc from './generated/swagger.json' with { type: 'json' };

export const app = express();

app.use(
  urlencoded({
    extended: true,
  })
);

app.use(json());

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

RegisterRoutes(app);

// This should be after RegisterRoutes(app)
app.use(function ErrorHandler(
  err: unknown,
  req: ExpressRequest,
  res: ExpressResponse,
  next: NextFunction
) {
  if (err instanceof ValidateError) {
    console.warn(`Caught Validation Error for ${req.path}:`, err.fields);
    return res.status(422).json({
      message: 'Validation Failed',
      details: err?.fields,
    });
  }

  if (err instanceof AuthError) {
    return res.status(401).json({ status: 401, message: 'Access denied!' });
  }

  if (err instanceof Error) {
    console.error(err);
    return res.status(500).json({
      message: 'Internal Server Error',
    });
  }

  next();
});
