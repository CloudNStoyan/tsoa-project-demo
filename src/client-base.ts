export interface BaseParameterInfo {
  name: string;
  paramType: 'query' | 'path';
  enumValues?: string[];
}

export type ParameterInfo = (
  | {
      value: string;
      type: 'string';
      required: true;
    }
  | {
      value: number;
      type: 'number';
      required: true;
    }
  | {
      value: string | undefined;
      type: 'string';
      required: false;
    }
  | {
      value: number | undefined;
      type: 'number';
      required: false;
    }
) &
  BaseParameterInfo;

export type ParameterInfoArray = (
  | {
      values: string[];
      type: 'string';
      required: true;
    }
  | {
      values: number[];
      type: 'number';
      required: true;
    }
  | {
      values: string[] | undefined;
      type: 'string';
      required: false;
    }
  | {
      values: number[] | undefined;
      type: 'number';
      required: false;
    }
) &
  BaseParameterInfo;

export type UrlParam = (
  | {
      value: string;
      type: 'string';
      required: true;
    }
  | {
      value: number;
      type: 'number';
      required: true;
    }
  | {
      value: string | undefined;
      type: 'string';
      required: false;
    }
  | {
      value: number | undefined;
      type: 'number';
      required: false;
    }
) & { name: string };

export type UrlParamArray = (
  | { values: string[]; type: 'string'; required: true }
  | { values: number[]; type: 'number'; required: true }
  | { values: string[] | undefined; type: 'string'; required: false }
  | { values: number[] | undefined; type: 'number'; required: false }
) & { name: string };

export class ClientAPIBase {
  constructor(..._options: unknown[]) {}

  fetch<T = void>(..._args: Parameters<typeof fetch>) {
    return Promise.resolve() as Promise<T>;
  }

  validateParam({
    name,
    value,
    required,
    type,
    paramType,
    enumValues,
  }: ParameterInfo) {
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

  validateParamArray({
    name,
    values,
    required,
    type,
    paramType,
  }: ParameterInfoArray) {
    if (!Array.isArray(values)) {
      throw new Error(
        `Unexpected value type '${typeof values}' for ${paramType} param '${name}'.`
      );
    }

    for (const value of values) {
      this.validateParam({
        name,
        value,
        required,
        type,
        paramType,
      } as ParameterInfo);
    }
  }

  appendUrlParam(urlParams: URLSearchParams, { name, value, type }: UrlParam) {
    if (type === 'number') {
      if (value !== undefined) {
        urlParams.append(name, String(value));
      }
    }

    if (type === 'string') {
      if (value) {
        urlParams.append(name, value);
      }
    }
  }

  appendUrlParamArray(
    urlParams: URLSearchParams,
    { name, values, type }: UrlParamArray
  ) {
    if (Array.isArray(values)) {
      for (const value of values) {
        this.appendUrlParam(urlParams, {
          name,
          value,
          type,
        } as UrlParam);
      }
    }
  }
}
