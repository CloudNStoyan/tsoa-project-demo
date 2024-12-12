import { openapi } from '@apidevtools/openapi-schemas';
import Ajv from 'ajv-draft-04';
import fs from 'node:fs/promises';

const SWAGGER_JSON_FILE_PATH = './src/generated/swagger.json';

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

function uppercaseFirstLetter(string) {
  return string[0].toUpperCase() + string.slice(1);
}

function lowercaseFirstLetter(string) {
  return string[0].toLowerCase() + string.slice(1);
}

class TopologicalGraph {
  constructor(jobs) {
    this.nodes = [];
    this.graph = {};

    for (const job of jobs) {
      this.#addNode(job);
    }
  }

  static sort({ jobs, dependencies }) {
    const graph = new TopologicalGraph(jobs);

    for (const [job, dependency] of dependencies) {
      graph.#addDependency(job, dependency);
    }

    const orderedJobs = [];

    const nodesWithNoDependents = graph.nodes.filter(
      (node) => node.numOfDependents === 0
    );

    while (nodesWithNoDependents.length > 0) {
      const node = nodesWithNoDependents.pop();
      orderedJobs.push(node.job);

      while (node.dependencies.length > 0) {
        const dep = node.dependencies.pop();
        dep.numOfDependents -= 1;

        if (dep.numOfDependents === 0) {
          nodesWithNoDependents.push(dep);
        }
      }
    }

    const graphHasEdges =
      graph.nodes.filter((node) => node.numOfDependents > 0).length > 0;

    if (graphHasEdges) {
      throw new Error(
        "The graph can't be topologically sorted because there are edges!"
      );
    }

    return orderedJobs;
  }

  #addNode(job) {
    this.graph[job] = {
      job,
      dependencies: [],
      numOfDependents: 0,
    };

    this.nodes.push(this.graph[job]);
  }

  #addDependency(job, dependency) {
    const jobNode = this.#getNode(job);
    const depNode = this.#getNode(dependency);

    jobNode.dependencies.push(depNode);
    depNode.numOfDependents += 1;
  }

  #getNode(job) {
    if (!(job in this.graph)) {
      this.#addNode(job);
    }

    return this.graph[job];
  }
}

class TypescriptModel {
  #swaggerDocument;

  constructor(swaggerDocument) {
    this.#swaggerDocument = swaggerDocument;
    this.typesRegistry = new Map();

    const { enums, types, interfaces } = this.generateTypings(swaggerDocument);

    this.enums = enums;
    this.types = types;
    this.interfaces = interfaces;

    this.operations = this.generateOperations(swaggerDocument);
    this.tags = this.generateOperationTags(swaggerDocument);

    this.apis = this.generateApis({
      operations: this.operations,
      tags: this.tags,
    });
  }

