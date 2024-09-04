export interface BaseParameterInfo {
  name: string;
  paramType: 'query' | 'path';
  enumValues?: string[];
}

export interface BaseUrlParam {
  name: string;
  type: 'string' | 'number';
}

export class ClientAPIBase {
  constructor(..._options: unknown[]) {}

  fetch<T = void>(..._args: Parameters<typeof fetch>) {
    return Promise.resolve() as Promise<T>;
  }

  validateParam(
    value: string,
    meta: { required: true; type: 'string' } & BaseParameterInfo
  ): void;
  validateParam(
    value: string | undefined,
    meta: { required: false; type: 'string' } & BaseParameterInfo
  ): void;
  validateParam(
    value: number,
    meta: { required: true; type: 'number' } & BaseParameterInfo
  ): void;
  validateParam(
    value: number | undefined,
    meta: { required: false; type: 'number' } & BaseParameterInfo
  ): void;
  validateParam(
    value: string | number | undefined,
    meta: { required: boolean; type: 'string' | 'number' } & BaseParameterInfo
  ): void;
  validateParam(
    value: string | number | undefined,
    meta: {
      required: boolean;
      type: 'string' | 'number';
    } & BaseParameterInfo
  ): void {
    const { name, required, type, paramType, enumValues } = meta;

    switch (type) {
      case 'number': {
        if (required) {
          if (typeof value !== 'number') {
            throw new Error(
              `Required ${paramType} param '${name}' did not have a value of type 'number'. Type: '${typeof value}', Value: '${value}'.`
            );
          }
        } else {
          if (typeof value !== 'number' && typeof value !== 'undefined') {
            throw new Error(
              `Optional ${paramType} param '${name}' did not have a value of type 'number' or 'undefined'. Type: '${typeof value}', Value: '${value}'.`
            );
          }
        }

        if (Number.isNaN(value)) {
          throw new Error(
            `Invalid value NaN for ${paramType} param '${name}'.`
          );
        }
        break;
      }
      case 'string': {
        if (required) {
          if (typeof value !== 'string') {
            throw new Error(
              `Required ${paramType} param '${name}' did not have a value of type 'string'. Type: '${typeof value}', Value: '${value}'.`
            );
          }

          if (!value) {
            throw new Error(
              `Required ${paramType} param '${name}' was not a truthy string value.`
            );
          }

          if (Array.isArray(enumValues) && !enumValues.includes(value)) {
            throw new Error(
              `Required ${paramType} param '${name}' has invalid enum value '${value}'. Allowed values are '${enumValues.join(', ')}'`
            );
          }
        } else {
          if (typeof value !== 'string' && typeof value !== 'undefined') {
            throw new Error(
              `Optional ${paramType} param '${name}' did not have a value of type 'string' or 'undefined'. Type: '${typeof value}', Value: '${value}'.`
            );
          }

          if (typeof value === 'string') {
            if (!value) {
              throw new Error(
                `Optional ${paramType} param '${name}' was not a truthy string value.`
              );
            }

            if (Array.isArray(enumValues) && !enumValues.includes(value)) {
              throw new Error(
                `Optional ${paramType} param '${name}' has invalid enum value '${value}'. Allowed values are '${enumValues.join(', ')}'`
              );
            }
          }
        }
        break;
      }
      default: {
        throw new Error(
          `Unexpected value type '${type}' for ${paramType} param '${name}'.`
        );
      }
    }
  }

  validateParamArray(
    values: string[],
    meta: { required: true; type: 'string' } & BaseParameterInfo
  ): void;
  validateParamArray(
    values: string[] | undefined,
    meta: { required: false; type: 'string' } & BaseParameterInfo
  ): void;
  validateParamArray(
    values: number[],
    meta: { required: true; type: 'number' } & BaseParameterInfo
  ): void;
  validateParamArray(
    values: number[] | undefined,
    meta: { required: false; type: 'number' } & BaseParameterInfo
  ): void;
  validateParamArray(
    values: string[] | number[] | undefined,
    meta: { required: boolean; type: 'string' | 'number' } & BaseParameterInfo
  ): void {
    const { name, required, type, paramType } = meta;

    if (!Array.isArray(values)) {
      throw new Error(
        `Unexpected value type '${typeof values}' for ${paramType} param '${name}'.`
      );
    }

    for (const value of values) {
      this.validateParam(value, {
        name,
        required,
        type,
        paramType,
      });
    }
  }

  appendUrlParam(
    urlParams: URLSearchParams,
    value: number | undefined,
    meta: BaseUrlParam & { type: 'number' }
  ): void;
  appendUrlParam(
    urlParams: URLSearchParams,
    value: string | undefined,
    meta: BaseUrlParam & { type: 'string' }
  ): void;
  appendUrlParam(
    urlParams: URLSearchParams,
    value: string | number | undefined,
    meta: BaseUrlParam
  ): void;
  appendUrlParam(
    urlParams: URLSearchParams,
    value: string | number | undefined,
    meta: BaseUrlParam
  ): void {
    const { name, type } = meta;

    if (type === 'number') {
      if (value !== undefined) {
        urlParams.append(name, String(value));
      }
    }

    if (type === 'string') {
      if (value && typeof value === 'string') {
        urlParams.append(name, value);
      }
    }
  }

  appendUrlParamArray(
    urlParams: URLSearchParams,
    values: number[] | undefined,
    meta: BaseUrlParam & { type: 'number' }
  ): void;
  appendUrlParamArray(
    urlParams: URLSearchParams,
    values: string[] | undefined,
    meta: BaseUrlParam & { type: 'string' }
  ): void;
  appendUrlParamArray(
    urlParams: URLSearchParams,
    values: string[] | number[] | undefined,
    meta: BaseUrlParam
  ): void {
    const { name, type } = meta;

    if (Array.isArray(values)) {
      for (const value of values) {
        this.appendUrlParam(urlParams, value, {
          name,
          type,
        });
      }
    }
  }
}
