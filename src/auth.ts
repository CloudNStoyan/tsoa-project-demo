import type { Request } from 'express';
import { state } from './state.js';

export class AuthError extends Error {}

export function expressAuthentication(
  request: Request,
  securityName: string,
  _scopes?: string[]
) {
  if (securityName === 'api_key') {
    const authorization = request.get('authorization');

    let token;
    if (authorization) {
      const [tokenScheme, tokenValue] = authorization.split(' ');

      if (tokenScheme === 'Bearer') {
        token = tokenValue;
      } else {
        return Promise.reject(new AuthError("Token scheme must be 'Bearer'."));
      }
    }

    // This is where I'd put my scopes if I had any

    if (token === 'simple-pet-token') {
      return Promise.resolve(state.users[0]);
    } else {
      return Promise.reject(new AuthError('Invalid token.'));
    }
  }
}