  responseSchemaIsInlineObject(schema) {
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

  throwIfResponseContentIsInvalid(content) {
    if (!content) {
      throw new Error(
        `Response '200' did not have 'application/json' content:\n${JSON.stringify(content, null, 2)}`
      );
    }

    if (this.responseSchemaIsInlineObject(content.schema)) {
      throw new Error(
        `Operation responses should have a reference to a schema instead of a inline object: \n${JSON.stringify(content.schema, null, 2)}`
      );
    }
  }

  unwrapVerboseType(verboseType) {
    let unwrappedType = verboseType;

    while (unwrappedType.type === 'array') {
      unwrappedType = unwrappedType.itemType;
    }

    return unwrappedType;
  }

  generateReturnType(responses) {
    if (responses['204'] && !responses['200']) {
      return { resolvedType: 'void', type: 'literal' };
    }

    if (responses['200']) {
      const content = responses['200'].content['application/json'];

      this.throwIfResponseContentIsInvalid(content);

      const verboseType = this.resolveTypeVerbose(content.schema);

      if (responses['204']) {
        return {
          resolvedType: `${verboseType.resolvedType} | void`,
          type: 'union',
        };
      }

      return verboseType;
    }

    throw new Error(
      `Unexpected response object:\n${JSON.stringify(responses, null, 2)}`
    );
  }

  generatePostprocessMetadata(operations) {
    const traverseTypeInfo = ({ typeInfo, postProcessingMap }) => {
      if (postProcessingMap.has(typeInfo.name)) {
        return;
      }

      postProcessingMap.set(typeInfo.name, typeInfo);

      for (const property of typeInfo.metadata.propertiesThatContainDates) {
        if (!postProcessingMap.has(property.typeInfo.name)) {
          postProcessingMap.set(property.typeInfo.name, property.typeInfo);
        }
      }
    };

    const typesThatNeedPostProcessingMap = new Map();

    for (const operation of operations) {
      if (!operation.hasDates) {
        continue;
      }

      traverseTypeInfo({
        typeInfo: operation.typeInfo,
        postProcessingMap: typesThatNeedPostProcessingMap,
      });
    }

    return typesThatNeedPostProcessingMap.values();
  }

  generateApis({ operations, tags }) {
    const apis = [];

    for (const tag of tags) {
      const api = {
        name: tag.name,
        jsdoc: tag.jsdoc,
        operations: operations.filter((op) => op.tags.includes(tag.name)),
      };

      api.typesThatNeedPostProcessing = this.generatePostprocessMetadata(
        api.operations
      );

      apis.push(api);
    }

    return apis;
  }

  generateOperations(swaggerDocument) {
    const paths = swaggerDocument.paths;

    const operations = [];

    for (const path in paths) {
      const pathOperations = paths[path];

      for (const httpMethod in pathOperations) {
        const openapiOperationData = pathOperations[httpMethod];

        const operation = {
          httpMethod,
          rawPath: path,
          operationId: openapiOperationData.operationId,
          tags: openapiOperationData.tags,
          jsdoc: this.resolveJsdoc(openapiOperationData),
          returnType: this.generateReturnType(openapiOperationData.responses),
          hasDates: false,
        };

        const unwrappedType = this.unwrapVerboseType(operation.returnType);

        if (unwrappedType.type === 'object') {
          const typeInfo = this.typesRegistry.get(unwrappedType.resolvedType);

          operation.typeInfo = typeInfo;

          if (
            typeInfo.metadata?.propertiesThatAreDates?.length > 0 ||
            typeInfo.metadata.propertiesThatContainDates?.length > 0
          ) {
            operation.hasDates = true;
          }
        }

        const allParams = [];

        if (Array.isArray(openapiOperationData.parameters)) {
          for (const operationParam of openapiOperationData.parameters) {
            const param = {
              name: operationParam.name,
              jsdoc: this.resolveJsdoc(operationParam),
              required: operationParam.required || false,
              type: operationParam.in,
              paramType: this.resolveParamType(operationParam.schema),
            };

            const schemaJsdoc = this.resolveJsdoc(operationParam.schema);

            if (schemaJsdoc) {
              param.jsdoc = { ...schemaJsdoc, ...param.jsdoc };
            }

            allParams.push(param);
          }
        }

        // Put optional params at the end of the params array.
        allParams.sort((a, b) => Number(b.required) - Number(a.required));

        operation.allParams = allParams.length > 0 ? allParams : undefined;

        const paramsJsdoc = [];

        if (operation.allParams) {
          for (const param of operation.allParams) {
            paramsJsdoc.push({
              description: param.jsdoc?.description,
              name: param.name,
            });
          }
        }

        if (openapiOperationData.requestBody) {
          operation.body = {
            required: openapiOperationData.requestBody.required,
            jsdoc: this.resolveJsdoc(openapiOperationData.requestBody),
            resolvedType: this.resolveType(
              openapiOperationData.requestBody.content['application/json']
                .schema
            ),
          };

          paramsJsdoc.push({
            description: operation.body.jsdoc?.description,
            name: lowercaseFirstLetter(operation.body.resolvedType),
          });
        }

        if (paramsJsdoc.length > 0) {
          operation.jsdoc = { ...operation.jsdoc, params: paramsJsdoc };
        }

        operations.push(operation);
      }
    }

    return operations;
  }

  generateOperationTags(swaggerDocument) {
    const paths = swaggerDocument.paths;
    const tagsData = swaggerDocument.tags;

    const tagsMap = new Map();

    for (const path in paths) {
      const pathOperations = paths[path];

      for (const httpMethod in pathOperations) {
        const openapiOperationData = pathOperations[httpMethod];

        for (const operationTag of openapiOperationData.tags) {
          if (!tagsMap.has(operationTag)) {
            tagsMap.set(operationTag, { name: operationTag });
          }
        }
      }
    }

    const tags = Array.from(tagsMap.values()).map((tag) => {
      const tagData = tagsData.find((t) => t.name === tag.name);
      if (tagData) {
        return { ...tag, jsdoc: this.resolveJsdoc(tagData) };
      }

      return tag;
    });

    return tags;
  }

  resolveParamType(schema) {
    const typeInfo = this.resolveTypeVerbose(schema);

    const resolvedType = typeInfo.resolvedType;

    if (typeInfo.type === 'object' || typeInfo.type === 'enum') {
      const componentSchema =
        this.#swaggerDocument.components.schemas[resolvedType];

      return {
        resolvedType,
        valueType: componentSchema,
        type: typeInfo.type,
      };
    }

    if (typeInfo.type === 'array') {
      const resolvedItemParamType = this.resolveParamType(schema.items);

      return {
        resolvedType,
        valueType: resolvedItemParamType.valueType,
        type: typeInfo.type,
      };
    }

    return { resolvedType, valueType: schema, type: typeInfo.type };
  }

  getRefSchema(ref) {
    if (!ref.startsWith('#/components/schemas/')) {
      throw new Error(
        `Found a ref that doesn't point to #/components/schema, '${ref}'.`
      );
    }

    const schemaName = ref.split('#/components/schemas/')[1];

    const schema = this.#swaggerDocument.components.schemas[schemaName];

    if (schema === undefined) {
      throw new Error(
        `Found a ref that doesn't point to valid schema, '${ref}'.`
      );
    }

    return { schema, schemaName };
  }

  resolveTypeVerbose(property) {
    if (this.isPropertyAnUnion(property)) {
      return { resolvedType: this.resolveUnion(property), type: 'union' };
    }

    if (Array.isArray(property.allOf)) {
      if (property.allOf.length !== 1) {
        throw new Error(
          `Found an 'allOf' that doesn't have only one element in it:\n${JSON.stringify(property.allOf, null, 2)}`
        );
      }

      return this.resolveTypeVerbose(property.allOf[0]);
    }

    if (property.$ref) {
      const { schema: schemaType, schemaName: typeName } = this.getRefSchema(
        property.$ref
      );

      return {
        resolvedType: typeName,
        type: schemaType.enum ? 'enum' : 'object',
      };
    }

    if (property.type === 'array') {
      const itemTypeInfo = this.resolveTypeVerbose(property.items);

      return {
        resolvedType: `${itemTypeInfo.resolvedType}[]`,
        type: 'array',
        itemType: itemTypeInfo,
      };
    }

    if (
      property.type === 'string' &&
      (property.format === 'date' || property.format === 'date-time')
    ) {
      return { resolvedType: 'Date', type: 'literal' };
    }

    if (
      property.type === 'string' ||
      property.type === 'number' ||
      property.type === 'boolean'
    ) {
      return { resolvedType: property.type, type: 'literal' };
    }

    if (property.type === 'integer') {
      return { resolvedType: 'number', type: 'literal' };
    }

    throw new Error(
      `Invalid property type '${property.type}' in: \n${JSON.stringify(property, null, 2)}`
    );
  }

  resolveUnion(union) {
    if (Array.isArray(union.anyOf)) {
      const resolvedUnionValues = [];
      for (const unionValue of union.anyOf) {
        resolvedUnionValues.push(this.resolveType(unionValue));
      }

      return `(${resolvedUnionValues.join('|')})`;
    }

    if (union.type === 'string') {
      return `(${union.enum.map((value) => `'${value}'`).join('|')})`;
    }

    if (union.type === 'number' || union.type === 'integer') {
      return `(${union.enum.join('|')})`;
    }

    throw new Error(`Invalid union type: '${union.type}'.`);
  }

  isPropertyAnUnion(propertyData) {
    if (propertyData.anyOf) {
      return true;
    }

    if (propertyData.enum) {
      return true;
    }

    return false;
  }

  resolveType(property) {
    return this.resolveTypeVerbose(property).resolvedType;
  }

  resolveJsdoc(property) {
    const jsdocProperties = [
      'description',
      'pattern',
      'format',
      'example',
      'summary',
    ];

    const jsdoc = {};

    let hasJsdoc = false;

    for (const jsdocProp of jsdocProperties) {
      if (property[jsdocProp] !== undefined) {
        hasJsdoc = true;
        jsdoc[jsdocProp] = property[jsdocProp];
      }
    }

    return hasJsdoc ? jsdoc : undefined;
  }

  generateTopologicalOrderOfComponentNames() {
    const schemas = this.#swaggerDocument.components.schemas;

    const componentNames = Object.keys(schemas);

    const dependencies = [];

    for (const componentName of componentNames) {
      const schema = schemas[componentName];

      if (schema.type === 'object') {
        for (const propertyName in schema.properties) {
          let propertySchema = schema.properties[propertyName];

          if (
            Array.isArray(propertySchema.allOf) &&
            propertySchema.allOf.length === 1
          ) {
            propertySchema = propertySchema.allOf[0];
          }

          while (propertySchema.type === 'array') {
            propertySchema = propertySchema.items;
          }

          if (propertySchema.$ref) {
            dependencies.push([
              this.getRefSchema(propertySchema.$ref).schemaName,
              componentName,
            ]);
          }
        }
      }
    }

    return TopologicalGraph.sort({
      jobs: componentNames,
      dependencies,
    });
  }

  generateTypings() {
    const schemas = this.#swaggerDocument.components.schemas;

    const componentNames = this.generateTopologicalOrderOfComponentNames();

    const interfaces = [];
    const types = [];
    const enums = [];

    for (const componentName of componentNames) {
      const componentData = schemas[componentName];

      if (componentData.enum) {
        const tsEnum = this.generateEnum(componentName, componentData);

        enums.push(tsEnum);
      } else if (componentData.type === 'object') {
        const tsInterface = this.generateInterface(
          componentName,
          componentData
        );

        interfaces.push(tsInterface);
      } else {
        const tsType = this.generateType(componentName, componentData);

        types.push(tsType);
      }
    }

    return { interfaces, types, enums };
  }

  generateEnum(enumName, enumData) {
    if (enumData.type !== 'string') {
      throw new Error(
        `Enums that are not strings are not supported, enum type found: '${enumData.type}'.`
      );
    }

    const tsEnum = {
      name: enumName,
      jsdoc: this.resolveJsdoc(enumData),
      values: enumData.enum,
    };

    this.typesRegistry.set(enumName, tsEnum);

    return tsEnum;
  }

  generateInterface(interfaceName, interfaceData) {
    const tsInterface = {
      name: interfaceName,
      jsdoc: this.resolveJsdoc(interfaceData),
    };

    const openapiProperties = Object.entries(interfaceData.properties);
    const requiredProperties = interfaceData.required;

    const tsProperties = [];

    const propertiesThatAreDates = [];
    const propertiesThatContainDates = [];

    for (const [propertyName, propertyData] of openapiProperties) {
      const tsProperty = {
        name: propertyName,
        required: requiredProperties?.includes(propertyName) || false,
        jsdoc: this.resolveJsdoc(propertyData),
      };

      const propertyVerboseType = this.resolveTypeVerbose(propertyData);

      tsProperty.resolvedType = propertyVerboseType.resolvedType;
      tsProperty.verboseType = propertyVerboseType;

      const unwrappedType = this.unwrapVerboseType(propertyVerboseType);

      if (unwrappedType.type === 'object') {
        const typeInfo = this.typesRegistry.get(unwrappedType.resolvedType);

        tsProperty.typeInfo = typeInfo;

        if (
          typeInfo.metadata &&
          (typeInfo.metadata.propertiesThatAreDates.length > 0 ||
            typeInfo.metadata.propertiesThatContainDates.length > 0)
        ) {
          propertiesThatContainDates.push(tsProperty);
        }
      }

      if (tsProperty.resolvedType === 'Date') {
        propertiesThatAreDates.push(tsProperty);
      }

      tsProperties.push(tsProperty);
    }

    tsInterface.properties = tsProperties;

    tsInterface.metadata = {
      propertiesThatAreDates,
      propertiesThatContainDates,
    };

    this.typesRegistry.set(interfaceName, tsInterface);

    return tsInterface;
  }

  generateType(typeName, typeData) {
    const tsType = {
      name: typeName,
      resolvedType: this.resolveType(typeData),
      jsdoc: this.resolveJsdoc(typeData),
    };

    this.typesRegistry.set(typeName, tsType);

    return tsType;
  }
}

class ModelRenderer {
  constructor(model) {
    this.model = model;
  }

