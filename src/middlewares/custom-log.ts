import type { NextFunction, Request, Response } from 'express';

/**
 * Logger Middleware.
 * @param _req Express Request.
 * @param _res Express Response.
 * @param next Express Next Function.
 * @example
 * `@`Middlewares(customLog)
 * export class Foo {}
 */
// eslint-disable-next-line @typescript-eslint/require-await
export async function customLog(
  _req: Request,
  _res: Response,
  next: NextFunction
) {
  // eslint-disable-next-line no-console
  console.log('IM MIDDLEWEARING RIGHT NOW!');
  next();
}
