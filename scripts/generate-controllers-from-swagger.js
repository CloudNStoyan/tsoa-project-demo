import { openapi } from '@apidevtools/openapi-schemas';
import Ajv from 'ajv-draft-04';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const SWAGGER_JSON_FILE_PATH = './src/generated/swagger.json';
const GENERATED_FOLDER = './src/generated/asp-net-server/generated';

const swaggerJson = await fs.readFile(SWAGGER_JSON_FILE_PATH, {
  encoding: 'utf-8',
});

const swaggerDocument = JSON.parse(swaggerJson);

// Currently validation only works for 'OpenAPI 3.0' and not
// higher, as of writing TSOA doesn't support 'OpenAPI 3.1'.
if (!swaggerDocument.openapi.startsWith('3.0')) {
  throw new Error(
    `Unsupported OpenAPI version that is not '3.0.X' was found: '${swaggerDocument.openapi}'.`
  );
}

const ajv = new Ajv({
  allErrors: true,
  strict: false,
  validateFormats: false,
});

const valid = ajv.validate(openapi.v3, swaggerDocument);

if (!valid) {
  throw new Error('OpenAPI Schema was not valid!');
}

function isObjectEmpty(obj) {
  for (const prop in obj) {
    if (Object.hasOwn(obj, prop)) {
      return false;
    }
  }

  return true;
}

function hashJsonObject(obj) {
  const json = JSON.stringify(sortObjectKeysRecursively(obj));

  const hash = crypto
    .createHash('sha1')
    .update(json, 'utf-8')
    .digest()
    .toString('hex');

  return hash;
}

function sortObjectKeysRecursively(inputObject) {
  if (Array.isArray(inputObject)) {
    const newArray = [];

    for (let i = 0; i < inputObject.length; i += 1) {
      newArray[i] = sortObjectKeysRecursively(inputObject[i]);
    }

    if (typeof newArray[0] === 'string') {
      newArray.sort((a, b) => a.localeCompare(b));
    }

    return newArray;
  }

  if (typeof inputObject !== 'object' || inputObject === null) {
    return inputObject;
  }

  const newObject = {};

  const sortedKeys = Object.keys(inputObject).sort();

  for (let i = 0; i < sortedKeys.length; i += 1) {
    newObject[sortedKeys[i]] = sortObjectKeysRecursively(
      inputObject[sortedKeys[i]]
    );
  }

  return newObject;
}

function getIndentationString(indentation = 0) {
  return new Array(indentation).fill(' ').join('');
}

function uppercaseFirstLetter(string) {
  return string[0].toUpperCase() + string.slice(1);
}

function lowercaseFirstLetter(string) {
  return string[0].toLowerCase() + string.slice(1);
}

const STATUS_CODES_TO_ENUM_NAMES = {
  100: 'Status100Continue',
  101: 'Status101SwitchingProtocols',
  102: 'Status102Processing',
  200: 'Status200OK',
  201: 'Status201Created',
  202: 'Status202Accepted',
  203: 'Status203NonAuthoritative',
  204: 'Status204NoContent',
  205: 'Status205ResetContent',
  206: 'Status206PartialContent',
  207: 'Status207MultiStatus',
  208: 'Status208AlreadyReported',
  226: 'Status226IMUsed',
  300: 'Status300MultipleChoices',
  301: 'Status301MovedPermanently',
  302: 'Status302Found',
  303: 'Status303SeeOther',
  304: 'Status304NotModified',
  305: 'Status305UseProxy',
  306: 'Status306SwitchProxy',
  307: 'Status307TemporaryRedirect',
  308: 'Status308PermanentRedirect',
  400: 'Status400BadRequest',
  401: 'Status401Unauthorized',
  402: 'Status402PaymentRequired',
  403: 'Status403Forbidden',
  404: 'Status404NotFound',
  405: 'Status405MethodNotAllowed',
  406: 'Status406NotAcceptable',
  407: 'Status407ProxyAuthenticationRequired',
  408: 'Status408RequestTimeout',
  409: 'Status409Conflict',
  410: 'Status410Gone',
  411: 'Status411LengthRequired',
  412: 'Status412PreconditionFailed',
  413: 'Status413RequestEntityTooLarge',
  414: 'Status414UriTooLong',
  415: 'Status415UnsupportedMediaType',
  416: 'Status416RequestedRangeNotSatisfiable',
  417: 'Status417ExpectationFailed',
  418: 'Status418ImATeapot',
  419: 'Status419AuthenticationTimeout',
  421: 'Status421MisdirectedRequest',
  422: 'Status422UnprocessableEntity',
  423: 'Status423Locked',
  424: 'Status424FailedDependency',
  426: 'Status426UpgradeRequired',
  428: 'Status428PreconditionRequired',
  429: 'Status429TooManyRequests',
  431: 'Status431RequestHeaderFieldsTooLarge',
  451: 'Status451UnavailableForLegalReasons',
  500: 'Status500InternalServerError',
  501: 'Status501NotImplemented',
  502: 'Status502BadGateway',
  503: 'Status503ServiceUnavailable',
  504: 'Status504GatewayTimeout',
  505: 'Status505HttpVersionNotsupported',
  506: 'Status506VariantAlsoNegotiates',
  507: 'Status507InsufficientStorage',
  508: 'Status508LoopDetected',
  510: 'Status510NotExtended',
  511: 'Status511NetworkAuthenticationRequired',
  // This is an unofficial status code originally defined by Nginx and is commonly used in logs when the client has disconnected.
  499: 'Status499ClientClosedRequest',
};

