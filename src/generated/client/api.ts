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
  id: UUID;
  /**
   * The email the user used to register his account.
   */
  email: string;
  /**
   * The name the user used to register his account.
   */
  name: string;
  status?: Status;
  /**
   * The phone numbers associated with the user.
   */
  phoneNumbers: Array<string>;
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
  id: UUID;
  /**
   * The email the user used to register his account.
   */
  email: string;
  /**
   * The name the user used to register his account.
   */
  name: string;
  status?: Status;
  /**
   * The phone numbers associated with the user.
   */
  phoneNumbers: Array<string>;
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

function generateQueryString(queries: Array<[string, unknown]>): string {
  const queryString = queries
    .filter(([_name, query]) => query !== undefined)
    .map(([name, query]) => `${name}=${query}`)
    .join('&');

  if (queryString.length > 0) {
    return `?${queryString}`;
  }

  return '';
}

/**
 * Operations about users
 */
export class UserClientAPI extends ClientAPIBase {
  constructor(...options: unknown[]) {
    super(...options);
  }

  getUsers(groupId: number, limit?: number): Promise<Array<UserFromGroup>> {
    const queries: Array<[string, unknown]> = [['limit', limit]];
    const queryString = generateQueryString(queries);

    return super.fetch<Array<UserFromGroup>>(
      `/users/${groupId}/all${queryString}`
    );
  }

  getUser(userId: UUID): Promise<User> {
    return super.fetch<User>(`/users/${userId}`);
  }

  updateUser(userId: UUID, user: User): Promise<User> {
    return super.fetch<User>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(user),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export class SecureClientAPI extends ClientAPIBase {
  constructor(...options: unknown[]) {
    super(...options);
  }

  getTreasure(): Promise<AuthUser> {
    return super.fetch<AuthUser>(`/secure`);
  }
}

export class CatClientAPI extends ClientAPIBase {
  constructor(...options: unknown[]) {
    super(...options);
  }

  postCat(): Promise<string> {
    return super.fetch<string>(`/cats/add`, {
      method: 'POST',
    });
  }

  postCatId(catId: string): Promise<string> {
    return super.fetch<string>(`/cats/${catId}`, {
      method: 'POST',
    });
  }
}