  render() {
    return `
    // WARNING: This file was auto-generated by codegen

    ${this.renderImports()}

    ${this.renderEnums()}

    ${this.renderTypes()}

    ${this.renderInterfaces()}

    ${this.renderMainApi()}

    ${this.renderApis()}
    `;
  }

  renderImports() {
    let output = '';

    output +=
      "import { type Options, ClientAPIBase } from '../../client-base.js';";

    return output;
  }

  renderEnums() {
    let output = '';

    for (const tsEnum of this.model.enums) {
      if (tsEnum.jsdoc) {
        output += this.renderJsdoc(tsEnum.jsdoc);
      }

      output += `export enum ${tsEnum.name} {\n`;
      for (const enumValue of tsEnum.values) {
        output += `${enumValue} = "${enumValue}",\n`;
      }
      output += '}\n\n';
    }

    return output;
  }

  renderTypes() {
    let output = '';

    for (const tsType of this.model.types) {
      if (tsType.jsdoc) {
        output += this.renderJsdoc(tsType.jsdoc);
      }

      output += `export type ${tsType.name} = ${tsType.resolvedType};\n\n`;
    }

    return output;
  }

  renderInterfaces() {
    let output = '';

    for (const tsInterface of this.model.interfaces) {
      if (tsInterface.jsdoc) {
        output += this.renderJsdoc(tsInterface.jsdoc);
      }

      output += `export interface ${tsInterface.name} {\n`;

      for (const property of tsInterface.properties) {
        if (property.jsdoc) {
          output += this.renderJsdoc(property.jsdoc);
        }
        output += property.name;

        if (!property.required) {
          output += '?';
        }

        output += `: ${property.resolvedType}\n\n`;
      }

      output += '}\n\n';
    }

    return output;
  }

