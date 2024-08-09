import { Request, Response, NextFunction } from 'express';

/**
 * Logger Middleware.
 * @param _req Express Request.
 * @param _res Express Response.
 * @param next Express Next Function.
 * @example
 * `@`Middlewares(customLog)
 * export class Foo {}
 */
export async function customLog(
  _req: Request,
  _res: Response,
  next: NextFunction
) {
  console.log('IM MIDDLEWEARING RIGHT NOW!');
  next();
}
