import type { Pet } from './routes/pet.js';
import { AdoptionRequest } from './routes/store.js';
import {
  AdoptionRequestStatus,
  AdoptionStatus,
  AnimalKind,
  AuthUser,
} from './server-types.js';

export interface PetStoreState {
  pets: Pet[];
  adoptionRequests: AdoptionRequest[];
  users: AuthUser[];
}

export const state: PetStoreState = {
  users: [
    {
      id: '7fd52b4c-00be-4000-81f6-5af00e79e5b0',
      name: 'Stoyan',
    },
  ],
  pets: [
    {
      id: '90dbbed9-bd3d-40ae-ad1c-86602844d4c1',
      name: 'Kozunak',
      breed: 'Orange Tabby',
      notes: 'Likes to bite a lot.',
      kind: AnimalKind.Cat,
      age: 4,
      healthProblems: false,
      addedDate: '2020-08-21T00:00:00.000Z',
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
      addedDate: '2023-08-08T00:00:00.000Z',
      status: AdoptionStatus.Adopted,
      tags: ['cat', 'annoying', 'white'],
    },
    {
      id: 'fe6d2beb-acc3-4d8b-bf05-c8e863462238',
      name: 'Beji',
      breed: 'Cream Tabby',
      notes: 'Likes to fight.',
      kind: AnimalKind.Cat,
      age: 2,
      healthProblems: true,
      addedDate: '2022-03-01T00:00:00.000Z',
      status: AdoptionStatus.Available,
      tags: ['cat', 'beige', 'cream'],
    },
    {
      id: '82556e52-c486-4e07-b7a0-82498ac62619',
      name: 'Ricky',
      breed: 'English Cocker Spaniel',
      notes: 'He may eat you!',
      kind: AnimalKind.Dog,
      age: 4,
      healthProblems: false,
      addedDate: '2020-07-02T00:00:00.000Z',
      status: AdoptionStatus.Adopted,
      tags: ['dog', 'sand', 'brown', 'orange', 'big nose'],
    },
    {
      id: '39ccecc8-9344-49ac-b953-b1b271c089fc',
      name: 'Sr. Shnitz',
      breed: 'Cockatiel',
      notes: 'Likes biscuits!',
      kind: AnimalKind.Parrot,
      age: 10,
      healthProblems: false,
      addedDate: '2024-08-20T00:00:00.000Z',
      status: AdoptionStatus.Pending,
      tags: ['parrot', 'squeak', 'mixed colors'],
    },
    {
      id: '7312cc99-f99f-445e-a939-eb66c0c6724c',
      name: 'Max',
      breed: 'European Domestic Cat',
      notes: 'Likes to scratch a lot.',
      kind: AnimalKind.Cat,
      age: 2,
      healthProblems: false,
      addedDate: '2022-08-21T00:00:00.000Z',
      status: AdoptionStatus.Adopted,
      tags: ['cat', 'white'],
    },
  ],
  adoptionRequests: [
    {
      id: '67120cf3-1434-44be-b660-b02df64db677',
      petId: '39ccecc8-9344-49ac-b953-b1b271c089fc',
      dateOfSubmission: '2024-08-25T00:00:00.000Z',
      status: AdoptionRequestStatus.Approved,
    },
  ],
};
