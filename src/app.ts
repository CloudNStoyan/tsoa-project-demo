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
  '/docs/swagger.json',
  async (_req: ExpressRequest, res: ExpressResponse) => {
    return res.send(
      (await import('./generated/swagger.json', { with: { type: 'json' } }))
        .default
    );
  }
);

app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(
    // we need to pass it something, preferably that would be `null` but the
    // types of `swaggerUi.setup` don't allow `null` so we use an empty object.
    {},
    {
      swaggerOptions: {
        url: '/docs/swagger.json',
      },
    }
  )
);

// Disables TSOA's built-in validation (must be before RegisterRoutes)
// https://github.com/lukeautry/tsoa/issues/181#issuecomment-1487811378
ValidationService.prototype.ValidateParam = (
  _property,
  rawValue,
  _name = '',
  _fieldErrors,
  _isBodyParam,
  _parent = ''
) => rawValue;

// Disables TSOA's built-in validation (must be before RegisterRoutes)
// https://github.com/lukeautry/tsoa/issues/181#issuecomment-1487811378
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
