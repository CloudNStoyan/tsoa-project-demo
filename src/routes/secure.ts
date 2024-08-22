import { Controller, Get, Route, Security, Tags, Request } from 'tsoa';
import type { Request as ExpressRequest } from 'express';

/**
 * An authenticated user.
 */
interface AuthUser {
  /**
   * The authenticated user's identifier.
   * @example 1
   * @isInt
   */
  id: number;

  /**
   * The authenticated user's name.
   * @example "Joe Done"
   */
  name: string;
}

/**
 * Express Request With User.
 */
interface ExpressRequestWithUser extends ExpressRequest {
  /**
   * Authenticated User.
   */
  user: AuthUser;
}

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
  getTreasure(@Request() request: ExpressRequestWithUser): Promise<AuthUser> {
    return Promise.resolve(request.user);
  }
}
