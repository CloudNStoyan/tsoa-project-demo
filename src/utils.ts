import { Controller } from 'tsoa';

export interface ApiError {
  status: number;
  message: string;
}

export class BaseController extends Controller {
  errorResult<TSuccess>(status: number, error: Omit<ApiError, 'status'>) {
    this.setStatus(status);
    const errorWithStatus: ApiError = { ...error, status };
    return errorWithStatus as unknown as TSuccess;
  }
}
