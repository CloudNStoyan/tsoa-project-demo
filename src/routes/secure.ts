import { Controller, Get, Route, Security, Tags, Request } from 'tsoa';
import type { Request as ExpressRequest } from 'express';

@Tags('Secure')
@Route('secure')
export class SecureController extends Controller {
  @Security('api_key', ['cat', 'dog'])
  @Get()
  getTreasure(
    @Request() request: ExpressRequest & { user: { id: number; name: string } }
  ): Promise<{ id: number; name: string }> {
    return Promise.resolve(request.user);
  }
}
