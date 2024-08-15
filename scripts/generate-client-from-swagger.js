import fs from 'node:fs/promises';

const SWAGGER_JSON_FILE_PATH = './src/generated/swagger.json';

const swaggerJson = await fs.readFile(SWAGGER_JSON_FILE_PATH, {
  encoding: 'utf-8',
});

const swaggerDocument = JSON.parse(swaggerJson);

// TODO: validated swagger doc

function capitalizeFirstLetter(string) {
  return string[0].toUpperCase() + string.slice(1);
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

  responseSchemaIsLiteralOrRef(schema) {
    if (schema.type === 'array') {
      if (schema.items.$ref) {
        return true;
      }
    }

    if (schema.$ref) {
      return true;
    }

    if (schema.type === 'object') {
      return false;
    }

    return true;
  }

  generateOperationTags(swaggerDocument) {
    const paths = swaggerDocument.paths;
    const tagsData = swaggerDocument.tags;

    const tagsMap = {};

    for (const path in paths) {
      const pathOperations = paths[path];

      for (const httpMethod in pathOperations) {
        const openapiOperationData = pathOperations[httpMethod];

        for (const operationTag of openapiOperationData.tags) {
          if (!tagsMap[operationTag]) {
            tagsMap[operationTag] = { name: operationTag };
          }
        }
      }
    }

    const tags = Object.values(tagsMap).map((tag) => {
      const tagData = tagsData.find((t) => t.name === tag.name);
      if (tagData) {
        return { ...tag, jsdoc: this.resolveJsdoc(tagData) };
      }

      return tag;
    });

    return tags;
  }

  generateOperations(swaggerDocument) {
    const paths = swaggerDocument.paths;

    const operations = [];

    for (const path in paths) {
      const pathOperations = paths[path];

      for (const httpMethod in pathOperations) {
        const openapiOperationData = pathOperations[httpMethod];

        const responseSchema =
          openapiOperationData.responses['200'].content['application/json']
            .schema;

        if (
          responseSchema &&
          !this.responseSchemaIsLiteralOrRef(responseSchema)
        ) {
          throw new Error(
            `Operation responses should have a reference to a schema instead of a inline object: \n${JSON.stringify(responseSchema, null, 2)}`
          );
        }

        const operation = {
          httpMethod,
          templatePath: path.replaceAll('{', '${'),
          operationId: openapiOperationData.operationId,
          tags: openapiOperationData.tags,
          jsdoc: this.resolveJsdoc(openapiOperationData),
          returnType: this.resolveType(responseSchema),
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

        operation.allParams = allParams.length > 0 ? allParams : undefined;

        if (openapiOperationData.requestBody) {
          operation.body = {
            required: openapiOperationData.requestBody.required,
            jsdoc: this.resolveJsdoc(openapiOperationData.requestBody),
            resolvedType: this.resolveType(
              openapiOperationData.requestBody.content['application/json']
                .schema
            ),
          };
        }

        operations.push(operation);
      }
    }

    return operations;
  }

  resolveEnum(propertyName) {
    return capitalizeFirstLetter(propertyName);
  }

  resolveType(property) {
    if (property.$ref) {
      if (!property.$ref.startsWith('#/components/schemas/')) {
        throw new Error(
          "Found a ref that doesn't point to #/components/schema"
        );
      }

      return property.$ref.split('#/components/schemas/')[1];
    }

    if (property.type === 'array') {
      return `Array<${this.resolveType(property.items)}>`;
    }

    if (property.type === 'string' || property.type === 'number') {
      return property.type;
    }

    if (property.type === 'integer') {
      return 'number';
    }
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
      if (property[jsdocProp]) {
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
    const enums = {};

    for (const componentName in schemas) {
      const componentData = schemas[componentName];

      if (componentData.type === 'object') {
        this.appendEnums(componentData, enums);

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

    return { interfaces, types, enums: Object.values(enums) };
  }

  appendEnums(interfaceData, enums) {
    const openapiProperties = Object.entries(interfaceData.properties);

    for (const [propertyName, propertyData] of openapiProperties) {
      if (!propertyData.enum) {
        continue;
      }

      if (propertyData.type !== 'string') {
        throw new Error('Enums that are not strings are not supported');
      }

      const enumName = capitalizeFirstLetter(propertyName);

      const enumData = {
        name: enumName,
        values: propertyData.enum,
        jsdoc: this.resolveJsdoc(propertyData),
      };

      if (enums[enumName]) {
        // FIXME: What should we do if there is already an enum with the same name?
      }

      enums[enumName] = enumData;
    }
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
      };

      if (!propertyData.enum) {
        tsProperty.jsdoc = this.resolveJsdoc(propertyData);
        tsProperty.resolvedType = this.resolveType(propertyData);
      } else {
        tsProperty.resolvedType = this.resolveEnum(propertyName);
      }

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

    ${this.renderHelpers()}

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

        output += `: ${property.resolvedType}\n`;
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

  renderHelpers() {
    let output = '';

    output += `
function generateQueryString(queries: Array<[string, unknown]>): string {
  const queryString = queries.filter(([_name, query]) => query !== undefined)
    .map(([name, query]) => \`\${name}=\${query}\`)
    .join('&');

  if (queryString.length > 0) {
    return \`?\${queryString}\`;
  }

  return '';
}
  `;

    return output;
  }

  renderApis() {
    let output = '';

    for (const tag of this.model.tags) {
      if (tag.jsdoc) {
        output += this.renderJsdoc(tag.jsdoc);
      }

      output += `export class ${tag.name}ClientAPI extends ClientAPIBase {\n`;
      output +=
        'constructor(...options: unknown[]) {\nsuper(...options)\n}\n\n';

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

    if (jsdoc.pattern) {
      output += `* @pattern ${jsdoc.pattern}\n`;
    }

    if (jsdoc.format) {
      output += `* @format ${jsdoc.format}\n`;
    }

    if (jsdoc.example) {
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

    output += `${lowercaseFirstLetter(operation.operationId)}(${this.renderParams(operation.allParams, operation.body)}): Promise<${operation.returnType}> {\n`;

    const queryParams = operation.allParams?.filter((p) => p.type === 'query');

    if (queryParams && queryParams.length > 0) {
      output += 'const queries: Array<[string, unknown]> = [';
      for (let i = 0; i < queryParams.length; i++) {
        const queryParam = queryParams[i];

        if (i !== 0) {
          output += ',';
        }

        output += `['${queryParam.name}', ${queryParam.name}]`;
      }

      output += '];\nconst queryString = generateQueryString(queries);\n\n';
    }

    output += `return super.fetch<${operation.returnType}>(\`${operation.templatePath}`;

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
      output += '`)';
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
