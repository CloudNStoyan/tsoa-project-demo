import {
  Body,
  Delete,
  Example,
  Get,
  Path,
  Post,
  Put,
  Query,
  Response,
  Route,
  Tags,
} from 'tsoa';
import { ApiError, BaseController, limitOffset } from '../utils.js';
import { state } from '../state.js';
import { AdoptionStatus, AnimalKind, UUID } from './server-types.js';

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
   * @minLength 3 Pet's name should be at least 3 characters long.
   * @maxLength 20 Pet's name should be no more than 20 characters long.
   * @isString Pet's name should be a string.
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
   * @example 2
   * @isInt   Pet's age should be a valid integer number.
   * @minimum 0 Pet's age should be a positive integer number.
   * @maximum 99 Pet's age should be a number that is no bigger than 99.
   */
  age: number;

  /**
   * Whether or not the pet has any health problems.
   * @example false
   * @isBoolean Pet's health problems flag should be a boolean.
   */
  healthProblems: boolean;

  /**
   * When the pet was added to the system.
   * @isDate
   * @minDate 2024-08-01 Pet's added date should be no earlier than 2024-08-01.
   * @maxDate 2024-08-27 Pet's added date should be no later than 2024-08-28.
   */
  addedDate: Date;

  /**
   * Pet's adoption status in the store.
   */
  status: AdoptionStatus;

  /**
   * The pet's tags.
   * @isArray Pet's tags should be an array.
   * @minItems 1 Pet's tags should contain at least one tag.
   * @maxItems 5 Pet's tags should contain no more than 5 tags.
   * @uniqueItems Pet's tags should contain only unique tags.
   */
  tags: string[];
}

@Route('pet')
@Tags('Pet')
export class PetController extends BaseController {
  /**
   * Add a new pet to the store.
   * @param pet Create a new pet in the store.
   * @summary   Add a new pet to the store.
   * @returns   Successful creation of a pet.
   */
  @Post()
  async createPet(@Body() pet: Pet): Promise<Pet> {
    state.pets.push(pet);

    return pet;
  }

  /**
   * Returns all pets with limit and offset functionality.
   * @param offset Offset to discard elements.
   * @param limit  How many records to return.
   * @summary      Returns all pets.
   * @returns      Successful retrieval of pets.
   */
  @Example<Pet[]>([state.pets[0], state.pets[1]])
  @Get('all')
  async getAllPets(
    @Query() offset: number = 0,
    @Query() limit: number = 10
  ): Promise<Pet[]> {
    return limitOffset(state.pets, limit, offset);
  }

  /**
   * Returns pets that have the selected adoption status.
   * @param status The adoption status.
   * @summary      Finds Pets by status.
   * @returns      Successful retrieval of pets.
   */
  @Example<Pet[]>([state.pets[0], state.pets[1]])
  @Get('findByStatus')
  async getPetsByStatus(@Query() status: AdoptionStatus): Promise<Pet[]> {
    const filteredPets = state.pets.filter((p) => p.status === status);

    return filteredPets;
  }

  /**
   * Returns pets that are of a specific set of kinds.
   * @param kinds The set of kinds of pet.
   * @summary     Finds Pets by set of kinds.
   * @returns     Successful retrieval of pets.
   */
  @Example<Pet[]>([state.pets[0], state.pets[1]])
  @Get('findByKinds')
  async getPetsByKind(@Query() kinds: AnimalKind[]): Promise<Pet[]> {
    const filteredPets = state.pets.filter((p) => kinds.includes(p.kind));

    return filteredPets;
  }

  /**
   * Returns pets that include the filter tags.
   * @param tags The tags to filter by.
   * @summary    Finds Pets by tags.
   * @returns    Successful retrieval of pets.
   */
  @Example<Pet[]>([state.pets[0], state.pets[1]])
  @Get('findByTags')
  async getPetsByTags(
    @Query()
    tags: string[]
  ): Promise<Pet[]> {
    const filteredPets: Pet[] = [];

    for (const pet of state.pets) {
      for (const tag of tags) {
        if (pet.tags.includes(tag)) {
          filteredPets.push(pet);
          break;
        }
      }
    }

    return filteredPets;
  }

  /**
   * Returns a single pet.
   * @param petId The pet's id.
   * @summary     Find pet by ID.
   * @returns     Successful retrieval of a pet.
   */
  @Response<ApiError>(404, 'Not Found', {
    status: 404,
    message: 'Pet not found!',
  })
  @Get('{petId}')
  async getPet(@Path() petId: UUID): Promise<Pet> {
    const pet = state.pets.find((p) => p.id === petId);

    if (!pet) {
      return this.errorResult<Pet>(404, { message: 'Pet not found!' });
    }

    return pet;
  }

  /**
   * Update an existing pet by ID.
   * @param petToUpdate The pet's information that should be used in the update.
   * @summary           Update an existing pet.
   * @returns           Successful update of a pet.
   */
  @Response<ApiError>(404, 'Not Found', {
    status: 404,
    message: 'Pet not found!',
  })
  @Put()
  async updatePet(@Body() petToUpdate: Pet): Promise<Pet> {
    const pet = state.pets.find((p) => p.id === petToUpdate.id);

    if (!pet) {
      return this.errorResult<Pet>(404, { message: 'Pet not found!' });
    }

    state.pets = [pet, ...state.pets.filter((p) => p.id !== pet.id)];

    return pet;
  }

  // FIXME: `@returns` JSDoc's declaration only transfers to the swagger.json if the method returns `200`.
  // eslint-disable-next-line jsdoc/require-returns
  /**
   * Deletes a pet by ID.
   * @param petId Pet ID to delete.
   * @summary     Deletes a pet.
   */
  @Response(204, 'No Content')
  @Delete('{petId}')
  @Response<ApiError>(404, 'Not Found', {
    status: 404,
    message: 'Pet not found!',
  })
  async deletePet(@Path() petId: UUID): Promise<void> {
    const pet = state.pets.find((p) => p.id === petId);
    if (!pet) {
      return this.errorResult<void>(404, { message: 'Pet not found!' });
    }

    state.pets = state.pets.filter((p) => p.id !== petId);
    return this.noContentResult<void>();
  }
}
