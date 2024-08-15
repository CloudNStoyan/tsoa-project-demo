/// <reference path="./custom.d.ts" />
// tslint:disable
/**
 * tsoa-project-demo
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: 1.0.0
 *
 *
 * NOTE: This file is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the file manually.
 */

import * as url from 'url';
import * as isomorphicFetch from 'isomorphic-fetch';
import { Configuration } from './configuration';

const BASE_PATH = 'http://localhost:3000/'.replace(/\/+$/, '');

/**
 *
 * @export
 */
export const COLLECTION_FORMATS = {
  csv: ',',
  ssv: ' ',
  tsv: '\t',
  pipes: '|',
};

/**
 *
 * @export
 * @interface FetchAPI
 */
export interface FetchAPI {
  (url: string, init?: any): Promise<Response>;
}

/**
 *
 * @export
 * @interface FetchArgs
 */
export interface FetchArgs {
  url: string;
  options: any;
}

/**
 *
 * @export
 * @class BaseAPI
 */
export class BaseAPI {
  protected configuration: Configuration;

  constructor(
    configuration?: Configuration,
    protected basePath: string = BASE_PATH,
    protected fetch: FetchAPI = isomorphicFetch
  ) {
    if (configuration) {
      this.configuration = configuration;
      this.basePath = configuration.basePath || this.basePath;
    }
  }
}

/**
 *
 * @export
 * @class RequiredError
 * @extends {Error}
 */
export class RequiredError extends Error {
  name = 'RequiredError';
  constructor(
    public field: string,
    msg?: string
  ) {
    super(msg);
  }
}

/**
 *
 * @export
 * @interface ApiError
 */
export interface ApiError {
  /**
   *
   * @type {number}
   * @memberof ApiError
   */
  status: number;
  /**
   *
   * @type {string}
   * @memberof ApiError
   */
  message: string;
}
/**
 *
 * @export
 * @interface AuthUser
 */
export interface AuthUser {
  /**
   *
   * @type {number}
   * @memberof AuthUser
   */
  id: number;
  /**
   *
   * @type {string}
   * @memberof AuthUser
   */
  name: string;
}
/**
 * Stringified UUIDv4. See [RFC 4112](https://tools.ietf.org/html/rfc4122).
 * @export
 */
export type UUID = string;
/**
 *
 * @export
 * @interface User
 */
export interface User {
  /**
   *
   * @type {string}
   * @memberof User
   */
  id: string;
  /**
   * The email the user used to register his account.
   * @type {string}
   * @memberof User
   */
  email: string;
  /**
   * The name the user used to register his account.
   * @type {string}
   * @memberof User
   */
  name: string;
  /**
   * The happiness status of the user.
   * @type {string}
   * @memberof User
   */
  status?: User.StatusEnum;
  /**
   * The phone numbers associated with the user.
   * @type {Array<string>}
   * @memberof User
   */
  phoneNumbers: Array<string>;
}

/**
 * @export
 * @namespace User
 */
export namespace User {
  /**
   * @export
   * @enum {string}
   */
  export enum StatusEnum {
    Happy = <any>'Happy',
    Sad = <any>'Sad',
  }
}
/**
 * User objects allow you to associate actions performed in the system with the user that performed them. The User object contains common information across every user in the system regardless of status and role.
 * @export
 * @interface UserFromGroup
 */
export interface UserFromGroup {
  /**
   *
   * @type {string}
   * @memberof UserFromGroup
   */
  id: string;
  /**
   * The email the user used to register his account.
   * @type {string}
   * @memberof UserFromGroup
   */
  email: string;
  /**
   * The name the user used to register his account.
   * @type {string}
   * @memberof UserFromGroup
   */
  name: string;
  /**
   * The happiness status of the user.
   * @type {string}
   * @memberof UserFromGroup
   */
  status?: UserFromGroup.StatusEnum;
  /**
   * The phone numbers associated with the user.
   * @type {Array<string>}
   * @memberof UserFromGroup
   */
  phoneNumbers: Array<string>;
  /**
   *
   * @type {number}
   * @memberof UserFromGroup
   */
  groupId: number;
}

/**
 * @export
 * @namespace UserFromGroup
 */
export namespace UserFromGroup {
  /**
   * @export
   * @enum {string}
   */
  export enum StatusEnum {
    Happy = <any>'Happy',
    Sad = <any>'Sad',
  }
}
/**
 * CatApi - fetch parameter creator
 * @export
 */
