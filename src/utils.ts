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

  noContentResult<TSuccess>(): TSuccess {
    this.setStatus(204);
    return undefined as unknown as TSuccess;
  }
}
