import { Controller, Get, Route, Security, Tags, Request, Example } from 'tsoa';
import type { Request as ExpressRequest } from 'express';

interface AuthUser {
  id: number;
  name: string;
}

interface ExpressRequestWithUser extends ExpressRequest {
  user: AuthUser;
}

/**
 * Secure operations.
 */
@Tags('Secure')
@Route('secure')
export class SecureController extends Controller {
  /**
   * Get the biggest treasure.
   * @param request ExpressRequestWithUser that is automatically applied.
   * @returns       An AuthUser.
   * @summary       Retrieve treasure.
   */
  @Security('api_key', ['cat', 'dog'])
  @Get()
  @Example<AuthUser>(
    { id: 1, name: 'AuthenticatedUser' },
    'An example of AuthUser.'
  )
  getTreasure(@Request() request: ExpressRequestWithUser): Promise<AuthUser> {
    return Promise.resolve(request.user);
  }
}