export const CatApiFetchParamCreator = function (
  configuration?: Configuration
) {
  return {
    /**
     * Demonstrative cat endpoint that returns static data.
     * @summary Retrieve \"add :)\" from the server.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    postCat(options: any = {}): FetchArgs {
      const localVarPath = `/cats/add`;
      const localVarUrlObj = url.parse(localVarPath, true);
      const localVarRequestOptions = Object.assign({ method: 'POST' }, options);
      const localVarHeaderParameter = {} as any;
      const localVarQueryParameter = {} as any;

      localVarUrlObj.query = Object.assign(
        {},
        localVarUrlObj.query,
        localVarQueryParameter,
        options.query
      );
      // fix override query string Detail: https://stackoverflow.com/a/7517673/1077943
      localVarUrlObj.search = null;
      localVarRequestOptions.headers = Object.assign(
        {},
        localVarHeaderParameter,
        options.headers
      );

      return {
        url: url.format(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Demonstrative cat endpoint that returns dynamic data.
     * @summary Retrieve catId from the server.
     * @param {string} catId The identification of a cat.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    postCatId(catId: string, options: any = {}): FetchArgs {
      // verify required parameter 'catId' is not null or undefined
      if (catId === null || catId === undefined) {
        throw new RequiredError(
          'catId',
          'Required parameter catId was null or undefined when calling postCatId.'
        );
      }
      const localVarPath = `/cats/{catId}`.replace(
        `{${'catId'}}`,
        encodeURIComponent(String(catId))
      );
      const localVarUrlObj = url.parse(localVarPath, true);
      const localVarRequestOptions = Object.assign({ method: 'POST' }, options);
      const localVarHeaderParameter = {} as any;
      const localVarQueryParameter = {} as any;

      localVarUrlObj.query = Object.assign(
        {},
        localVarUrlObj.query,
        localVarQueryParameter,
        options.query
      );
      // fix override query string Detail: https://stackoverflow.com/a/7517673/1077943
      localVarUrlObj.search = null;
      localVarRequestOptions.headers = Object.assign(
        {},
        localVarHeaderParameter,
        options.headers
      );

      return {
        url: url.format(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
  };
};

/**
 * CatApi - functional programming interface
 * @export
 */
export const CatApiFp = function (configuration?: Configuration) {
  return {
    /**
     * Demonstrative cat endpoint that returns static data.
     * @summary Retrieve \"add :)\" from the server.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    postCat(
      options?: any
    ): (fetch?: FetchAPI, basePath?: string) => Promise<string> {
      const localVarFetchArgs =
        CatApiFetchParamCreator(configuration).postCat(options);
      return (
        fetch: FetchAPI = isomorphicFetch,
        basePath: string = BASE_PATH
      ) => {
        return fetch(
          basePath + localVarFetchArgs.url,
          localVarFetchArgs.options
        ).then((response) => {
          if (response.status >= 200 && response.status < 300) {
            return response.json();
          } else {
            throw response;
          }
        });
      };
    },
    /**
     * Demonstrative cat endpoint that returns dynamic data.
     * @summary Retrieve catId from the server.
     * @param {string} catId The identification of a cat.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    postCatId(
      catId: string,
      options?: any
    ): (fetch?: FetchAPI, basePath?: string) => Promise<string> {
      const localVarFetchArgs = CatApiFetchParamCreator(
        configuration
      ).postCatId(catId, options);
      return (
        fetch: FetchAPI = isomorphicFetch,
        basePath: string = BASE_PATH
      ) => {
        return fetch(
          basePath + localVarFetchArgs.url,
          localVarFetchArgs.options
        ).then((response) => {
          if (response.status >= 200 && response.status < 300) {
            return response.json();
          } else {
            throw response;
          }
        });
      };
    },
  };
};

/**
 * CatApi - factory interface
 * @export
 */
export const CatApiFactory = function (
  configuration?: Configuration,
  fetch?: FetchAPI,
  basePath?: string
) {
  return {
    /**
     * Demonstrative cat endpoint that returns static data.
     * @summary Retrieve \"add :)\" from the server.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    postCat(options?: any) {
      return CatApiFp(configuration).postCat(options)(fetch, basePath);
    },
    /**
     * Demonstrative cat endpoint that returns dynamic data.
     * @summary Retrieve catId from the server.
     * @param {string} catId The identification of a cat.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    postCatId(catId: string, options?: any) {
      return CatApiFp(configuration).postCatId(catId, options)(fetch, basePath);
    },
  };
};

/**
 * CatApi - object-oriented interface
 * @export
 * @class CatApi
 * @extends {BaseAPI}
 */
export class CatApi extends BaseAPI {
  /**
   * Demonstrative cat endpoint that returns static data.
   * @summary Retrieve \"add :)\" from the server.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof CatApi
   */
  public postCat(options?: any) {
    return CatApiFp(this.configuration).postCat(options)(
      this.fetch,
      this.basePath
    );
  }

  /**
   * Demonstrative cat endpoint that returns dynamic data.
   * @summary Retrieve catId from the server.
   * @param {string} catId The identification of a cat.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof CatApi
   */
  public postCatId(catId: string, options?: any) {
    return CatApiFp(this.configuration).postCatId(catId, options)(
      this.fetch,
      this.basePath
    );
  }
}
/**
 * SecureApi - fetch parameter creator
 * @export
 */
export const SecureApiFetchParamCreator = function (
  configuration?: Configuration
) {
  return {
    /**
     * Get the biggest treasure.
     * @summary Retrieve treasure.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getTreasure(options: any = {}): FetchArgs {
      const localVarPath = `/secure`;
      const localVarUrlObj = url.parse(localVarPath, true);
      const localVarRequestOptions = Object.assign({ method: 'GET' }, options);
      const localVarHeaderParameter = {} as any;
      const localVarQueryParameter = {} as any;

      // authentication api_key required
      if (configuration && configuration.apiKey) {
        const localVarApiKeyValue =
          typeof configuration.apiKey === 'function'
            ? configuration.apiKey('access_token')
            : configuration.apiKey;
        localVarQueryParameter['access_token'] = localVarApiKeyValue;
      }

      localVarUrlObj.query = Object.assign(
        {},
        localVarUrlObj.query,
        localVarQueryParameter,
        options.query
      );
      // fix override query string Detail: https://stackoverflow.com/a/7517673/1077943
      localVarUrlObj.search = null;
      localVarRequestOptions.headers = Object.assign(
        {},
        localVarHeaderParameter,
        options.headers
      );

      return {
        url: url.format(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
  };
};

/**
 * SecureApi - functional programming interface
 * @export
 */
export const SecureApiFp = function (configuration?: Configuration) {
  return {
    /**
     * Get the biggest treasure.
     * @summary Retrieve treasure.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getTreasure(
      options?: any
    ): (fetch?: FetchAPI, basePath?: string) => Promise<AuthUser> {
      const localVarFetchArgs =
        SecureApiFetchParamCreator(configuration).getTreasure(options);
      return (
        fetch: FetchAPI = isomorphicFetch,
        basePath: string = BASE_PATH
      ) => {
        return fetch(
          basePath + localVarFetchArgs.url,
          localVarFetchArgs.options
        ).then((response) => {
          if (response.status >= 200 && response.status < 300) {
            return response.json();
          } else {
            throw response;
          }
        });
      };
    },
  };
};

/**
 * SecureApi - factory interface
 * @export
 */
export const SecureApiFactory = function (
  configuration?: Configuration,
  fetch?: FetchAPI,
  basePath?: string
) {
  return {
    /**
     * Get the biggest treasure.
     * @summary Retrieve treasure.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getTreasure(options?: any) {
      return SecureApiFp(configuration).getTreasure(options)(fetch, basePath);
    },
  };
};

/**
 * SecureApi - object-oriented interface
 * @export
 * @class SecureApi
 * @extends {BaseAPI}
 */
export class SecureApi extends BaseAPI {
  /**
   * Get the biggest treasure.
   * @summary Retrieve treasure.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecureApi
   */
  public getTreasure(options?: any) {
    return SecureApiFp(this.configuration).getTreasure(options)(
      this.fetch,
      this.basePath
    );
  }
}
/**
 * UserApi - fetch parameter creator
 * @export
 */
export const UserApiFetchParamCreator = function (
  configuration?: Configuration
) {
  return {
    /**
     * Retrieves the details of a user. Supply the unique user ID from either and receive corresponding user details.
     * @summary Retrieve details of a user.
     * @param {string} userId The user&#x27;s identifier.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getUser(userId: string, options: any = {}): FetchArgs {
      // verify required parameter 'userId' is not null or undefined
      if (userId === null || userId === undefined) {
        throw new RequiredError(
          'userId',
          'Required parameter userId was null or undefined when calling getUser.'
        );
      }
      const localVarPath = `/users/{userId}`.replace(
        `{${'userId'}}`,
        encodeURIComponent(String(userId))
      );
      const localVarUrlObj = url.parse(localVarPath, true);
      const localVarRequestOptions = Object.assign({ method: 'GET' }, options);
      const localVarHeaderParameter = {} as any;
      const localVarQueryParameter = {} as any;

      localVarUrlObj.query = Object.assign(
        {},
        localVarUrlObj.query,
        localVarQueryParameter,
        options.query
      );
      // fix override query string Detail: https://stackoverflow.com/a/7517673/1077943
      localVarUrlObj.search = null;
      localVarRequestOptions.headers = Object.assign(
        {},
        localVarHeaderParameter,
        options.headers
      );

      return {
        url: url.format(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Retrieves the details of users. Supply the unique group ID from either and receive corresponding user details.
     * @summary Retrieve details of users.
     * @param {number} groupId The group&#x27;s identifier.
     * @param {number} [limit] Provide a limit to the result.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getUsers(groupId: number, limit?: number, options: any = {}): FetchArgs {
      // verify required parameter 'groupId' is not null or undefined
      if (groupId === null || groupId === undefined) {
        throw new RequiredError(
          'groupId',
          'Required parameter groupId was null or undefined when calling getUsers.'
        );
      }
      const localVarPath = `/users/{groupId}/all`.replace(
        `{${'groupId'}}`,
        encodeURIComponent(String(groupId))
      );
      const localVarUrlObj = url.parse(localVarPath, true);
      const localVarRequestOptions = Object.assign({ method: 'GET' }, options);
      const localVarHeaderParameter = {} as any;
      const localVarQueryParameter = {} as any;

      if (limit !== undefined) {
        localVarQueryParameter['limit'] = limit;
      }

      localVarUrlObj.query = Object.assign(
        {},
        localVarUrlObj.query,
        localVarQueryParameter,
        options.query
      );
      // fix override query string Detail: https://stackoverflow.com/a/7517673/1077943
      localVarUrlObj.search = null;
      localVarRequestOptions.headers = Object.assign(
        {},
        localVarHeaderParameter,
        options.headers
      );

      return {
        url: url.format(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Update the details of a user. Supply the unique user ID from either and receive corresponding user details.
     * @summary Update details of a user.
     * @param {User} body The user&#x27;s data.
     * @param {string} userId The user&#x27;s identifier.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateUser(body: User, userId: string, options: any = {}): FetchArgs {
      // verify required parameter 'body' is not null or undefined
      if (body === null || body === undefined) {
        throw new RequiredError(
          'body',
          'Required parameter body was null or undefined when calling updateUser.'
        );
      }
      // verify required parameter 'userId' is not null or undefined
      if (userId === null || userId === undefined) {
        throw new RequiredError(
          'userId',
          'Required parameter userId was null or undefined when calling updateUser.'
        );
      }
      const localVarPath = `/users/{userId}`.replace(
        `{${'userId'}}`,
        encodeURIComponent(String(userId))
      );
      const localVarUrlObj = url.parse(localVarPath, true);
      const localVarRequestOptions = Object.assign({ method: 'PUT' }, options);
      const localVarHeaderParameter = {} as any;
      const localVarQueryParameter = {} as any;

      localVarHeaderParameter['Content-Type'] = 'application/json';

      localVarUrlObj.query = Object.assign(
        {},
        localVarUrlObj.query,
        localVarQueryParameter,
        options.query
      );
      // fix override query string Detail: https://stackoverflow.com/a/7517673/1077943
      localVarUrlObj.search = null;
      localVarRequestOptions.headers = Object.assign(
        {},
        localVarHeaderParameter,
        options.headers
      );
      const needsSerialization =
        <any>'User' !== 'string' ||
        localVarRequestOptions.headers['Content-Type'] === 'application/json';
      localVarRequestOptions.body = needsSerialization
        ? JSON.stringify(body || {})
        : body || '';

      return {
        url: url.format(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
  };
};

/**
 * UserApi - functional programming interface
 * @export
 */
export const UserApiFp = function (configuration?: Configuration) {
  return {
    /**
     * Retrieves the details of a user. Supply the unique user ID from either and receive corresponding user details.
     * @summary Retrieve details of a user.
     * @param {string} userId The user&#x27;s identifier.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getUser(
      userId: string,
      options?: any
    ): (fetch?: FetchAPI, basePath?: string) => Promise<User> {
      const localVarFetchArgs = UserApiFetchParamCreator(configuration).getUser(
        userId,
        options
      );
      return (
        fetch: FetchAPI = isomorphicFetch,
        basePath: string = BASE_PATH
      ) => {
        return fetch(
          basePath + localVarFetchArgs.url,
          localVarFetchArgs.options
        ).then((response) => {
          if (response.status >= 200 && response.status < 300) {
            return response.json();
          } else {
            throw response;
          }
        });
      };
    },
    /**
     * Retrieves the details of users. Supply the unique group ID from either and receive corresponding user details.
     * @summary Retrieve details of users.
     * @param {number} groupId The group&#x27;s identifier.
     * @param {number} [limit] Provide a limit to the result.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getUsers(
      groupId: number,
      limit?: number,
      options?: any
    ): (fetch?: FetchAPI, basePath?: string) => Promise<Array<UserFromGroup>> {
      const localVarFetchArgs = UserApiFetchParamCreator(
        configuration
      ).getUsers(groupId, limit, options);
      return (
        fetch: FetchAPI = isomorphicFetch,
        basePath: string = BASE_PATH
      ) => {
        return fetch(
          basePath + localVarFetchArgs.url,
          localVarFetchArgs.options
        ).then((response) => {
          if (response.status >= 200 && response.status < 300) {
            return response.json();
          } else {
            throw response;
          }
        });
      };
    },
    /**
     * Update the details of a user. Supply the unique user ID from either and receive corresponding user details.
     * @summary Update details of a user.
     * @param {User} body The user&#x27;s data.
     * @param {string} userId The user&#x27;s identifier.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateUser(
      body: User,
      userId: string,
      options?: any
    ): (fetch?: FetchAPI, basePath?: string) => Promise<User> {
      const localVarFetchArgs = UserApiFetchParamCreator(
        configuration
      ).updateUser(body, userId, options);
      return (
        fetch: FetchAPI = isomorphicFetch,
        basePath: string = BASE_PATH
      ) => {
        return fetch(
          basePath + localVarFetchArgs.url,
          localVarFetchArgs.options
        ).then((response) => {
          if (response.status >= 200 && response.status < 300) {
            return response.json();
          } else {
            throw response;
          }
        });
      };
    },
  };
};

/**
 * UserApi - factory interface
 * @export
 */
export const UserApiFactory = function (
  configuration?: Configuration,
  fetch?: FetchAPI,
  basePath?: string
) {
  return {
    /**
     * Retrieves the details of a user. Supply the unique user ID from either and receive corresponding user details.
     * @summary Retrieve details of a user.
     * @param {string} userId The user&#x27;s identifier.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getUser(userId: string, options?: any) {
      return UserApiFp(configuration).getUser(userId, options)(fetch, basePath);
    },
    /**
     * Retrieves the details of users. Supply the unique group ID from either and receive corresponding user details.
     * @summary Retrieve details of users.
     * @param {number} groupId The group&#x27;s identifier.
     * @param {number} [limit] Provide a limit to the result.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getUsers(groupId: number, limit?: number, options?: any) {
      return UserApiFp(configuration).getUsers(
        groupId,
        limit,
        options
      )(fetch, basePath);
    },
    /**
     * Update the details of a user. Supply the unique user ID from either and receive corresponding user details.
     * @summary Update details of a user.
     * @param {User} body The user&#x27;s data.
     * @param {string} userId The user&#x27;s identifier.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateUser(body: User, userId: string, options?: any) {
      return UserApiFp(configuration).updateUser(
        body,
        userId,
        options
      )(fetch, basePath);
    },
  };
};

/**
 * UserApi - object-oriented interface
 * @export
 * @class UserApi
 * @extends {BaseAPI}
 */
export class UserApi extends BaseAPI {
  /**
   * Retrieves the details of a user. Supply the unique user ID from either and receive corresponding user details.
   * @summary Retrieve details of a user.
   * @param {string} userId The user&#x27;s identifier.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UserApi
   */
  public getUser(userId: string, options?: any) {
    return UserApiFp(this.configuration).getUser(userId, options)(
      this.fetch,
      this.basePath
    );
  }

  /**
   * Retrieves the details of users. Supply the unique group ID from either and receive corresponding user details.
   * @summary Retrieve details of users.
   * @param {number} groupId The group&#x27;s identifier.
   * @param {number} [limit] Provide a limit to the result.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UserApi
   */
  public getUsers(groupId: number, limit?: number, options?: any) {
    return UserApiFp(this.configuration).getUsers(
      groupId,
      limit,
      options
    )(this.fetch, this.basePath);
  }

  /**
   * Update the details of a user. Supply the unique user ID from either and receive corresponding user details.
   * @summary Update details of a user.
   * @param {User} body The user&#x27;s data.
   * @param {string} userId The user&#x27;s identifier.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UserApi
   */
  public updateUser(body: User, userId: string, options?: any) {
    return UserApiFp(this.configuration).updateUser(
      body,
      userId,
      options
    )(this.fetch, this.basePath);
  }
}
