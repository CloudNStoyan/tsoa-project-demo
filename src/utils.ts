import { Controller } from 'tsoa';

export interface ApiError {
  status: number;
  message: string;
}

export class BaseController extends Controller {
  errorResult<TSuccess>(
    status: number,
    error: Omit<ApiError, 'status'>
  ): TSuccess {
    this.setStatus(status);
    const errorWithStatus: ApiError = { ...error, status };
    return errorWithStatus as unknown as TSuccess;
  }

  noContentResult<TSuccess>(): TSuccess {
    this.setStatus(204);
    return undefined as unknown as TSuccess;
  }
}

/**
 * Function to slice an array given a limit and offset
 * @param array input array
 * @param limit how many records to return
 * @param offset offset to discard elements
 * @returns sliced array or empty if input is null or has length = 0 or even if the params (limit/offset) exceeds the array length
 */
export function limitOffset<T>(array: T[], limit: number, offset: number): T[] {
  if (!array) return [];

  const length = array.length;

  if (!length) {
    return [];
  }
  if (offset > length - 1) {
    return [];
  }

  const start = Math.min(length - 1, offset);
  const end = Math.min(length, offset + limit);

  return array.slice(start, end);
}