const HTTP_METHODS_TO_ATTRIBUTE_NAMES = {
  get: 'HttpGet',
  post: 'HttpPost',
  put: 'HttpPut',
  patch: 'HttpPatch',
  delete: 'HttpDelete',
  head: 'HttpHead',
  options: 'HttpOptions',
};

class DotNetModel {
  #swaggerDocument;
  #rootNamespace;
  #modelsRegistry;

  constructor({ swaggerDocument, rootNamespace }) {
    this.#swaggerDocument = swaggerDocument;
    this.#rootNamespace = rootNamespace;

    this.models = this.GenerateModels();

    this.#modelsRegistry = new Map();

    for (const model of this.models) {
      this.#modelsRegistry.set(model.name, model);
    }

    const operations = this.GenerateOperations();

    this.additionalExamples =
      this.GenerateAdditionalExamplesAndUpdateOperations(operations);

    this.controllers = this.GenerateControllers(operations);
  }

  SchemaIsEnum(schema) {
    return schema.type === 'string' && Array.isArray(schema.enum);
  }

  GetArrayItemType(dotnetType) {
    if (dotnetType.type !== 'array') {
      return dotnetType;
    }

    return this.GetArrayItemType(dotnetType.itemType);
  }

  ResolveDotnetType(schema) {
    if (Array.isArray(schema.allOf) && schema.allOf.length === 1) {
      return this.ResolveDotnetType(schema.allOf[0]);
    }

    if (schema.$ref) {
      if (!schema.$ref.startsWith('#/components/schemas/')) {
        throw new Error(
          "Found a ref that doesn't point to #/components/schema"
        );
      }

      const typeName = schema.$ref.split('#/components/schemas/')[1];

      const schemaType = this.#swaggerDocument.components.schemas[typeName];

      const isEnum = this.SchemaIsEnum(schemaType);

      if (schemaType.type != 'object' && !isEnum) {
        return this.ResolveDotnetType(schemaType);
      }

      return { resolved: typeName, type: isEnum ? 'enum' : 'object' };
    }

    switch (schema.type) {
      case 'array': {
        const itemType = this.ResolveDotnetType(schema.items);

        return {
          resolved: `${itemType.resolved}[]`,
          itemType,
          type: 'array',
        };
      }
      case 'string': {
        if (schema.format === 'uuid') {
          return { resolved: 'Guid', type: 'object', builtin: true };
        } else if (schema.format === 'date') {
          return { resolved: 'DateOnly', type: 'object', builtin: true };
        } else if (schema.format === 'date-time') {
          return { resolved: 'DateTime', type: 'object', builtin: true };
        } else {
          return { resolved: 'string', type: 'literal' };
        }
      }
      case 'boolean': {
        return { resolved: 'bool', type: 'literal' };
      }
      case 'integer': {
        return { resolved: 'int', type: 'literal' };
      }
      case 'number': {
        if (schema.format === 'float') {
          return { resolved: 'float', type: 'literal' };
        } else if (schema.format === 'double') {
          return { resolved: 'double', type: 'literal' };
        } else if (schema.format === 'int32') {
          return { resolved: 'int', type: 'literal' };
        } else if (schema.format === 'int64') {
          return { resolved: 'long', type: 'literal' };
        } else {
          throw new Error(`Unexpected number format '${schema.format}'.`);
        }
      }
      default: {
        throw new Error(`Unexpected schema type '${schema.type}'.`);
      }
    }
  }

  GenerateXmlObject(schema) {
    const output = {
      summary: schema.description,
    };

    for (const key in output) {
      if (output[key] !== undefined) {
        return output;
      }
    }

    return '';
  }

  GeneratePropertyAttributes({ schema, required }) {
    const attributes = [];

    if (schema.minLength !== undefined || schema.minItems !== undefined) {
      attributes.push(`[MinLength(${schema.minLength || schema.minItems})]`);
    }

    if (schema.maxLength !== undefined || schema.maxItems !== undefined) {
      attributes.push(`[MaxLength(${schema.maxLength || schema.maxItems})]`);
    }

    if (schema.maximum !== undefined || schema.minimum !== undefined) {
      const numberType = this.ResolveDotnetType(schema);

      const maximum = schema.maximum || `${numberType}.MaxValue`;
      const minimum = schema.minimum || '0';

      attributes.push(`[Range(${minimum}, ${maximum})]`);
    }

    if (required === true) {
      attributes.push('[Required]');
    }

    return attributes;
  }

