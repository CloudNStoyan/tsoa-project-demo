import { Request, Response, NextFunction } from 'express';

export async function customLog(
  _req: Request,
  _res: Response,
  next: NextFunction
) {
  console.log('IM MIDDLEWEARING RIGHT NOW!');
  next();
}
