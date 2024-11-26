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
import { type ApiError, BaseController } from '~utils.js';

import {
  AdoptionRequestStatus,
  AdoptionStatus,
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
 * Inventory map of adoption status to quantities.
 */
export interface InventoryMap extends Record<AdoptionStatus, number> {}

@Route('store')
@Tags('Store')
@Security('api_key')
@Response<ApiError>(401, 'Unauthorized', {
  status: 401,
  message: 'Access denied!',
})
export class StoreController extends BaseController {
  /**
   * Returns a map of adoption status to quantities.
   * @param _request The express request.
   * @summary        Returns pet inventories by adoption status.
   * @returns        Successful retrieval of inventory.
   */
  @Get('inventory')
  getInventory(@Request() _request: ExpressRequestWithUser): InventoryMap {
    const inventoryMap: InventoryMap = {
      [AdoptionStatus.Adopted]: 0,
      [AdoptionStatus.Available]: 0,
      [AdoptionStatus.Pending]: 0,
    };

    for (const pet of state.pets) {
      inventoryMap[pet.status] += 1;
    }

    return inventoryMap;
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
  @Response<ApiError>(404, 'Not Found', {
    status: 404,
    message: 'Adoption request not found!',
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
  // eslint-disable-next-line @arabasta/tsoa/valid-alternative-response
  @SuccessResponse(204, 'No Content')
  @Response<ApiError>(404, 'Not Found', {
    status: 404,
    message: 'Adoption request not found!',
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