  GenerateProperty({ schema, name, required }) {
    return {
      name,
      type: schema.type,
      required,
      xmlObject: this.GenerateXmlObject(schema),
      dotnetType: this.ResolveDotnetType(schema),
      nullable: schema.nullable || false,
      attributes: this.GeneratePropertyAttributes({ schema, required }),
      example: schema.example,
    };
  }

  GenerateModel({ schema, name }) {
    const properties = [];

    for (const propertyName in schema.properties) {
      const propertySchema = schema.properties[propertyName];

      const isRequired = schema.required?.includes(propertyName) || false;

      properties.push(
        this.GenerateProperty({
          schema: propertySchema,
          name: propertyName,
          required: isRequired,
        })
      );
    }

    const imports = new Set();

    const hasAttributes =
      properties.findIndex((prop) => prop.attributes.length > 0) !== -1;

    if (hasAttributes) {
      const dataAnnotationsImport =
        'using System.ComponentModel.DataAnnotations;';

      if (!imports.has(dataAnnotationsImport)) {
        imports.add(dataAnnotationsImport);
      }
    }

    const hasExample =
      schema.example !== undefined ||
      properties.findIndex((prop) => prop.example === undefined) === -1;

    if (hasExample) {
      const filtersImport = `using ${this.#rootNamespace}.SwashbuckleFilters;`;

      if (!imports.has(filtersImport)) {
        imports.add(filtersImport);
      }

      const examplesImport = `using ${this.#rootNamespace}.Generated.Examples;`;

      if (!imports.has(examplesImport)) {
        imports.add(examplesImport);
      }
    }

    let jsonExample = schema.example;

    if (hasExample && jsonExample === undefined) {
      jsonExample = {};

      for (const property of properties) {
        jsonExample[property.name] = property.example;
      }
    }

    const example = jsonExample
      ? {
          value: jsonExample,
          hash: hashJsonObject(jsonExample),
        }
      : undefined;

    return {
      name,
      type: 'class',
      xmlObject: this.GenerateXmlObject(schema),
      properties,
      hasExample,
      example,
      imports,
    };
  }

  GenerateEnumModel({ schema, name }) {
    return {
      name,
      type: 'enum',
      enumMembers: schema.enum,
      xmlObject: this.GenerateXmlObject(schema),
    };
  }

  GenerateModels() {
    const generatedModels = [];

    const schemas = this.#swaggerDocument.components.schemas;

    for (const schemaName in schemas) {
      const schema = schemas[schemaName];

      if (schema.type === 'object') {
        generatedModels.push(this.GenerateModel({ schema, name: schemaName }));
      }

      if (schema.type === 'string' && Array.isArray(schema.enum)) {
        generatedModels.push(
          this.GenerateEnumModel({ schema, name: schemaName })
        );
      }
    }

    return generatedModels;
  }

  GenerateTags(operations) {
    const tagSchemas = this.#swaggerDocument.tags;

    const tagsMap = new Map();

    for (const operation of operations) {
      for (const operationTag of operation.schema.tags) {
        if (!tagsMap.has(operationTag)) {
          tagsMap.set(operationTag, { name: operationTag });
        }
      }
    }

    const tags = Array.from(tagsMap.values()).map((tag) => {
      const tagSchema = tagSchemas.find((t) => t.name === tag.name);
      if (tagSchema) {
        return { ...tag, xmlObject: this.GenerateXmlObject(tagSchema) };
      }

      return tag;
    });

    return tags;
  }

  ResponseSchemaIsInlineObject(schema) {
    if (schema.type === 'array') {
      if (schema.items.$ref) {
        return false;
      }
    }

    if (schema.$ref) {
      return false;
    }

    if (schema.type === 'object') {
      return true;
    }

    return false;
  }

  GenerateBodyParamName(dotnetType) {
    const isArray = dotnetType.type === 'array';

    let unwrappedType = dotnetType;

    if (isArray) {
      while (unwrappedType.type === 'array') {
        unwrappedType = unwrappedType.itemType;
      }
    }

    if (
      (unwrappedType.type !== 'object' && unwrappedType.type !== 'enum') ||
      unwrappedType.builtin
    ) {
      return 'body';
    }

    let name = lowercaseFirstLetter(unwrappedType.resolved);

    if (isArray) {
      // TODO: if we want to be fancy we can use this package:
      // https://github.com/plurals/pluralize
      name += 's';
    }

    return name;
  }

  ThrowIfResponseContentIsInvalid(content) {
    if (!content) {
      throw new Error(
        `Response '200' did not have 'application/json' content:\n${JSON.stringify(content, null, 2)}`
      );
    }

    if (this.ResponseSchemaIsInlineObject(content.schema)) {
      throw new Error(
        `Operation responses should have a reference to a schema instead of a inline object: \n${JSON.stringify(content.schema, null, 2)}`
      );
    }
  }

  GenerateReturnType(responses) {
    if (responses['204'] && !responses['200']) {
      return { resolved: 'void', type: 'literal' };
    }

    if (responses['200']) {
      const content = responses['200'].content['application/json'];

      this.ThrowIfResponseContentIsInvalid(content);

      // TODO: How to solve this in DotNet?
      // if (responses['204']) {
      //   return `${this.resolveType(content.schema)} | void`;
      // }

      return this.ResolveDotnetType(content.schema);
    }

    throw new Error(
      `Unexpected response object:\n${JSON.stringify(responses, null, 2)}`
    );
  }

