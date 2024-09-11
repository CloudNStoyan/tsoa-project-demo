import express, {
  json,
  urlencoded,
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
} from 'express';
import swaggerUi from 'swagger-ui-express';

import { ValidationService } from 'tsoa';
import { RegisterRoutes } from './generated/routes.js';
import { AuthError } from './auth.js';

export const app = express();

app.use(
  urlencoded({
    extended: true,
  })
);

app.use(json());

app.use(
  '/docs',
  swaggerUi.serve,
  async (_req: ExpressRequest, res: ExpressResponse) => {
    return res.send(
      swaggerUi.generateHTML(
        (await import('./generated/swagger.json', { with: { type: 'json' } }))
          .default
      )
    );
  }
);

// Disables TSOA's built-in validation (must be before RegisterRoutes)
ValidationService.prototype.ValidateParam = (
  _property,
  rawValue,
  _name = '',
  _fieldErrors,
  _isBodyParam,
  _parent = ''
) => rawValue;

// Disables TSOA's built-in validation (must be before RegisterRoutes)
RegisterRoutes.prototype.getValidatedArgs = (args: {}, _request: unknown) =>
  Object.keys(args);

RegisterRoutes(app);

// This should be after RegisterRoutes(app)
app.use(function ErrorHandler(
  err: unknown,
  _req: ExpressRequest,
  res: ExpressResponse,
  next: NextFunction
) {
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