  renderMainApi() {
    let output = '';

    output += 'export class ClientAPI {\n';

    for (const tag of this.model.tags) {
      output += `${tag.name.toLowerCase()}: ${uppercaseFirstLetter(tag.name)}ClientAPI;\n`;
    }

    output += '\n\nconstructor(...options: unknown[]) {\n';

    for (const tag of this.model.tags) {
      output += `this.${tag.name.toLowerCase()} = new ${uppercaseFirstLetter(tag.name)}ClientAPI(...options);\n`;
    }

    output += '}\n}\n';

    return output;
  }

  renderApis() {
    let output = '';

    for (const api of this.model.apis) {
      if (api.jsdoc) {
        output += this.renderJsdoc(api.jsdoc);
      }

      output += `export class ${uppercaseFirstLetter(api.name)}ClientAPI extends ClientAPIBase {\n`;

      for (const operation of api.operations) {
        output += this.renderOperation(operation);
      }

      for (const typeInfo of api.typesThatNeedPostProcessing) {
        output += this.renderPostProcess(typeInfo);
      }

      output += '}\n\n';
    }

    return output;
  }

  renderJsdoc(jsdoc) {
    let output = '/**\n';

    if (jsdoc.description) {
      output +=
        jsdoc.description
          .split('\n')
          .map((line) => `* ${line}`)
          .join('\n') + '\n';
    }

    if (jsdoc.params) {
      for (const param of jsdoc.params) {
        output += `* @param ${param.name} ${param.description ? param.description : ''}\n`;
      }
    }

    if (jsdoc.pattern) {
      output += `* @pattern ${jsdoc.pattern}\n`;
    }

    if (jsdoc.format) {
      output += `* @format ${jsdoc.format}\n`;
    }

    if (jsdoc.example !== undefined) {
      const example = JSON.stringify(jsdoc.example, null, 2);

      if (!example.includes('\n')) {
        output += `* @example ${example}\n`;
      } else {
        output += `* @example ${example.split('\n')[0]}\n${example
          .split('\n')
          .slice(1)
          .map((line) => `* ${line}`)
          .join('\n')}\n`;
      }
    }

    if (jsdoc.summary) {
      output += `* @summary ${jsdoc.summary}\n`;
    }

    output += '*/\n';

    return output;
  }