  GenerateControllerParameters(operation) {
    const parameters = [];

    for (const parameterInfo of operation.parameters) {
      const attributes = [];

      if (parameterInfo.in === 'query') {
        attributes.push('[FromQuery]');
      } else if (parameterInfo.in === 'header') {
        attributes.push('[FromHeader]');
      } else if (parameterInfo.in === 'path') {
        attributes.push('[FromRoute]');
      } else if (parameterInfo.in === 'cookie') {
        throw new Error(
          `.NET doesn't support 'Cookie' OpenAPI parameters, 'Cookie' OpenAPI parameter found in '${operation.operationId}' operation.`
        );
      } else {
        throw new Error(`Invalid parameter.in value '${parameterInfo.in}'.`);
      }

      if (parameterInfo.required) {
        attributes.push('[Required]');
      }

      const parameter = {
        attributes,
        type: parameterInfo.in,
        name: parameterInfo.name,
        schema: parameterInfo.schema,
        default: parameterInfo.schema.default,
        dotnetType: this.ResolveDotnetType(parameterInfo.schema),
        description: parameterInfo.description,
      };

      parameters.push(parameter);
    }

    if (operation.requestBody) {
      const body = operation.requestBody;

      const content = body.content['application/json'];

      if (!content) {
        throw new Error(
          `Request body did not have 'application/json' content:\n${JSON.stringify(body, null, 2)}`
        );
      }

      const attributes = ['[FromBody]'];

      if (body.required) {
        attributes.push('[Required]');
      }

      const dotnetType = this.ResolveDotnetType(content.schema);

      const parameter = {
        attributes,
        type: 'body',
        name: this.GenerateBodyParamName(dotnetType),
        schema: content.schema,
        default: undefined,
        dotnetType,
        description: body.description,
      };

      parameters.push(parameter);
    }

    return parameters;
  }

  GenerateMethodAttribute(operation) {
    let path = operation.path;

    if (path.startsWith('/')) {
      path = path.slice(1);
    }

    const firstPart = path.split('/')[0].toLowerCase();

    const tags = new Set(operation.schema.tags.map((tag) => tag.toLowerCase()));

    const firstPartIsControllerName = tags.has(firstPart);

    if (firstPartIsControllerName) {
      path = path.slice(firstPart.length);
    }

    if (path.startsWith('/')) {
      path = path.slice(1);
    }

    let output = `[${HTTP_METHODS_TO_ATTRIBUTE_NAMES[operation.method]}`;

    if (path.length > 0) {
      output += `("${path}")`;
    }

    output += ']';

    return output;
  }

  GenerateResponse(responseSchemes) {
    const responses = [];

    for (const statusCode in responseSchemes) {
      const responseSchema = responseSchemes[statusCode];

      const response = {
        statusCode: Number(statusCode),
        description: responseSchema.description,
      };

      if (response.statusCode === 204) {
        responses.push(response);
        continue;
      }

      const content = responseSchema.content['application/json'];

      response.dotnetType = this.ResolveDotnetType(content.schema);

      response.examples = [];

      if (content.example) {
        response.examples.push({
          hash: hashJsonObject(content.example),
          value: content.example,
        });
      }

      if (content.examples) {
        response.examples = [
          ...response.examples,
          ...Object.values(content.examples).map((example) => {
            return {
              hash: hashJsonObject(example.value),
              value: example.value,
            };
          }),
        ];
      }

      responses.push(response);
    }

    responses.sort((a, b) => b.statusCode - a.statusCode);

    return responses;
  }

