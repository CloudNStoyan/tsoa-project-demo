// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/require-await */
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
  Tags,
} from 'tsoa';

// eslint-disable-next-line no-restricted-imports
import { state } from '../state.js';
// eslint-disable-next-line no-restricted-imports
import { type ApiError, BaseController } from '../utils.js';
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
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
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
  async getInventory(
    @Request() _request: ExpressRequestWithUser
  ): Promise<InventoryMap> {
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
  async adoptPet(
    @Body() adoptionRequest: AdoptionRequest
  ): Promise<AdoptionRequest> {
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
  async getAdoptRequestById(@Path() requestId: UUID): Promise<AdoptionRequest> {
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
  @Response(204, 'No Content')
  @Response<ApiError>(404, 'Not Found', {
    status: 404,
    message: 'Adoption request not found!',
  })
  @Delete('adopt/{requestId}')
  async deleteAdoptRequestById(@Path() requestId: UUID): Promise<void> {
    const adoptionRequest = state.adoptionRequests.find(
      (r) => r.id === requestId
    );

    if (!adoptionRequest) {
      // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
      this.errorResult<void>(404, {
        message: 'Adoption request not found!',
      });
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    this.noContentResult<void>();
  }
}
