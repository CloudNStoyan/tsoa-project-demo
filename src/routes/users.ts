import {
  Get,
  Path,
  Query,
  Route,
  Response,
  Example,
  Middlewares,
  Put,
  Body,
  Tags,
} from 'tsoa';
import { customLog } from '../middlewares/custom-log.js';
import { ApiError, BaseController } from '../utils.js';

/**
 * Stringified UUIDv4.
 * See [RFC 4112](https://tools.ietf.org/html/rfc4122).
 * @pattern [0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-4[0-9A-Fa-f]{3}-[89ABab][0-9A-Fa-f]{3}-[0-9A-Fa-f]{12}
 * @format  uuid
 * @example "66ef17a1-af37-4f7b-8e82-b341e0241a30"
 */
type UUID = string;

/**
 * User description written by yours truly Stoyan.
 */
interface User {
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
   * @example false
   */
  isCat: boolean;

  /**
   * The happiness status of the user.
   * @example "Sad"
   */
  status?: 'Happy' | 'Sad';

  /**
   * The phone numbers associated with the user.
   * @example []
   */
  phoneNumbers: string[];
}

/**
 * User objects allow you to associate actions performed
 * in the system with the user that performed them.
 * The User object contains common information across
 * every user in the system regardless of status and role.
 */
interface UserFromGroup extends User {
  /**
   * @isInt
   * @example 113
   */
  groupId: number;
}

const data: User[] = [
  {
    id: '66ef17a1-af37-4f7b-8e82-b341e0241a30',
    email: 'jane@doe.com',
    name: 'Jane Doe',
    status: 'Happy',
    phoneNumbers: [],
    isCat: false,
  },
  {
    id: 'c421afa9-08c7-491a-90a1-575bb656cffd',
    email: 'john@doe.com',
    name: 'John Doe',
    status: 'Sad',
    phoneNumbers: [],
    isCat: false,
  },
];

@Response<ApiError>(401, 'Unauthorized', {
  status: 401,
  message: 'Access denied!',
})
@Route('users')
@Middlewares(customLog)
@Tags('User')
export class UserController extends BaseController {
  /**
   * Retrieves the details of users.
   * Supply the unique group ID from either and receive corresponding user details.
   * @param groupId The group's identifier.
   * @param limit   Provide a limit to the result.
   * @returns       An array with User Objects.
   * @summary       Retrieve details of users.
   */
  @Example<UserFromGroup[]>(
    [
      {
        id: '66ef17a1-af37-4f7b-8e82-b341e0241a30',
        email: 'jane@doe.com',
        name: 'Jane Doe',
        status: 'Happy',
        phoneNumbers: [],
        groupId: 1,
        isCat: false,
      },
      {
        id: 'c421afa9-08c7-491a-90a1-575bb656cffd',
        email: 'john@doe.com',
        name: 'John Doe',
        status: 'Sad',
        phoneNumbers: [],
        groupId: 1,
        isCat: false,
      },
    ],
    'An example of Users'
  )
  @Response<ApiError>(404, 'Not Found', {
    status: 404,
    message: 'Users with this groupId have not be found!',
  })
  @Get('{groupId}/all')
  public async getUsers(
    @Path() groupId: number,
    @Query() limit?: number
  ): Promise<UserFromGroup[]> {
    const users: UserFromGroup[] = data.map((user) => {
      const userFromGroup = user as UserFromGroup;
      userFromGroup.groupId = groupId;
      return userFromGroup;
    });

    return users.slice(0, limit || users.length);
  }

  /**
   * Retrieves the details of a user.
   * Supply the unique user ID from either and receive corresponding user details.
   * @param userId The user's identifier.
   * @returns      details of the user in the form of an User Object.
   * @summary      Retrieve details of a user.
   */
  @Response<ApiError>(404, 'Not Found', {
    status: 404,
    message: 'User not found!',
  })
  @Get('{userId}')
  public async getUser(@Path() userId: UUID): Promise<UserFromGroup> {
    const user = data.find((u) => u.id === userId) as UserFromGroup;

    if (!user) {
      return this.errorResult<UserFromGroup>(404, {
        message: 'User not found!',
      });
    }

    return user;
  }

  /**
   * Update the details of a user.
   * Supply the unique user ID from either and receive corresponding user details.
   * @param userId   The user's identifier.
   * @param userData The user's data.
   * @returns        the updated details of the user.
   * @summary        Update details of a user.
   */
  @Response<ApiError>(404, 'Not Found', {
    status: 404,
    message: 'User not found!',
  })
  @Put('{userId}')
  public async updateUser(
    @Path() userId: UUID,
    @Body() userData: User
  ): Promise<User> {
    const user = data.find((u) => u.id === userId);

    if (!user) {
      return this.errorResult<User>(404, {
        message: 'User not found!',
      });
    }

    return userData;
  }
}
