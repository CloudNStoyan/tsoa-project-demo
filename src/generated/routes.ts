/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import {
  TsoaRoute,
  fetchMiddlewares,
  ExpressTemplateService,
} from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { PetController } from './../routes/pet.js';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { StoreController } from './../routes/store.js';
import { expressAuthentication } from './../auth.js';
// @ts-ignore - no great way to install types from subpackage
import type {
  Request as ExRequest,
  Response as ExResponse,
  RequestHandler,
  Router,
} from 'express';

const expressAuthenticationRecasted = expressAuthentication as (
  req: ExRequest,
  securityName: string,
  scopes?: string[],
  res?: ExResponse
) => Promise<any>;

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
  ProblemDetails: {
    dataType: 'refObject',
    properties: {
      type: {
        dataType: 'union',
        subSchemas: [
          { dataType: 'string' },
          { dataType: 'enum', enums: [null] },
        ],
      },
      title: {
        dataType: 'union',
        subSchemas: [
          { dataType: 'string' },
          { dataType: 'enum', enums: [null] },
        ],
      },
      status: {
        dataType: 'union',
        subSchemas: [
          { dataType: 'integer' },
          { dataType: 'enum', enums: [null] },
        ],
      },
      detail: {
        dataType: 'union',
        subSchemas: [
          { dataType: 'string' },
          { dataType: 'enum', enums: [null] },
        ],
      },
      instance: {
        dataType: 'union',
        subSchemas: [
          { dataType: 'string' },
          { dataType: 'enum', enums: [null] },
        ],
      },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  UUID: {
    dataType: 'refAlias',
    type: {
      dataType: 'string',
      validators: {
        pattern: {
          value:
            '[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-4[0-9A-Fa-f]{3}-[89ABab][0-9A-Fa-f]{3}-[0-9A-Fa-f]{12}',
        },
      },
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  AnimalKind: {
    dataType: 'refEnum',
    enums: ['Cat', 'Dog', 'Parrot'],
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  AdoptionStatus: {
    dataType: 'refEnum',
    enums: ['Adopted', 'Available', 'Pending'],
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  Pet: {
    dataType: 'refObject',
    properties: {
      id: { ref: 'UUID', required: true },
      name: {
        dataType: 'string',
        required: true,
        validators: {
          minLength: {
            errorMsg: "Pet's name should be at least 3 characters long.",
            value: 3,
          },
          maxLength: {
            errorMsg: "Pet's name should be no more than 20 characters long.",
            value: 20,
          },
        },
      },
      breed: { dataType: 'string', required: true },
      notes: { dataType: 'string', required: true },
      kind: { ref: 'AnimalKind', required: true },
      age: {
        dataType: 'integer',
        required: true,
        validators: {
          isInt: { errorMsg: "Pet's age should be a valid integer number." },
          minimum: {
            errorMsg: "Pet's age should be a positive integer number.",
            value: 0,
          },
          maximum: {
            errorMsg: "Pet's age should be a number that is no bigger than 99.",
            value: 99,
          },
        },
      },
      healthProblems: { dataType: 'boolean', required: true },
      addedDate: { dataType: 'date', required: true },
      status: { ref: 'AdoptionStatus', required: true },
      tags: {
        dataType: 'array',
        array: { dataType: 'string' },
        required: true,
        validators: {
          minItems: {
            errorMsg: "Pet's tags should contain at least one tag.",
            value: 1,
          },
          maxItems: {
            errorMsg: "Pet's tags should contain no more than 5 tags.",
            value: 5,
          },
        },
      },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  Inventory: {
    dataType: 'refObject',
    properties: {
      Adopted: { dataType: 'integer', required: true },
      Available: { dataType: 'integer', required: true },
      Pending: { dataType: 'integer', required: true },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  AdoptionRequestStatus: {
    dataType: 'refEnum',
    enums: ['Approved', 'Pending', 'Denied'],
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  AdoptionRequest: {
    dataType: 'refObject',
    properties: {
      id: { ref: 'UUID', required: true },
      petId: { ref: 'UUID', required: true },
      dateOfSubmission: { dataType: 'datetime', required: true },
      status: { ref: 'AdoptionRequestStatus', required: true },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new ExpressTemplateService(models, {
  noImplicitAdditionalProperties: 'throw-on-extras',
  bodyCoercion: true,
});

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

export function RegisterRoutes(app: Router) {
  // ###########################################################################################################
  //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
  //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
  // ###########################################################################################################

  app.post(
    '/pet',
    ...fetchMiddlewares<RequestHandler>(PetController),
    ...fetchMiddlewares<RequestHandler>(PetController.prototype.createPet),

    async function PetController_createPet(
      request: ExRequest,
      response: ExResponse,
      next: any
    ) {
      const args: Record<string, TsoaRoute.ParameterSchema> = {
        pet: { in: 'body', name: 'pet', required: true, ref: 'Pet' },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = templateService.getValidatedArgs({
          args,
          request,
          response,
        });

        const controller = new PetController();

        await templateService.apiHandler({
          methodName: 'createPet',
          controller,
          response,
          next,
          validatedArgs,
          successStatus: undefined,
        });
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get(
    '/pet/all',
    ...fetchMiddlewares<RequestHandler>(PetController),
    ...fetchMiddlewares<RequestHandler>(PetController.prototype.getAllPets),

    async function PetController_getAllPets(
      request: ExRequest,
      response: ExResponse,
      next: any
    ) {
      const args: Record<string, TsoaRoute.ParameterSchema> = {
        offset: {
          default: 0,
          in: 'query',
          name: 'offset',
          dataType: 'integer',
          validators: { isInt: { errorMsg: 'offset' } },
        },
        limit: {
          default: 10,
          in: 'query',
          name: 'limit',
          dataType: 'integer',
          validators: { isInt: { errorMsg: 'limit' } },
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = templateService.getValidatedArgs({
          args,
          request,
          response,
        });

        const controller = new PetController();

        await templateService.apiHandler({
          methodName: 'getAllPets',
          controller,
          response,
          next,
          validatedArgs,
          successStatus: undefined,
        });
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get(
    '/pet/findByStatus',
    ...fetchMiddlewares<RequestHandler>(PetController),
    ...fetchMiddlewares<RequestHandler>(
      PetController.prototype.getPetsByStatus
    ),

    async function PetController_getPetsByStatus(
      request: ExRequest,
      response: ExResponse,
      next: any
    ) {
      const args: Record<string, TsoaRoute.ParameterSchema> = {
        status: {
          in: 'query',
          name: 'status',
          required: true,
          ref: 'AdoptionStatus',
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = templateService.getValidatedArgs({
          args,
          request,
          response,
        });

        const controller = new PetController();

        await templateService.apiHandler({
          methodName: 'getPetsByStatus',
          controller,
          response,
          next,
          validatedArgs,
          successStatus: undefined,
        });
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get(
    '/pet/findByKinds',
    ...fetchMiddlewares<RequestHandler>(PetController),
    ...fetchMiddlewares<RequestHandler>(PetController.prototype.getPetsByKind),

    async function PetController_getPetsByKind(
      request: ExRequest,
      response: ExResponse,
      next: any
    ) {
      const args: Record<string, TsoaRoute.ParameterSchema> = {
        kinds: {
          in: 'query',
          name: 'kinds',
          required: true,
          dataType: 'array',
          array: { dataType: 'refEnum', ref: 'AnimalKind' },
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = templateService.getValidatedArgs({
          args,
          request,
          response,
        });

        const controller = new PetController();

        await templateService.apiHandler({
          methodName: 'getPetsByKind',
          controller,
          response,
          next,
          validatedArgs,
          successStatus: undefined,
        });
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get(
    '/pet/findByTags',
    ...fetchMiddlewares<RequestHandler>(PetController),
    ...fetchMiddlewares<RequestHandler>(PetController.prototype.getPetsByTags),

    async function PetController_getPetsByTags(
      request: ExRequest,
      response: ExResponse,
      next: any
    ) {
      const args: Record<string, TsoaRoute.ParameterSchema> = {
        tags: {
          in: 'query',
          name: 'tags',
          required: true,
          dataType: 'array',
          array: { dataType: 'string' },
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = templateService.getValidatedArgs({
          args,
          request,
          response,
        });

        const controller = new PetController();

        await templateService.apiHandler({
          methodName: 'getPetsByTags',
          controller,
          response,
          next,
          validatedArgs,
          successStatus: undefined,
        });
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get(
    '/pet/findByDate',
    ...fetchMiddlewares<RequestHandler>(PetController),
    ...fetchMiddlewares<RequestHandler>(PetController.prototype.getPetsByDate),

    async function PetController_getPetsByDate(
      request: ExRequest,
      response: ExResponse,
      next: any
    ) {
      const args: Record<string, TsoaRoute.ParameterSchema> = {
        afterDate: {
          in: 'query',
          name: 'afterDate',
          required: true,
          dataType: 'date',
          validators: { isDate: { errorMsg: 'afterDate' } },
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = templateService.getValidatedArgs({
          args,
          request,
          response,
        });

        const controller = new PetController();

        await templateService.apiHandler({
          methodName: 'getPetsByDate',
          controller,
          response,
          next,
          validatedArgs,
          successStatus: undefined,
        });
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get(
    '/pet/:petId',
    ...fetchMiddlewares<RequestHandler>(PetController),
    ...fetchMiddlewares<RequestHandler>(PetController.prototype.getPet),

    async function PetController_getPet(
      request: ExRequest,
      response: ExResponse,
      next: any
    ) {
      const args: Record<string, TsoaRoute.ParameterSchema> = {
        petId: { in: 'path', name: 'petId', required: true, ref: 'UUID' },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = templateService.getValidatedArgs({
          args,
          request,
          response,
        });

        const controller = new PetController();

        await templateService.apiHandler({
          methodName: 'getPet',
          controller,
          response,
          next,
          validatedArgs,
          successStatus: undefined,
        });
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.put(
    '/pet',
    ...fetchMiddlewares<RequestHandler>(PetController),
    ...fetchMiddlewares<RequestHandler>(PetController.prototype.updatePet),

    async function PetController_updatePet(
      request: ExRequest,
      response: ExResponse,
      next: any
    ) {
      const args: Record<string, TsoaRoute.ParameterSchema> = {
        petToUpdate: {
          in: 'body',
          name: 'petToUpdate',
          required: true,
          ref: 'Pet',
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = templateService.getValidatedArgs({
          args,
          request,
          response,
        });

        const controller = new PetController();

        await templateService.apiHandler({
          methodName: 'updatePet',
          controller,
          response,
          next,
          validatedArgs,
          successStatus: undefined,
        });
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.delete(
    '/pet/:petId',
    ...fetchMiddlewares<RequestHandler>(PetController),
    ...fetchMiddlewares<RequestHandler>(PetController.prototype.deletePet),

    async function PetController_deletePet(
      request: ExRequest,
      response: ExResponse,
      next: any
    ) {
      const args: Record<string, TsoaRoute.ParameterSchema> = {
        petId: { in: 'path', name: 'petId', required: true, ref: 'UUID' },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = templateService.getValidatedArgs({
          args,
          request,
          response,
        });

        const controller = new PetController();

        await templateService.apiHandler({
          methodName: 'deletePet',
          controller,
          response,
          next,
          validatedArgs,
          successStatus: 204,
        });
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get(
    '/store/inventory',
    authenticateMiddleware([{ api_key: [] }]),
    ...fetchMiddlewares<RequestHandler>(StoreController),
    ...fetchMiddlewares<RequestHandler>(StoreController.prototype.getInventory),

    async function StoreController_getInventory(
      request: ExRequest,
      response: ExResponse,
      next: any
    ) {
      const args: Record<string, TsoaRoute.ParameterSchema> = {
        _request: {
          in: 'request',
          name: '_request',
          required: true,
          dataType: 'object',
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = templateService.getValidatedArgs({
          args,
          request,
          response,
        });

        const controller = new StoreController();

        await templateService.apiHandler({
          methodName: 'getInventory',
          controller,
          response,
          next,
          validatedArgs,
          successStatus: undefined,
        });
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post(
    '/store/adopt',
    authenticateMiddleware([{ api_key: [] }]),
    ...fetchMiddlewares<RequestHandler>(StoreController),
    ...fetchMiddlewares<RequestHandler>(StoreController.prototype.adoptPet),

    async function StoreController_adoptPet(
      request: ExRequest,
      response: ExResponse,
      next: any
    ) {
      const args: Record<string, TsoaRoute.ParameterSchema> = {
        adoptionRequest: {
          in: 'body',
          name: 'adoptionRequest',
          required: true,
          ref: 'AdoptionRequest',
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = templateService.getValidatedArgs({
          args,
          request,
          response,
        });

        const controller = new StoreController();

        await templateService.apiHandler({
          methodName: 'adoptPet',
          controller,
          response,
          next,
          validatedArgs,
          successStatus: undefined,
        });
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get(
    '/store/adopt/:requestId',
    authenticateMiddleware([{ api_key: [] }]),
    ...fetchMiddlewares<RequestHandler>(StoreController),
    ...fetchMiddlewares<RequestHandler>(
      StoreController.prototype.getAdoptRequestById
    ),

    async function StoreController_getAdoptRequestById(
      request: ExRequest,
      response: ExResponse,
      next: any
    ) {
      const args: Record<string, TsoaRoute.ParameterSchema> = {
        requestId: {
          in: 'path',
          name: 'requestId',
          required: true,
          ref: 'UUID',
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = templateService.getValidatedArgs({
          args,
          request,
          response,
        });

        const controller = new StoreController();

        await templateService.apiHandler({
          methodName: 'getAdoptRequestById',
          controller,
          response,
          next,
          validatedArgs,
          successStatus: undefined,
        });
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.delete(
    '/store/adopt/:requestId',
    authenticateMiddleware([{ api_key: [] }]),
    ...fetchMiddlewares<RequestHandler>(StoreController),
    ...fetchMiddlewares<RequestHandler>(
      StoreController.prototype.deleteAdoptRequestById
    ),

    async function StoreController_deleteAdoptRequestById(
      request: ExRequest,
      response: ExResponse,
      next: any
    ) {
      const args: Record<string, TsoaRoute.ParameterSchema> = {
        requestId: {
          in: 'path',
          name: 'requestId',
          required: true,
          ref: 'UUID',
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = templateService.getValidatedArgs({
          args,
          request,
          response,
        });

        const controller = new StoreController();

        await templateService.apiHandler({
          methodName: 'deleteAdoptRequestById',
          controller,
          response,
          next,
          validatedArgs,
          successStatus: 204,
        });
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

  function authenticateMiddleware(security: TsoaRoute.Security[] = []) {
    return async function runAuthenticationMiddleware(
      request: any,
      response: any,
      next: any
    ) {
      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      // keep track of failed auth attempts so we can hand back the most
      // recent one.  This behavior was previously existing so preserving it
      // here
      const failedAttempts: any[] = [];
      const pushAndRethrow = (error: any) => {
        failedAttempts.push(error);
        throw error;
      };

      const secMethodOrPromises: Promise<any>[] = [];
      for (const secMethod of security) {
        if (Object.keys(secMethod).length > 1) {
          const secMethodAndPromises: Promise<any>[] = [];

          for (const name in secMethod) {
            secMethodAndPromises.push(
              expressAuthenticationRecasted(
                request,
                name,
                secMethod[name],
                response
              ).catch(pushAndRethrow)
            );
          }

          // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

          secMethodOrPromises.push(
            Promise.all(secMethodAndPromises).then((users) => {
              return users[0];
            })
          );
        } else {
          for (const name in secMethod) {
            secMethodOrPromises.push(
              expressAuthenticationRecasted(
                request,
                name,
                secMethod[name],
                response
              ).catch(pushAndRethrow)
            );
          }
        }
      }

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      try {
        request['user'] = await Promise.any(secMethodOrPromises);

        // Response was sent in middleware, abort
        if (response.writableEnded) {
          return;
        }

        next();
      } catch (err) {
        // Show most recent error as response
        const error = failedAttempts.pop();
        error.status = error.status || 401;

        // Response was sent in middleware, abort
        if (response.writableEnded) {
          return;
        }
        next(error);
      }

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    };
  }

  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
