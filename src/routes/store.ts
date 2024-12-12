import {
  Body,
  Delete,
  Example,
  Get,
  Path,
  Post,
  Request,
  Response,
  Route,
  Security,
  SuccessResponse,
  Tags,
} from 'tsoa';

import type { Pet } from '~routes/pet.js';
import { state } from '~state.js';
import { BaseController, type ProblemDetails } from '~utils.js';

import {
  AdoptionRequestStatus,
  AdoptionStatus,
  AnimalKind,
  type ExpressRequestWithUser,
  type UUID,
} from './server-types.js';

const ADOPTED_PETS_EXAMPLE = [
  {
    id: '90dbbed9-bd3d-40ae-ad1c-86602844d4c1',
    name: 'Kozunak',
    breed: 'Orange Tabby',
    notes: 'Likes to bite a lot.',
    kind: AnimalKind.Cat,
    age: 4,
    healthProblems: false,
    addedDate: new Date('2020-08-21'),
    status: AdoptionStatus.Adopted,
    tags: ['cat', 'orange'],
  },
  {
    id: 'd4c8d1c2-3928-468f-8e34-b3166a56f9ce',
    name: 'Happy',
    breed: 'European Domestic Cat',
    notes: 'Very annoying.',
    kind: AnimalKind.Cat,
    age: 1,
    healthProblems: false,
    addedDate: new Date('2023-08-08'),
    status: AdoptionStatus.Adopted,
    tags: ['cat', 'annoying', 'white'],
  },
];

const PENDING_PETS_EXAMPLE = [
  {
    id: '39ccecc8-9344-49ac-b953-b1b271c089fc',
    name: 'Sr. Shnitz',
    breed: 'Cockatiel',
    notes: 'Likes biscuits!',
    kind: AnimalKind.Parrot,
    age: 10,
    healthProblems: false,
    addedDate: new Date('2024-08-20'),
    status: AdoptionStatus.Pending,
    tags: ['parrot', 'squeak', 'mixed colors'],
  },
];

const AVAILABLE_PETS_EXAMPLE = [
  {
    id: 'fe6d2beb-acc3-4d8b-bf05-c8e863462238',
    name: 'Beji',
    breed: 'Cream Tabby',
    notes: 'Likes to fight.',
    kind: AnimalKind.Cat,
    age: 2,
    healthProblems: true,
    addedDate: new Date('2022-03-01'),
    status: AdoptionStatus.Available,
    tags: ['cat', 'beige', 'cream'],
  },
];

/**
 * Adoption request information.
 */
export class AdoptionRequest {
  /**
   * The adoption's ID.
   */
  @Example<UUID>('67120cf3-1434-44be-b660-b02df64db677')
  id!: UUID;

  /**
   * The adoptee's ID.
   */
  @Example<UUID>('90dbbed9-bd3d-40ae-ad1c-86602844d4c1')
  petId!: UUID;

  /**
   * The date of submission of the adoption request.
   * @isDateTime
   */
  @Example<Date>(new Date('2024-08-25'))
  dateOfSubmission!: Date;

  /**
   * The adoption request status.
   */
  @Example<AdoptionRequestStatus>(AdoptionRequestStatus.Pending)
  status!: AdoptionRequestStatus;
}

/**
 * Inventory of adoption status to array of AdoptionRequests.
 */
export class Inventory {
  /**
   * All pets that were adopted.
   */
  @Example<Pet[]>(ADOPTED_PETS_EXAMPLE)
  Adopted!: Pet[];

  /**
   * All pets that are available for adoption.
   */
  @Example<Pet[]>(AVAILABLE_PETS_EXAMPLE)
  Available!: Pet[];

  /**
   * All pets that have a pending adoption status.
   */
  @Example<Pet[]>(PENDING_PETS_EXAMPLE)
  Pending!: Pet[];
}

@Route('store')
@Tags('Store')
@Security('api_key')
@Response<ProblemDetails>(401, 'Unauthorized', {
  status: 401,
  title: 'Unauthorized',
  detail: 'Access denied!',
})
export class StoreController extends BaseController {
  /**
   * Returns a map of adoption status to array of pets.
   * @param _request The express request.
   * @summary        Returns pet inventories by adoption status.
   * @returns        Successful retrieval of inventory.
   */
  @Get('inventory')
  getInventory(@Request() _request: ExpressRequestWithUser): Inventory {
    const inventory: Inventory = {
      Adopted: state.pets.filter(
        (pet) => pet.status === AdoptionStatus.Adopted
      ),
      Available: state.pets.filter(
        (pet) => pet.status === AdoptionStatus.Available
      ),
      Pending: state.pets.filter(
        (pet) => pet.status === AdoptionStatus.Pending
      ),
    };

    return inventory;
  }

  /**
   * Place an adoption request for a pet.
   * @param adoptionRequest The adoption request.
   * @summary               Request an adoption of a pet.
   * @returns               Successful creation of adoption request.
   */
  @Post('adopt')
  adoptPet(@Body() adoptionRequest: AdoptionRequest): AdoptionRequest {
    adoptionRequest.id = crypto.randomUUID();

    state.adoptionRequests.push(adoptionRequest);

    return adoptionRequest;
  }

  /**
   * Find adoption request by ID.
   * @param requestId The adoption request's ID.
   * @summary         Find adoption request by ID.
   * @returns         Successful retrieval of adoption request.
   */
  @Response<ProblemDetails>(404, 'Not Found', {
    status: 404,
    title: 'Not Found',
    detail: 'Adoption request not found!',
  })
  @Get('adopt/{requestId}')
  getAdoptRequestById(@Path() requestId: UUID): AdoptionRequest {
    const adoptionRequest = state.adoptionRequests.find(
      (r) => r.id === requestId
    );

    if (!adoptionRequest) {
      return this.errorResult<AdoptionRequest>(404, {
        message: 'Adoption request not found!',
      });
    }

    return adoptionRequest;
  }

  /**
   * Delete adoption request by ID.
   * @param requestId The adoption request's ID.
   * @summary         Delete adoption request by ID.
   */
  @SuccessResponse(204, 'No Content')
  @Response<ProblemDetails>(404, 'Not Found', {
    status: 404,
    title: 'Not Found',
    detail: 'Adoption request not found!',
  })
  @Delete('adopt/{requestId}')
  deleteAdoptRequestById(@Path() requestId: UUID): void {
    const adoptionRequest = state.adoptionRequests.find(
      (r) => r.id === requestId
    );

    if (!adoptionRequest) {
      return this.errorResult<void>(404, {
        message: 'Adoption request not found!',
      });
    }

    return this.noContentResult<void>();
  }
}