  GenerateAdditionalExamplesAndUpdateOperations(operations) {
    const arrayExamplesMap = new Map();

    for (const operation of operations) {
      for (const response of operation.responses) {
        if (
          !(
            response.dotnetType?.type === 'array' &&
            response.dotnetType.itemType?.type !== 'array' &&
            response.examples?.length > 0
          )
        ) {
          continue;
        }

        const dotnetType = response.dotnetType.itemType;

        if (!arrayExamplesMap.has(dotnetType.resolved)) {
          arrayExamplesMap.set(dotnetType.resolved, new Map());
        }

        const examplesMap = arrayExamplesMap.get(dotnetType.resolved);

        for (const example of response.examples) {
          const hashedExample = examplesMap.get(example.hash);

          if (!hashedExample) {
            examplesMap.set(example.hash, {
              count: 1,
              example,
              dotnetType: response.dotnetType,
            });
          } else {
            examplesMap.set(example.hash, {
              count: hashedExample.count + 1,
              example,
              dotnetType: response.dotnetType,
            });
          }
        }
      }
    }

    const defaultArrayExampleMap = new Map();
    const hashesToExamples = new Map();

    const additionalExamples = [];

    for (const [type, availableExamples] of arrayExamplesMap) {
      for (const [hash, exampleMeta] of availableExamples) {
        hashesToExamples.set(hash, {
          example: exampleMeta.example,
          dotnetType: exampleMeta.dotnetType,
        });
      }

      const [defaultHash, _] = Array.from(availableExamples).sort(
        ([_a, a], [_b, b]) => b.count - a.count
      )[0];

      defaultArrayExampleMap.set(type, defaultHash);
    }

    for (const operation of operations) {
      for (const response of operation.responses) {
        if (
          response.dotnetType?.type === 'array' &&
          response.dotnetType.itemType.type !== 'array' &&
          response.examples?.length > 0
        ) {
          for (const example of response.examples) {
            const dotnetType = response.dotnetType.itemType;

            const defaultArrayExampleHash = defaultArrayExampleMap.get(
              dotnetType.resolved
            );

            if (defaultArrayExampleHash === example.hash) {
              continue;
            }

            operation.hasOperationSpecificExamples = true;

            const statusCodeAsEnumType = `StatusCodes.${STATUS_CODES_TO_ENUM_NAMES[response.statusCode]}`;

            const operationId = operation.schema.operationId;

            additionalExamples.push({
              name: operationId,
              resolvedDotnetType: response.dotnetType.resolved,
              model: this.#modelsRegistry.get(dotnetType.resolved),
              example,
            });

            const swaggerResponseAttr = `[SwaggerResponseExample(${statusCodeAsEnumType}, typeof(${operationId}Example))]`;

            operation.attributes.push(swaggerResponseAttr);
          }
        }
      }
    }

    for (const [type, exampleHash] of defaultArrayExampleMap) {
      const exampleMetadata = hashesToExamples.get(exampleHash);

      additionalExamples.push({
        name: `Multiple${type}`,
        resolvedDotnetType: exampleMetadata.dotnetType.resolved,
        model: this.#modelsRegistry.get(
          exampleMetadata.dotnetType.itemType.resolved
        ),
        example: exampleMetadata.example,
      });
    }

    for (const operation of operations) {
      for (const response of operation.responses) {
        if (
          response.dotnetType === undefined ||
          response.dotnetType.type === 'array' ||
          !Array.isArray(response.examples) ||
          response.examples.length === 0 ||
          response.statusCode > 399
        ) {
          continue;
        }

        const model = this.#modelsRegistry.get(response.dotnetType.resolved);

        const example = response.examples[0];

        if (model.hasExample && model.example.hash === example.hash) {
          continue;
        }

        operation.hasOperationSpecificExamples = true;

        const statusCodeAsEnumType = `StatusCodes.${STATUS_CODES_TO_ENUM_NAMES[response.statusCode]}`;

        const operationId = operation.schema.operationId;

        additionalExamples.push({
          name: operationId,
          resolvedDotnetType: response.dotnetType.resolved,
          model,
          example,
        });

        const swaggerResponseAttr = `[SwaggerResponseExample(${statusCodeAsEnumType}, typeof(${operationId}Example))]`;

        operation.attributes.push(swaggerResponseAttr);
      }
    }

