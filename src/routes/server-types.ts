import type { Request } from 'express';

/**
 * The pet's animal kind.
 */
export enum AnimalKind {
  Cat = 'Cat',
  Dog = 'Dog',
  Parrot = 'Parrot',
}

/**
 * The pet's adoption status.
 */
export enum AdoptionStatus {
  Adopted = 'Adopted',
  Available = 'Available',
  Pending = 'Pending',
}

/**
 * The adoption request's status.
 */
export enum AdoptionRequestStatus {
  Approved = 'Approved',
  Pending = 'Pending',
  Denied = 'Denied',
}

/**
 * Stringified UUIDv4.
 * See [RFC 4112](https://tools.ietf.org/html/rfc4122).
 * @pattern [0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-4[0-9A-Fa-f]{3}-[89ABab][0-9A-Fa-f]{3}-[0-9A-Fa-f]{12}
 * @format  uuid
 * @example "7312cc99-f99f-445e-a939-eb66c0c6724c"
 */
export type UUID = string;

/**
 * An authenticated user.
 */
export interface AuthUser {
  /**
   * The user's identifier.
   */
  id: UUID;

  /**
   * The user's name.
   * @example "Stoyan"
   */
  name: string;
}

/**
 * Express Request with a user field.
 */
export interface ExpressRequestWithUser extends Request {
  /**
   * The authenticated user.
   */
  user: AuthUser;
}
