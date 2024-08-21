import fs from 'node:fs/promises';

const SWAGGER_JSON_FILE_PATH = './src/generated/swagger.json';

const swaggerJson = await fs.readFile(SWAGGER_JSON_FILE_PATH, {
  encoding: 'utf-8',
});

const swaggerDocument = JSON.parse(swaggerJson);

if (!swaggerDocument.openapi.startsWith('3')) {
  throw new Error(
    `Unsupported OpenAPI version that is not '3.X.X' was found: '${swaggerDocument.openapi}'.`
  );
}

function lowercaseFirstLetter(string) {
  return string[0].toLowerCase() + string.slice(1);
}

class TypescriptModel {
  constructor(swaggerDocument) {
    const { enums, types, interfaces } = this.generateTypings(swaggerDocument);

    this.enums = enums;
    this.types = types;
    this.interfaces = interfaces;

    this.operations = this.generateOperations(swaggerDocument);
    this.tags = this.generateOperationTags(swaggerDocument);
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

  generateReturnType(responses) {
    if (responses['204'] && !responses['200']) {
      return 'void';
    }

    if (responses['200']) {
      const content = responses['200'].content['application/json'];

      this.throwIfResponseContentIsInvalid(content);

      if (responses['204']) {
        return `${this.resolveType(content.schema)} | void`;
      }

      return this.resolveType(content.schema);
    }

    throw new Error(
      `Unexpected response object:\n${JSON.stringify(responses, null, 2)}`
    );
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
          templatePath: path.replaceAll('{', '${'),
          operationId: openapiOperationData.operationId,
          tags: openapiOperationData.tags,
          jsdoc: this.resolveJsdoc(openapiOperationData),
          returnType: this.generateReturnType(openapiOperationData.responses),
        };

        const allParams = [];

        if (Array.isArray(openapiOperationData.parameters)) {
          for (const operationParam of openapiOperationData.parameters) {
            const param = {
              name: operationParam.name,
              jsdoc: this.resolveJsdoc(operationParam),
              required: operationParam.required,
              type: operationParam.in,
              resolvedType: this.resolveType(operationParam.schema),
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
    if (this.isPropertyAnUnion(property)) {
      return this.resolveUnion(property);
    }

    if (property.$ref) {
      if (!property.$ref.startsWith('#/components/schemas/')) {
        throw new Error(
          "Found a ref that doesn't point to #/components/schema"
        );
      }

      return property.$ref.split('#/components/schemas/')[1];
    }

    if (property.type === 'array') {
      return `(${this.resolveType(property.items)})[]`;
    }

    if (
      property.type === 'string' ||
      property.type === 'number' ||
      property.type === 'boolean'
    ) {
      return property.type;
    }

    if (property.type === 'integer') {
      return 'number';
    }

    throw new Error(`Invalid property type: '${property.type}'.`);
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

  generateTypings(swaggerDocument) {
    const schemas = swaggerDocument.components.schemas;

    const interfaces = [];
    const types = [];
    const enums = [];

    for (const componentName in schemas) {
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

    for (const [propertyName, propertyData] of openapiProperties) {
      const tsProperty = {
        name: propertyName,
        required: requiredProperties.includes(propertyName),
        jsdoc: this.resolveJsdoc(propertyData),
        resolvedType: this.resolveType(propertyData),
      };

      tsProperties.push(tsProperty);
    }

    tsInterface.properties = tsProperties;

    return tsInterface;
  }

  generateType(typeName, typeData) {
    const tsType = {
      name: typeName,
      resolvedType: this.resolveType(typeData),
      jsdoc: this.resolveJsdoc(typeData),
    };

    return tsType;
  }
}

class ModelRenderer {
  constructor(model) {
    this.model = model;
  }

  render() {
    return `
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

    output += "import { ClientAPIBase } from '../../client-base.js';";

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
      output += `${tag.name.toLowerCase()}: ${tag.name}ClientAPI;\n`;
    }

    output += '\n\nconstructor(...options: unknown[]) {\n';

    for (const tag of this.model.tags) {
      output += `this.${tag.name.toLowerCase()} = new ${tag.name}ClientAPI(...options);\n`;
    }

    output += '}\n}\n';

    return output;
  }

  renderApis() {
    let output = '';

    for (const tag of this.model.tags) {
      if (tag.jsdoc) {
        output += this.renderJsdoc(tag.jsdoc);
      }

      output += `export class ${tag.name}ClientAPI extends ClientAPIBase {\n`;

      const tagOperations = this.model.operations.filter((op) =>
        op.tags.includes(tag.name)
      );

      for (const operation of tagOperations) {
        output += this.renderOperation(operation);
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
      output += `* @example ${JSON.stringify(jsdoc.example, null, 2)}\n`;
    }

    if (jsdoc.summary) {
      output += `* @summary ${jsdoc.summary}\n`;
    }

    output += '*/\n';

    return output;
  }

  renderOperation(operation) {
    let output = '';

    if (operation.jsdoc) {
      output += this.renderJsdoc(operation.jsdoc);
    }

    output += `${lowercaseFirstLetter(operation.operationId)}(${this.renderParams(operation.allParams, operation.body)}): Promise<${operation.returnType}> {\n`;

    if (operation.allParams) {
      for (const param of operation.allParams) {
        if (param.resolvedType === 'number') {
          output += `if (Number.isNaN(${param.name})) {\n`;
          output += `throw new Error("Invalid value NaN for '${param.type}' param: '${param.name}'.")\n`;
          output += '}\n\n';
        }
      }
    }

    const queryParams = operation.allParams?.filter((p) => p.type === 'query');

    if (queryParams && queryParams.length > 0) {
      output += 'const urlParams = new URLSearchParams();\n\n';

      for (const queryParam of queryParams) {
        if (queryParam.resolvedType === 'number') {
          output += `if (${queryParam.name} !== undefined) {\n`;
          output += `urlParams.set("${queryParam.name}", String(${queryParam.name}));\n`;
          output += '}\n\n';
        } else if (queryParam.resolvedType === 'string') {
          output += `if (${queryParam.name}) {\n`;
          output += `urlParams.set("${queryParam.name}", ${queryParam.name});\n`;
          output += '}\n\n';
        } else {
          throw new Error(
            `Query param type can only be 'number' or 'string', got: '${queryParam.resolvedType}'.`
          );
        }
      }

      output += '\nconst urlParamsString = urlParams.toString();\n\n';
      output +=
        "const queryString = urlParamsString.length > 0 ? `?${urlParamsString}` : '';\n\n";
    }

    output += 'return super.fetch';

    if (operation.returnType !== 'void') {
      output += `<${operation.returnType}>`;
    }

    output += `(\`${operation.templatePath}`;

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

      output += '});';
    } else {
      output += '`);';
    }

    output += '}\n\n';

    return output;
  }

  renderParams(params, body) {
    if (!params) {
      return '';
    }

    let output = '';

    for (let i = 0; i < params.length; i++) {
      const param = params[i];

      if (i !== 0) {
        output += ',';
      }

      output += param.name;

      if (!param.required) {
        output += '?';
      }

      output += `: ${param.resolvedType}`;
    }

    if (body) {
      if (output.length > 0) {
        output += ', ';
      }

      output += `${lowercaseFirstLetter(body.resolvedType)}: ${body.resolvedType}`;
    }

    return output;
  }
}

const model = new TypescriptModel(swaggerDocument);

const modelRenderer = new ModelRenderer(model);

await fs.mkdir('./src/generated/client');
await fs.writeFile('./src/generated/client/api.ts', modelRenderer.render(), {
  encoding: 'utf-8',
});
