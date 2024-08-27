import { ClientAPIBase } from '../../client-base.js';

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
 * @format uuid
 * @example "7312cc99-f99f-445e-a939-eb66c0c6724c"
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
 * Pet characteristics.
 */
export interface Pet {
  /**
   * The pet's identifier.
   */
  id: UUID;

  /**
   * The name of the pet.
   * @example "Max"
   */
  name: string;

  /**
   * The kind of breed the pet is.
   * @example "European Domestic Cat"
   */
  breed: string;

  /**
   * Free form text associated with the pet.
   * @example "Likes to scratch a lot."
   */
  notes: string;

  /**
   * What kind of pet it is.
   */
  kind: AnimalKind;

  /**
   * The age of the pet.
   * @format int32
   * @example 2
   */
  age: number;

  /**
   * Whether or not the pet has any health problems.
   * @example false
   */
  healthProblems: boolean;

  /**
   * When the pet was added to the system.
   * @format date
   */
  addedDate: string;

  /**
   * Pet's adoption status in the store.
   */
  status: AdoptionStatus;

  /**
   * The pet's tags.
   */
  tags: string[];
}

/**
 * Inventory map of adoption status to quantities.
 */
export interface InventoryMap {
  /**
   * @format double
   */
  Adopted: number;

  /**
   * @format double
   */
  Available: number;

  /**
   * @format double
   */
  Pending: number;
}

/**
 * Adoption request information.
 */
export interface AdoptionRequest {
  /**
   * The adoption's ID.
   */
  id: UUID;

  /**
   * The adoptee's ID.
   */
  petId: UUID;

  /**
   * The date of submission of the adoption request.
   * @format date-time
   */
  dateOfSubmission: string;

  /**
   * The adoption request status.
   */
  status: AdoptionRequestStatus;
}

export class ClientAPI {
  pet: PetClientAPI;
  store: StoreClientAPI;

  constructor(...options: unknown[]) {
    this.pet = new PetClientAPI(...options);
    this.store = new StoreClientAPI(...options);
  }
}

/**
 * Everything about your Pets
 */
export class PetClientAPI extends ClientAPIBase {
  /**
   * Add a new pet to the store.
   * @param pet Create a new pet in the store.
   * @summary Add a new pet to the store.
   */
  createPet(pet: Pet): Promise<Pet> {
    return super.fetch<Pet>(`/pet`, {
      method: 'POST',
      body: JSON.stringify(pet),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Update an existing pet by ID.
   * @param pet The pet's information that should be used in the update.
   * @summary Update an existing pet.
   */
  updatePet(pet: Pet): Promise<Pet> {
    return super.fetch<Pet>(`/pet`, {
      method: 'PUT',
      body: JSON.stringify(pet),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Returns all pets with limit and offset functionality.
   * @param offset Offset to discard elements.
   * @param limit How many records to return.
   * @summary Returns all pets.
   */
  getAllPets(offset?: number, limit?: number): Promise<Pet[]> {
    if (Number.isNaN(offset)) {
      throw new Error("Invalid value NaN for 'query' param: 'offset'.");
    }

    if (Number.isNaN(limit)) {
      throw new Error("Invalid value NaN for 'query' param: 'limit'.");
    }

    const urlParams = new URLSearchParams();

    if (offset !== undefined) {
      urlParams.set('offset', String(offset));
    }

    if (limit !== undefined) {
      urlParams.set('limit', String(limit));
    }

    const urlParamsString = urlParams.toString();

    const queryString = urlParamsString.length > 0 ? `?${urlParamsString}` : '';

    return super.fetch<Pet[]>(`/pet/all${queryString}`);
  }

  /**
   * Returns pets that have the selected adoption status.
   * @param status The adoption status.
   * @summary Finds Pets by status.
   */
  getPetsByStatus(status: AdoptionStatus): Promise<Pet[]> {
    const urlParams = new URLSearchParams();

    if (status) {
      urlParams.set('status', status);
    }

    const urlParamsString = urlParams.toString();

    const queryString = urlParamsString.length > 0 ? `?${urlParamsString}` : '';

    return super.fetch<Pet[]>(`/pet/findByStatus${queryString}`);
  }

  /**
   * Returns pets that are of a specific set of kinds.
   * @param kinds The set of kinds of pet.
   * @summary Finds Pets by set of kinds.
   */
  getPetsByKind(kinds: AnimalKind[]): Promise<Pet[]> {
    if (!Array.isArray(kinds)) {
      throw new Error(
        `Invalid value type '${typeof kinds}' for 'query' param: 'kinds'.`
      );
    }

    const urlParams = new URLSearchParams();

    for (const item of kinds) {
      if (item) {
        urlParams.append('kinds', item);
      }
    }

    const urlParamsString = urlParams.toString();

    const queryString = urlParamsString.length > 0 ? `?${urlParamsString}` : '';

    return super.fetch<Pet[]>(`/pet/findByKinds${queryString}`);
  }

  /**
   * Returns pets that include the filter tags.
   * @param tags The tags to filter by.
   * @summary Finds Pets by tags.
   */
  getPetsByTags(tags: string[]): Promise<Pet[]> {
    if (!Array.isArray(tags)) {
      throw new Error(
        `Invalid value type '${typeof tags}' for 'query' param: 'tags'.`
      );
    }

    const urlParams = new URLSearchParams();

    for (const item of tags) {
      if (item) {
        urlParams.append('tags', item);
      }
    }

    const urlParamsString = urlParams.toString();

    const queryString = urlParamsString.length > 0 ? `?${urlParamsString}` : '';

    return super.fetch<Pet[]>(`/pet/findByTags${queryString}`);
  }

  /**
   * Returns a single pet.
   * @param petId The pet's id.
   * @summary Find pet by ID.
   */
  getPet(petId: UUID): Promise<Pet> {
    return super.fetch<Pet>(`/pet/${encodeURIComponent(petId)}`);
  }

  /**
   * Deletes a pet by ID.
   * @param petId Pet ID to delete.
   * @summary Deletes a pet.
   */
  deletePet(petId: UUID): Promise<void> {
    return super.fetch(`/pet/${encodeURIComponent(petId)}`, {
      method: 'DELETE',
    });
  }
}

/**
 * Access to Petstore orders
 */
export class StoreClientAPI extends ClientAPIBase {
  /**
   * Returns a map of adoption status to quantities.
   * @summary Returns pet inventories by adoption status.
   */
  getInventory(): Promise<InventoryMap> {
    return super.fetch<InventoryMap>(`/store/inventory`);
  }

  /**
   * Place an adoption request for a pet.
   * @param adoptionRequest The adoption request.
   * @summary Request an adoption of a pet.
   */
  adoptPet(adoptionRequest: AdoptionRequest): Promise<AdoptionRequest> {
    return super.fetch<AdoptionRequest>(`/store/adopt`, {
      method: 'POST',
      body: JSON.stringify(adoptionRequest),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Find adoption request by ID.
   * @param requestId The adoption request's ID.
   * @summary Find adoption request by ID.
   */
  getAdoptRequestById(requestId: UUID): Promise<AdoptionRequest> {
    return super.fetch<AdoptionRequest>(
      `/store/adopt/${encodeURIComponent(requestId)}`
    );
  }

  /**
   * Delete adoption request by ID.
   * @param requestId The adoption request's ID.
   * @summary Delete adoption request by ID.
   */
  deleteAdoptRequestById(requestId: UUID): Promise<void> {
    return super.fetch(`/store/adopt/${encodeURIComponent(requestId)}`, {
      method: 'DELETE',
    });
  }
}
