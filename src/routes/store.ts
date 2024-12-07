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

import { state } from '~state.js';
import { BaseController, type ProblemDetails } from '~utils.js';

import {
  AdoptionRequestStatus,
  type ExpressRequestWithUser,
  type UUID,
} from './server-types.js';

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
 * Inventory of adoption status to quantities.
 */
export class Inventory {
  /**
   * The number of pets that were adopted.
   * @isInt
   */
  @Example<number>(3)
  Adopted!: number;

  /**
   * The number of pets that are available for adoption.
   * @isInt
   */
  @Example<number>(1)
  Available!: number;

  /**
   * The number of pets that have a pending adoption status.
   * @isInt
   */
  @Example<number>(2)
  Pending!: number;
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
   * Returns a map of adoption status to quantities.
   * @param _request The express request.
   * @summary        Returns pet inventories by adoption status.
   * @returns        Successful retrieval of inventory.
   */
  @Get('inventory')
  getInventory(@Request() _request: ExpressRequestWithUser): Inventory {
    const inventory: Inventory = {
      Adopted: 0,
      Available: 0,
      Pending: 0,
    };

    for (const pet of state.pets) {
      inventory[pet.status] += 1;
    }

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