  throwIfParamTypeIsNotValid(param) {
    const paramType =
      param.paramType.type === 'array'
        ? param.paramType.itemType
        : param.paramType;

    if (
      !(
        paramType.resolvedType === 'number' ||
        paramType.resolvedType === 'string' ||
        paramType.isEnum
      )
    ) {
      throw new Error(
        `Query param type can only be 'number', 'string' or 'enum', got: '${paramType.resolvedType}'.`
      );
    }
  }

  renderJSON(obj) {
    return JSON.stringify(obj, null, 2);
  }

  renderPostProcess(typeInfo) {
    let output = '';

    const variableName = lowercaseFirstLetter(typeInfo.name);

    output += `#postProcess${typeInfo.name}(${variableName}: ${typeInfo.name}) {\n`;

    for (const property of typeInfo.metadata.propertiesThatAreDates) {
      output += `${variableName}.${property.name} = new Date(${variableName}.${property.name});\n`;
    }

    for (const property of typeInfo.metadata.propertiesThatContainDates) {
      output += this.renderPostProcessInvocation({
        typeInfo: property.typeInfo,
        verboseType: property.verboseType,
        variableName: `${variableName}.${property.name}`,
      });

      output += '\n\n';
    }

    output += '}\n\n';

    return output;
  }

  renderPostProcessInvocation({ typeInfo, verboseType, variableName }) {
    let output = '';

    if (verboseType.type === 'array') {
      const elementName = lowercaseFirstLetter(typeInfo.name);
      output += `for (const ${elementName} of ${variableName}) {\n`;
      output += `  this.#postProcess${typeInfo.name}(${elementName});\n`;
      output += '}';
    } else {
      output += `this.#postProcess${typeInfo.name}(${variableName});`;
    }

    return output;
  }

