export class ClientAPIBase {
  constructor(..._options: unknown[]) {}

  fetch<T = void>(_input: RequestInfo | URL, _init?: RequestInit) {
    return Promise.resolve() as Promise<T>;
  }
}
