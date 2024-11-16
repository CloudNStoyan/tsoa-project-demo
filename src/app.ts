import express, {
  type Request as ExpressRequest,
  type Response as ExpressResponse,
  type NextFunction,
  json,
  urlencoded,
} from 'express';
import swaggerUi from 'swagger-ui-express';
import { ValidationService } from 'tsoa';

import { AuthError } from './auth.js';
import { RegisterRoutes } from './generated/routes.js';

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
  async (_req: ExpressRequest, res: ExpressResponse) =>
    res.send(
      swaggerUi.generateHTML(
        (await import('./generated/swagger.json', { with: { type: 'json' } }))
          .default
      )
    )
);

// Disables TSOA's built-in validation (must be before RegisterRoutes)
// https://github.com/lukeautry/tsoa/issues/181#issuecomment-1487811378
ValidationService.prototype.ValidateParam = (
  _property,
  rawValue,
  _fieldErrors,
  _isBodyParam,
  _parent = false,
  _name = ''
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
) => rawValue;

// Disables TSOA's built-in validation (must be before RegisterRoutes)
// https://github.com/lukeautry/tsoa/issues/181#issuecomment-1487811378
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
RegisterRoutes.prototype.getValidatedArgs = (args: object, _request: unknown) =>
  Object.keys(args);

RegisterRoutes(app);

// This should be after RegisterRoutes(app)
app.use(
  (
    err: unknown,
    _req: ExpressRequest,
    res: ExpressResponse,
    next: NextFunction
    // eslint-disable-next-line consistent-return
  ) => {
    if (err instanceof AuthError) {
      return res.status(401).json({ status: 401, message: 'Access denied!' });
    }

    if (err instanceof Error) {
      // eslint-disable-next-line no-console
      console.error(err);
      return res.status(500).json({
        message: 'Internal Server Error',
      });
    }

    next();
  }
);
