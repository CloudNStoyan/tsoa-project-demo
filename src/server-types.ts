import type { Request } from 'express';

export enum AnimalKind {
  Cat = 'Cat',
  Dog = 'Dog',
  Parrot = 'Parrot',
}

export enum AdoptionStatus {
  Adopted = 'Adopted',
  Available = 'Available',
  Pending = 'Pending',
}

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
 * A date serialized in the ISO standard.
 * See [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601).
 * @isDate
 * @example "2020-08-21T00:00:00.000Z"
 */
export type ISODateString = string;

export interface AuthUser {
  id: UUID;
  name: string;
}

export interface ExpressRequestWithUser extends Request {
  user: AuthUser;
}
