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

const PETS_EXAMPLE = [
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
   * @example "Dog"
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
   */
  healthProblems: boolean;

  /**
   * When the pet was added to the system.
   * @isDate
   */
  addedDate: Date;

  /**
   * Pet's adoption status in the store.
   * @example "Pending"
   */
  status: AdoptionStatus;

  /**
   * The pet's tags.
   * @minItems 1 Pet's tags should contain at least one tag.
   * @maxItems 5 Pet's tags should contain no more than 5 tags.
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
   * @isInt offset
   * @param limit  How many records to return.
   * @isInt limit
   * @summary      Returns all pets.
   * @returns      Successful retrieval of pets.
   */
  @Example<Pet[]>(PETS_EXAMPLE)
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
  @Example<Pet[]>(PETS_EXAMPLE)
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
  @Example<Pet[]>(PETS_EXAMPLE)
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
  @Example<Pet[]>(PETS_EXAMPLE)
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