    return additionalExamples;
  }

  GenerateOperations() {
    const paths = this.#swaggerDocument.paths;

    const operations = [];

    for (const path in paths) {
      for (const method in paths[path]) {
        const operationSchema = paths[path][method];
        const operationResponses = Object.entries(operationSchema.responses);

        const operation = {
          schema: operationSchema,
          path,
          method,
          returnType: this.GenerateReturnType(operationSchema.responses),
          parameters: this.GenerateControllerParameters(operationSchema),
          responses: this.GenerateResponse(operationSchema.responses),
        };

        const attributes = [];

        if (operation.schema.deprecated) {
          attributes.push('[Obsolete]');
        }

        attributes.push(this.GenerateMethodAttribute(operation));

        for (const response of operation.responses) {
          const statusCodeAsEnumType = `StatusCodes.${STATUS_CODES_TO_ENUM_NAMES[response.statusCode]}`;

          attributes.push(`[ProducesResponseType(${statusCodeAsEnumType})]`);

          const isErrorResponse =
            response.statusCode > 399 && response.statusCode < 600;

          if (
            isErrorResponse &&
            response.dotnetType.resolved !== 'ProblemDetails'
          ) {
            throw new Error(
              `Expected error responses to be of type 'ProblemDetails' instead got '${response.dotnetType.resolved}'.`
            );
          }

          if (isErrorResponse && response.examples.length > 0) {
            for (const example of response.examples) {
              attributes.push(
                `[SwaggerErrorExample(${statusCodeAsEnumType}, "${example.value.title}", "${example.value.detail}")]`
              );
            }
          }
        }

        operation.attributes = attributes;

        const xmlObject = {};
        xmlObject.summary = operationSchema.summary;
        xmlObject.remarks = operationSchema.description;
        xmlObject.params = operation.parameters.map((p) => {
          return {
            name: p.name,
            description: p.description,
          };
        });

        xmlObject.responses = operationResponses.map(
          ([responseCode, responseSchema]) => {
            return {
              code: responseCode,
              description: responseSchema.description,
            };
          }
        );

        operation.xmlObject = xmlObject;

        operations.push(operation);
      }
    }

    return operations;
  }

  GenerateControllers(operations) {
    const tags = this.GenerateTags(operations);

    const controllers = [];

    for (const tag of tags) {
      const tagOperations = operations.filter((op) =>
        op.schema.tags.includes(tag.name)
      );

      const hasOperationSpecificExamples =
        tagOperations.findIndex(
          (op) => op.hasOperationSpecificExamples === true
        ) !== -1;

      const controller = {
        name: tag.name,
        xmlObject: tag.xmlObject,
        operations: tagOperations,
        attributes: ['[ApiController]', '[Route("[controller]")]'],
        imports: [
          'using System.ComponentModel.DataAnnotations;',
          'using Microsoft.AspNetCore.Mvc;',
        ],
      };

      if (hasOperationSpecificExamples) {
        controller.imports.push('using Swashbuckle.AspNetCore.Filters;');
      }

      controller.imports.push(
        `using ${this.#rootNamespace}.SwashbuckleFilters;`
      );
      controller.imports.push(`using ${this.#rootNamespace}.Generated.Models;`);

      if (hasOperationSpecificExamples) {
        controller.imports.push(
          `using ${this.#rootNamespace}.Generated.Examples;`
        );
      }

      const commonAttributesMap = new Map();
      const possibleCommonAttributes = [
        'ProducesResponseType',
        'SwaggerErrorExample',
      ];

      const ignoredAttributes = [
        '[ProducesResponseType(StatusCodes.Status200OK)]',
      ];

      for (const operation of controller.operations) {
        for (const attr of operation.attributes) {
          for (const possibleCommonAttr of possibleCommonAttributes) {
            if (
              attr.startsWith(`[${possibleCommonAttr}`) &&
              !ignoredAttributes.includes(attr)
            ) {
              const count = commonAttributesMap.get(attr) || 0;

              commonAttributesMap.set(attr, count + 1);
            }
          }
        }
      }

      const commonAttributes = Array.from(commonAttributesMap)
        .filter(([attr, count]) => count === controller.operations.length)
        .map(([attr]) => attr);

      if (commonAttributes.length > 0) {
        controller.attributes = [...controller.attributes, ...commonAttributes];

        for (const operation of controller.operations) {
          operation.attributes = operation.attributes.filter(
            (attr) => !commonAttributes.includes(attr)
          );
        }
      }

      controllers.push(controller);
    }

    return controllers;
  }
}

class RenderModel {
  #model;
  #rootNamespace;

  constructor({ model, rootNamespace }) {
    this.#model = model;
    this.#rootNamespace = rootNamespace;
  }

  renderXml({ xmlObject, indentation = 0 }) {
    if (isObjectEmpty(xmlObject)) {
      return '';
    }

    let indentationString = getIndentationString(indentation);

    let output = '';

    if ('summary' in xmlObject) {
      output += `${indentationString}/// <summary>\n`;
      output += `${indentationString}/// ${xmlObject['summary']}\n`;
      output += `${indentationString}/// </summary>\n`;
    }

    return output;
  }

  renderAttributes({ attributes, indentation = 0 }) {
    if (attributes.length === 0) {
      return '';
    }

    let output = '';

    let indentationString = getIndentationString(indentation);

    for (const attribute of attributes) {
      output += `${indentationString}${attribute}\n`;
    }

    return output;
  }

  renderEnum(enumModel) {
    let output = '';

    output += this.renderXml({ xmlObject: enumModel.xmlObject });
    output += `public enum ${enumModel.name} {\n`;

    for (const enumMember of enumModel.enumMembers) {
      output += `  ${enumMember},\n`;
    }

    output += '}';

    return output;
  }

  renderProperty(property) {
    let output = '';

    output += this.renderXml({ xmlObject: property.xmlObject, indentation: 2 });

    const indentationString = getIndentationString(2);

    output += this.renderAttributes({
      attributes: property.attributes,
      indentation: 2,
    });

    const nullableString = property.nullable ? '?' : '';
    const requiredModifierString =
      (property.dotnetType.resolved === 'string' ||
        property.dotnetType.itemType?.resolved === 'string') &&
      property.required
        ? 'required '
        : '';

    output += `${indentationString}public ${requiredModifierString}${property.dotnetType.resolved}${nullableString} ${uppercaseFirstLetter(property.name)} { get; set; }\n`;

    return output.trimEnd();
  }

  renderClass(classModel) {
    let output = '';

    output += this.renderXml({ xmlObject: classModel.xmlObject });
    if (classModel.hasExample) {
      output += `[PropertiesExample(typeof(${classModel.name}Example))]\n`;
    }
    output += `public class ${classModel.name} {\n`;

    for (const property of classModel.properties) {
      output += `${this.renderProperty(property)}\n`;
    }

    output += '}';

    return output;
  }

  render() {
    const model = this.#model;
    const rootNamespace = this.#rootNamespace;

    let output = '';

    if (model.imports?.size > 0) {
      output += Array.from(model.imports).join('\n');
      output += '\n\n';
    }

    output += `namespace ${rootNamespace}.Generated.Models;\n\n`;

    if (model.type === 'enum') {
      output += this.renderEnum(model);
    }

    if (model.type === 'class') {
      output += this.renderClass(model);
    }

    return output.trim();
  }
}

