import { ClientAPIBase } from '../../client-base.js';

export enum Status {
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
* @example {
  "id": "66ef17a1-af37-4f7b-8e82-b341e0241a30",
  "email": "jane@doe.com",
  "name": "Jane Doe",
  "status": "Sad",
  "phoneNumbers": [],
  "groupId": 1
}
*/
export interface UserFromGroup {
  /**
   * The user's identifier.
   */
  id: UUID;

  /**
   * The email the user used to register his account.
   */
  email: string;

  /**
   * The name the user used to register his account.
   */
  name: string;

  /**
   * The happiness status of the user.
   */
  status?: Status;

  /**
   * The phone numbers associated with the user.
   */
  phoneNumbers: Array<string>;

  /**
   * Whether or not the user is a cat.
   */
  isCat?: boolean;

  /**
   * @format int32
   */
  groupId: number;
}

/**
* @example {
  "id": "66ef17a1-af37-4f7b-8e82-b341e0241a30",
  "email": "jane@doe.com",
  "name": "Jane Doe",
  "status": "Sad",
  "phoneNumbers": []
}
*/
export interface User {
  /**
   * The user's identifier.
   */
  id: UUID;

  /**
   * The email the user used to register his account.
   */
  email: string;

  /**
   * The name the user used to register his account.
   */
  name: string;

  /**
   * The happiness status of the user.
   */
  status?: Status;

  /**
   * The phone numbers associated with the user.
   */
  phoneNumbers: Array<string>;

  /**
   * Whether or not the user is a cat.
   */
  isCat?: boolean;
}

export interface AuthUser {
  /**
   * @format double
   */
  id: number;

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
   * @summary Retrieve details of users.
   */
  getUsers(groupId: number, limit?: number): Promise<Array<UserFromGroup>> {
    const urlParams = new URLSearchParams();

    if (limit) {
      urlParams.set('limit', String(limit));
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
  getUser(userId: UUID): Promise<User> {
    return super.fetch<User>(`/users/${userId}`);
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
  getTreasure(): Promise<AuthUser> {
    return super.fetch<AuthUser>(`/secure`);
  }
}

export class CatClientAPI extends ClientAPIBase {
  postCat(): Promise<string> {
    return super.fetch<string>(`/cats/add`, {
      method: 'POST',
    });
  }

  /**
   * @param catId
   */
  postCatId(catId: string): Promise<string> {
    return super.fetch<string>(`/cats/${catId}`, {
      method: 'POST',
    });
  }
}