  renderOperation(operation) {
    let output = '';

    if (operation.jsdoc) {
      output += this.renderJsdoc(operation.jsdoc);
    }

    output += `${operation.hasDates ? 'async ' : ''}${lowercaseFirstLetter(operation.operationId)}(${this.renderParams(operation.allParams, operation.body)}): Promise<${operation.returnType.resolvedType}> {\n`;

    if (operation.allParams) {
      for (const param of operation.allParams) {
        if (param.paramType.type !== 'array') {
          output += `this.validateParam(\n${param.name},\n`;
        } else {
          output += `this.validateParamArray(\n${param.name},\n`;
        }

        const paramMeta = {
          name: param.name,
          required: param.required,
          paramType: param.type,
          type:
            param.paramType.type === 'literal'
              ? param.paramType.resolvedType
              : param.paramType.valueType.type,
        };

        if (Array.isArray(param.paramType.valueType.enum)) {
          paramMeta.enumValues = param.paramType.valueType.enum;
        }

        if (param.paramType.valueType.pattern) {
          paramMeta.pattern = param.paramType.valueType.pattern;
        }

        const paramFormat = param.paramType.valueType.format;

        if (paramFormat === 'int32' || paramFormat === 'int64') {
          paramMeta.numberFormat = 'integer';
        }

        output += this.renderJSON(paramMeta);

        output += ');\n\n';
      }
    }

    const queryParams = operation.allParams?.filter((p) => p.type === 'query');

    if (queryParams && queryParams.length > 0) {
      output += 'const urlParams = new URLSearchParams();\n\n';

      for (const queryParam of queryParams) {
        if (queryParam.paramType.type !== 'array') {
          output += `this.appendUrlParam(urlParams, ${queryParam.name},\n`;
        } else {
          output += `this.appendUrlParamArray(urlParams, ${queryParam.name},\n`;
        }

        const paramMeta = {
          name: queryParam.name,
          type:
            queryParam.paramType.type === 'literal'
              ? queryParam.paramType.resolvedType
              : queryParam.paramType.valueType.type,
        };

        output += this.renderJSON(paramMeta);

        output += ');\n\n';
      }

      output += '\nconst urlParamsString = urlParams.toString();\n\n';
      output +=
        "const queryString = urlParamsString.length > 0 ? `?${urlParamsString}` : '';\n\n";
    }

    if (operation.hasDates) {
      output += 'const json = await this.fetch';
    } else {
      output += 'return this.fetch';
    }

    if (operation.returnType.resolvedType !== 'void') {
      output += `<${operation.returnType.resolvedType}>`;
    }

    const templatedPath = operation.rawPath
      .split('/')
      .map((pathPart) => {
        const isPathParam = pathPart.startsWith('{') && pathPart.endsWith('}');

        if (!isPathParam) {
          return pathPart;
        }

        const pathParamName = pathPart.substring(1, pathPart.length - 1);

        const pathParam = operation.allParams?.find(
          (p) => p.name === pathParamName
        );

        if (!pathParam) {
          throw new Error(
            `Couldn't find path param: '${pathParamName}' in operation params for '${operation.rawPath}'.`
          );
        }

        return `\${encodeURIComponent(${pathParam.name})}`;
      })
      .join('/');

    output += `(\`${templatedPath}`;

    if (queryParams && queryParams.length > 0) {
      output += '${queryString}';
    }

    if (operation.httpMethod.toUpperCase() !== 'GET') {
      output += '`, {\n';

      output += `method: "${operation.httpMethod.toUpperCase()}",\n`;

      if (operation.body) {
        output += `body: JSON.stringify(${lowercaseFirstLetter(operation.body.resolvedType)}),\n`;
        output += `headers: {\n'Content-Type': 'application/json'\n},\n`;
      }

      output += '...options,\n';

      output += '});';
    } else {
      output += '`, options);';
    }

    if (operation.hasDates) {
      output += '\n\n';

      output += this.renderPostProcessInvocation({
        typeInfo: operation.typeInfo,
        verboseType: operation.returnType,
        variableName: 'json',
      });

      output += '\n\n';

      output += `return json;\n`;
    }

    output += '}\n\n';

    return output;
  }

  renderParams(params, body) {
    if (!params && !body) {
      return 'options?: Options';
    }

    let output = '';

    if (params) {
      for (let i = 0; i < params.length; i++) {
        const param = params[i];

        if (i !== 0) {
          output += ',';
        }

        output += param.name;

        if (!param.required) {
          output += '?';
        }

        output += `: ${param.paramType.resolvedType}`;
      }
    }

    if (body) {
      if (output.length > 0) {
        output += ', ';
      }

      output += `${lowercaseFirstLetter(body.resolvedType)}: ${body.resolvedType}`;
    }

    if (output.length > 0) {
      output += ', ';
    }

    output += 'options?: Options';

    return output;
  }
}

const model = new TypescriptModel(swaggerDocument);

const modelRenderer = new ModelRenderer(model);

await fs.mkdir('./src/generated/client');
await fs.writeFile('./src/generated/client/api.ts', modelRenderer.render(), {
  encoding: 'utf-8',
});
