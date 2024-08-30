import {
  Body,
  Delete,
  Get,
  Path,
  Post,
  Request,
  Response,
  Route,
  Security,
  Tags,
} from 'tsoa';
import { ApiError, BaseController } from '../utils.js';
import { state } from '../state.js';
import {
  AdoptionStatus,
  AdoptionRequestStatus,
  UUID,
  ExpressRequestWithUser,
} from './server-types.js';

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
   * @isDateTime
   * @maxDate 2024-08-27
   */
  dateOfSubmission: Date;

  /**
   * The adoption request status.
   * @example "Pending"
   */
  status: AdoptionRequestStatus;
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

    return Promise.resolve(adoptionRequest);
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

    return Promise.resolve(adoptionRequest);
  }

  /**
   * Delete adoption request by ID.
   * @param requestId The adoption request's ID.
   * @summary         Delete adoption request by ID.
   * @returns         Successful deletion of adoption request.
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
      return this.errorResult<void>(404, {
        message: 'Adoption request not found!',
      });
    }

    return this.noContentResult<void>();
  }
}