class RenderExample {
  #model;
  #name;
  #resolvedDotnetType;
  #example;
  #rootNamespace;

  constructor({
    model,
    name,
    resolvedDotnetType,
    example,
    isArray,
    rootNamespace,
  }) {
    this.#model = model;
    this.#name = name;
    this.#resolvedDotnetType = resolvedDotnetType;
    this.#example = example;
    this.#rootNamespace = rootNamespace;
  }

  renderPropertyValue(dotnetType, example) {
    let output = '';

    if (dotnetType.type === 'literal') {
      if (dotnetType.resolved === 'string') {
        output += `"${example}"`;
      } else {
        output += example;
      }
    } else if (dotnetType.type === 'object') {
      output += `${dotnetType.resolved}.Parse("${example}")`;
    } else if (dotnetType.type === 'enum') {
      output += `${dotnetType.resolved}.${example}`;
    } else if (dotnetType.type === 'array') {
      if (!Array.isArray(example)) {
        throw new Error(
          `Expected array example, but got '${typeof example}' example.`
        );
      }

      output += '[';
      output += example
        .map((exampleElement) =>
          this.renderPropertyValue(dotnetType.itemType, exampleElement)
        )
        .join(', ');
      output += ']';
    } else {
      throw new Error(`Unexpected type '${dotnetType.type}' found.`);
    }

    return output;
  }

  renderProperty(property, schemaExample, indentation = 0) {
    const indentationString = getIndentationString(indentation);

    let output = '';

    const name = uppercaseFirstLetter(property.name);

    output += `${indentationString}${name} = `;
    output += `${this.renderPropertyValue(property.dotnetType, schemaExample[property.name])},\n`;

    return output;
  }

  renderArrayExample(indentation = 0) {
    const model = this.#model;

    const indentationString = getIndentationString(indentation);

    let output = '';

    output += `${indentationString}return [\n`;

    const examples = [];

    for (const exampleElement of this.#example) {
      const exampleIndentationString = getIndentationString(indentation + 2);
      let exampleOutput = '';
      exampleOutput += `${exampleIndentationString}new()\n`;
      exampleOutput += `${exampleIndentationString}{\n`;

      for (const property of model.properties) {
        exampleOutput += this.renderProperty(
          property,
          exampleElement,
          indentation + 4
        );
      }

      exampleOutput += `${exampleIndentationString}}`;

      examples.push(exampleOutput);
    }

    output += examples.join(',\n');
    output += `\n${indentationString}];\n`;

    return output;
  }

