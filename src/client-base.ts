export class ClientAPIBase {
  constructor(..._options: unknown[]) {}

  fetch<T = void>(..._args: Parameters<typeof fetch>) {
    return Promise.resolve() as Promise<T>;
  }
}
