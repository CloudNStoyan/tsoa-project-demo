import { Controller, Get, Route, Security, Tags, Request } from 'tsoa';
import type { Request as ExpressRequest } from 'express';

interface AuthUser {
  id: number;
  name: string;
}

interface ExpressRequestWithUser extends ExpressRequest {
  user: AuthUser;
}

@Tags('Secure')
@Route('secure')
export class SecureController extends Controller {
  @Security('api_key', ['cat', 'dog'])
  @Get()
  getTreasure(@Request() request: ExpressRequestWithUser): Promise<AuthUser> {
    return Promise.resolve(request.user);
  }
}