  renderExample(indentation = 0) {
    const model = this.#model;

    const indentationString = getIndentationString(indentation);

    let output = '';

    output += `${indentationString}return new()\n`;
    output += `${indentationString}{\n`;

    for (const property of model.properties) {
      output += this.renderProperty(property, this.#example, indentation + 2);
    }

    output += `${indentationString}};\n`;

    return output;
  }

  render() {
    const rootNamespace = this.#rootNamespace;

    const exampleIsArray = Array.isArray(this.#example);

    let output = '';

    output += `using ${rootNamespace}.Generated.Models;\n`;
    output += 'using Swashbuckle.AspNetCore.Filters;\n\n';

    output += `namespace ${rootNamespace}.Generated.Examples;\n\n`;

    output += `public class ${this.#name}Example : IExamplesProvider<${this.#resolvedDotnetType}>\n`;
    output += '{\n';
    output += `  public ${this.#resolvedDotnetType} GetExamples()\n`;
    output += '  {\n';
    if (exampleIsArray) {
      output += this.renderArrayExample(4);
    } else {
      output += this.renderExample(4);
    }
    output += '  }\n';
    output += '}';

    return output;
  }
}

class RenderController {
  #controller;
  #rootNamespace;

  constructor({ controller, rootNamespace }) {
    this.#controller = controller;
    this.#rootNamespace = rootNamespace;
  }

  renderValue(dotnetType, value) {
    let output = '';

    if (dotnetType.type === 'literal') {
      if (dotnetType.resolved === 'string') {
        output += `"${value}"`;
      } else {
        output += value;
      }
    } else if (dotnetType.type === 'object') {
      output += `${dotnetType.resolved}.Parse("${value}")`;
    } else if (dotnetType.type === 'enum') {
      output += `${dotnetType.resolved}.${value}`;
    } else if (dotnetType.type === 'array') {
      if (!Array.isArray(value)) {
        throw new Error(
          `Expected array value, but got '${typeof value}' value.`
        );
      }

      output += '[';
      output += value
        .map((valueElement) =>
          this.renderValue(dotnetType.itemType, valueElement)
        )
        .join(', ');
      output += ']';
    } else {
      throw new Error(`Unexpected type '${dotnetType.type}' found.`);
    }

    return output;
  }

  renderAttributes(attributes, indentation = 0) {
    if (attributes.length === 0) {
      return '';
    }

    let output = '';

    let indentationString = getIndentationString(indentation);

    for (const attribute of attributes) {
      output += `${indentationString}${attribute}\n`;
    }

    return output;
  }

  renderXml(xmlObject, indentation = 0) {
    if (isObjectEmpty(xmlObject)) {
      return '';
    }

    let indentationString = getIndentationString(indentation);

    let output = '';

    if ('summary' in xmlObject) {
      output += `${indentationString}/// <summary>\n`;
      output += `${indentationString}/// ${xmlObject['summary']}\n`;
      output += `${indentationString}/// </summary>\n`;
    }

    if ('remarks' in xmlObject) {
      output += `${indentationString}/// <remarks>${xmlObject['remarks']}</remarks>\n`;
    }

    if ('params' in xmlObject) {
      const params = xmlObject['params'];

      for (const param of params) {
        output += `${indentationString}/// <param name="${param.name}">${param.description}</param>\n`;
      }
    }

    if ('responses' in xmlObject) {
      const responses = xmlObject['responses'];

      for (const response of responses) {
        output += `${indentationString}/// <response code="${response.code}">${response.description}</response>\n`;
      }
    }

    return output;
  }

  renderParameter(parameter) {
    let output = '';

    output += parameter.attributes.join('');
    output += ' ';
    output += parameter.dotnetType.resolved;
    output += ' ';
    output += parameter.name;

    if (parameter.default !== undefined) {
      const renderedValue = this.renderValue(
        parameter.dotnetType,
        parameter.default
      );

      output += ` = ${renderedValue}`;
    }

    return output;
  }

  renderParameters(parameters) {
    if (parameters.length === 0) {
      return '';
    }

    return parameters.map((param) => this.renderParameter(param)).join(', ');
  }

  renderOperation(operation, indentation = 0) {
    const indentationString = getIndentationString(indentation);

    let output = '';

    output += this.renderXml(operation.xmlObject, indentation);
    output += this.renderAttributes(operation.attributes, indentation);
    output += indentationString;
    output += 'public ActionResult';

    if (operation.returnType.resolved !== 'void') {
      output += `<${operation.returnType.resolved}>`;
    }

    output += ` ${operation.schema.operationId}(${this.renderParameters(operation.parameters)})\n`;
    output += `${indentationString}{\n`;
    output += `${indentationString}  throw new NotImplementedException();\n`;
    output += `${indentationString}}\n\n`;

    return output;
  }

  render() {
    const controller = this.#controller;

    let output = '';

    output += controller.imports.join('\n');
    output += '\n\n';

    output += `namespace ${this.#rootNamespace}.Generated.Controllers;\n\n`;

    output += controller.attributes.join('\n');
    output += '\n';
    output += `public class ${controller.name}Controller : ControllerBase\n`;
    output += '{\n';

    for (const operation of controller.operations) {
      output += this.renderOperation(operation, 2);
    }

    output = output.trim();

    output += '\n}';

    return output;
  }
}

const options = {
  rootNamespace: 'AspNetServer',
  ignoredModels: new Set(['ProblemDetails']),
};

const dotNetModel = new DotNetModel({
  swaggerDocument,
  rootNamespace: options.rootNamespace,
});

await fs.mkdir(path.join(GENERATED_FOLDER, 'models'), { recursive: true });
await fs.mkdir(path.join(GENERATED_FOLDER, 'examples'), { recursive: true });
for (const additionalExample of dotNetModel.additionalExamples) {
  await fs.writeFile(
    path.join(
      GENERATED_FOLDER,
      'examples',
      `${additionalExample.name}Example.cs`
    ),
    new RenderExample({
      model: additionalExample.model,
      name: additionalExample.name,
      resolvedDotnetType: additionalExample.resolvedDotnetType,
      example: additionalExample.example.value,
      rootNamespace: options.rootNamespace,
    }).render(),
    {
      encoding: 'utf-8',
    }
  );
}

for (const model of dotNetModel.models) {
  if (model.type === 'class' && model.hasExample) {
    await fs.writeFile(
      path.join(GENERATED_FOLDER, 'examples', `${model.name}Example.cs`),
      new RenderExample({
        model,
        name: model.name,
        resolvedDotnetType: model.name,
        example: model.example.value,
        rootNamespace: options.rootNamespace,
      }).render(),
      {
        encoding: 'utf-8',
      }
    );
  }

  if (!options.ignoredModels.has(model.name)) {
    await fs.writeFile(
      path.join(GENERATED_FOLDER, 'models', `${model.name}.cs`),
      new RenderModel({ model, rootNamespace: options.rootNamespace }).render(),
      {
        encoding: 'utf-8',
      }
    );
  }
}
await fs.mkdir(path.join(GENERATED_FOLDER, 'controllers'), { recursive: true });
for (const controller of dotNetModel.controllers) {
  await fs.writeFile(
    path.join(
      GENERATED_FOLDER,
      'controllers',
      `${controller.name}Controller.cs`
    ),
    new RenderController({
      controller,
      rootNamespace: options.rootNamespace,
    }).render(),
    {
      encoding: 'utf-8',
    }
  );
}
