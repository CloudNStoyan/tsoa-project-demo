import { ClientAPIBase } from '../../client-base.js';

/**
 * Happiness Status Enum that is very important.
 */
export enum HappinessStatus {
  Happy = 'Happy',
  Sad = 'Sad',
}

/**
 * Stringified UUIDv4.
 * See [RFC 4112](https://tools.ietf.org/html/rfc4122).
 * @pattern [0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-4[0-9A-Fa-f]{3}-[89ABab][0-9A-Fa-f]{3}-[0-9A-Fa-f]{12}
 * @format uuid
 * @example "66ef17a1-af37-4f7b-8e82-b341e0241a30"
 */
export type UUID = string;

export interface ApiError {
  /**
   * @format double
   */
  status: number;

  message: string;
}

/**
 * User objects allow you to associate actions performed
 * in the system with the user that performed them.
 * The User object contains common information across
 * every user in the system regardless of status and role.
 */
export interface UserFromGroup {
  /**
   * The user's identifier.
   * @example "66ef17a1-af37-4f7b-8e82-b341e0241a30"
   */
  id: UUID;

  /**
   * The email the user used to register his account.
   * @example "jane@doe.com"
   */
  email: string;

  /**
   * The name the user used to register his account.
   * @example "Jane Doe The First"
   */
  name: string;

  /**
   * Is the user a cat.
   */
  isCat: boolean;

  /**
   * The happiness status of the user.
   * @example "Sad"
   */
  status?: HappinessStatus;

  /**
   * An array of happiness statuses of the user.
   * @example []
   */
  manyStatuses?: Array<HappinessStatus>;

  /**
   * The cat level of the user.
   * @example "Ultra Cat"
   */
  catLevel?: 'Ultra Cat' | 'Mega Cat';

  /**
   * The cat index of the user.
   * @example "cat index"
   */
  catIndex?: Array<
    string | number | HappinessStatus | (string | (string | HappinessStatus))
  >;

  /**
   * The phone numbers associated with the user.
   * @example []
   */
  phoneNumbers: Array<string>;

  /**
   * @format int32
   * @example 113
   */
  groupId: number;
}

/**
 * User description written by yours truly Stoyan.
 */
export interface User {
  /**
   * The user's identifier.
   * @example "66ef17a1-af37-4f7b-8e82-b341e0241a30"
   */
  id: UUID;

  /**
   * The email the user used to register his account.
   * @example "jane@doe.com"
   */
  email: string;

  /**
   * The name the user used to register his account.
   * @example "Jane Doe The First"
   */
  name: string;

  /**
   * Is the user a cat.
   */
  isCat: boolean;

  /**
   * The happiness status of the user.
   * @example "Sad"
   */
  status?: HappinessStatus;

  /**
   * An array of happiness statuses of the user.
   * @example []
   */
  manyStatuses?: Array<HappinessStatus>;

  /**
   * The cat level of the user.
   * @example "Ultra Cat"
   */
  catLevel?: 'Ultra Cat' | 'Mega Cat';

  /**
   * The cat index of the user.
   * @example "cat index"
   */
  catIndex?: Array<
    string | number | HappinessStatus | (string | (string | HappinessStatus))
  >;

  /**
   * The phone numbers associated with the user.
   * @example []
   */
  phoneNumbers: Array<string>;
}

/**
 * An authenticated user.
 */
export interface AuthUser {
  /**
   * The authenticated user's identifier.
   * @format double
   * @example 1
   */
  id: number;

  /**
   * The authenticated user's name.
   * @example "Joe Done"
   */
  name: string;
}

export class ClientAPI {
  user: UserClientAPI;
  secure: SecureClientAPI;
  cat: CatClientAPI;

  constructor(...options: unknown[]) {
    this.user = new UserClientAPI(...options);
    this.secure = new SecureClientAPI(...options);
    this.cat = new CatClientAPI(...options);
  }
}

/**
 * Operations about users
 */
export class UserClientAPI extends ClientAPIBase {
  /**
   * Retrieves the details of users.
   * Supply the unique group ID from either and receive corresponding user details.
   * @param groupId The group's identifier.
   * @param limit Provide a limit to the result.
   * @param catLevel The =required cat level of users.
   * @summary Retrieve details of users.
   */
  getUsers(
    groupId: number,
    limit?: number,
    catLevel?: string
  ): Promise<Array<UserFromGroup>> {
    const urlParams = new URLSearchParams();

    if (limit !== undefined) {
      urlParams.set('limit', String(limit));
    }

    if (Number.isNaN(limit)) {
      throw new Error("Query param: 'limit' resolved to NaN.");
    }

    if (catLevel) {
      urlParams.set('catLevel', catLevel);
    }

    const urlParamsString = urlParams.toString();

    const queryString = urlParamsString.length > 0 ? `?${urlParamsString}` : '';

    return super.fetch<Array<UserFromGroup>>(
      `/users/${groupId}/all${queryString}`
    );
  }

  /**
   * Retrieves the details of a user.
   * Supply the unique user ID from either and receive corresponding user details.
   * @param userId The user's identifier.
   * @summary Retrieve details of a user.
   */
  getUser(userId: UUID): Promise<UserFromGroup> {
    return super.fetch<UserFromGroup>(`/users/${userId}`);
  }

  /**
   * Update the details of a user.
   * Supply the unique user ID from either and receive corresponding user details.
   * @param userId The user's identifier.
   * @param user The user's data.
   * @summary Update details of a user.
   */
  updateUser(userId: UUID, user: User): Promise<User> {
    return super.fetch<User>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(user),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Permanently delete an user.
   * @param userId The user's identifier.
   * @summary Delete an user.
   */
  deleteUser(userId: UUID): Promise<User | void> {
    return super.fetch<User | void>(`/users/${userId}`, {
      method: 'DELETE',
    });
  }
}

export class SecureClientAPI extends ClientAPIBase {
  /**
   * Get the biggest treasure.
   * @summary Retrieve treasure.
   */
  getTreasure(): Promise<AuthUser> {
    return super.fetch<AuthUser>(`/secure`);
  }
}

export class CatClientAPI extends ClientAPIBase {
  /**
   * Demonstrative cat endpoint that returns static data.
   * @summary Retrieve "add :)" from the server.
   */
  postCat(): Promise<string> {
    return super.fetch<string>(`/cats/add`, {
      method: 'POST',
    });
  }

  /**
   * Demonstrative cat endpoint that returns dynamic data.
   * @param catId The identification of a cat.
   * @summary Retrieve catId from the server.
   */
  postCatId(catId: string): Promise<string> {
    return super.fetch<string>(`/cats/${catId}`, {
      method: 'POST',
    });
  }
}
