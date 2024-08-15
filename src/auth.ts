import type { Request } from 'express';

export class AuthError extends Error {}

/**
 * TSOA Authentication Module.
 * @param request      Express Request.
 * @param securityName The name of the security method.
 * @param scopes       Authentication scopes.
 * @returns            an user object that will be put in the request.user.
 */
export function expressAuthentication(
  request: Request,
  securityName: string,
  scopes?: string[]
) {
  if (securityName === 'api_key') {
    let token;
    if (request.query && request.query.access_token) {
      token = request.query.access_token;
    }

    console.log(scopes);

    if (token === 'my-encrypted-password-fr-fr') {
      return Promise.resolve({
        id: 1,
        name: 'Ironman',
      });
    } else {
      return Promise.reject(new AuthError('No token provided.'));
    }
  }
}
