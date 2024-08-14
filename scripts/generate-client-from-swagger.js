import fs from 'node:fs/promises';

const SWAGGER_JSON_FILE_PATH = './src/generated/swagger.json';

const rawJson = await fs.readFile(SWAGGER_JSON_FILE_PATH, {
  encoding: 'utf-8',
});

const swaggerDocument = JSON.parse(rawJson);

await fs.mkdir('./src/generated/client');

// TODO: validated swagger doc

const model = {};

const openapiSchemas = swaggerDocument.components.schemas;

model.enums = generateEnums(openapiSchemas);
model.types = generateTypes(openapiSchemas);
model.interfaces = generateInterfaces(openapiSchemas);
model.operations = generateOperations(swaggerDocument.paths);
model.tags = generateOperationTags(swaggerDocument.paths, swaggerDocument.tags);

const enumsOutput = outputEnums(model.enums);
const typesOutput = outputTypes(model.types);
const interfacesOutput = outputInterfaces(model.interfaces);

const mainApisOutput = outputMainApi(model.tags);
const helpersOutput = outputHelpers();
const apisOutput = outputApis(model.tags, model.operations);

await fs.writeFile(
  './src/generated/client/api.ts',
  `
  import { ClientAPIBase } from '../../client-base.js';

  ${enumsOutput}\n\n${typesOutput}\n\n${interfacesOutput}\n\n${mainApisOutput}\n\n${helpersOutput}\n\n${apisOutput}`,
  { encoding: 'utf-8' }
);

await fs.writeFile(
  './src/generated/client/model.ts',
  `export const model = ${JSON.stringify(model, null, 2)}`,
  { encoding: 'utf-8' }
);

function outputHelpers() {
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

function outputParams(params, body) {
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

function outputOperation(operation) {
  let output = '';

  output += `${lowercaseFirstLetter(operation.operationId)}(${outputParams(operation.allParams, operation.body)}): Promise<${operation.returnType}> {\n`;

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

function outputMainApi(tags) {
  let output = '';

  output += 'export class ClientAPI {\n';

  for (const tag of tags) {
    output += `${tag.name.toLowerCase()}: ${tag.name}ClientAPI;\n`;
  }

  output += '\n\nconstructor(...options: unknown[]) {\n';

  for (const tag of tags) {
    output += `this.${tag.name.toLowerCase()} = new ${tag.name}ClientAPI(...options);\n`;
  }

  output += '}\n}\n';

  return output;
}

function outputApis(tags, operations) {
  let output = '';

  for (const tag of tags) {
    if (tag.jsdoc) {
      output += outputJsdoc(tag.jsdoc);
    }

    output += `export class ${tag.name}ClientAPI extends ClientAPIBase {\n`;
    output += 'constructor(...options: unknown[]) {\nsuper(...options)\n}\n\n';

    const tagOperations = operations.filter((op) => op.tags.includes(tag.name));

    for (const operation of tagOperations) {
      output += outputOperation(operation);
    }

    output += '}\n\n';
  }

  return output;
}

function outputJsdoc(jsdoc) {
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

function outputTypes(types) {
  let output = '';

  for (const tsType of types) {
    if (tsType.jsdoc) {
      output += outputJsdoc(tsType.jsdoc);
    }

    output += `export type ${tsType.name} = ${tsType.resolvedType};\n\n`;
  }

  return output;
}

function outputInterfaces(interfaces) {
  let output = '';

  for (const tsInterface of interfaces) {
    if (tsInterface.jsdoc) {
      output += outputJsdoc(tsInterface.jsdoc);
    }

    output += `export interface ${tsInterface.name} {\n`;

    for (const property of tsInterface.properties) {
      if (property.jsdoc) {
        output += outputJsdoc(property.jsdoc);
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

function outputEnums(enums) {
  let output = '';

  for (const tsEnum of enums) {
    output += `export enum ${tsEnum.name} {\n`;
    for (const enumValue of tsEnum.values) {
      output += `${enumValue} = "${enumValue}",\n`;
    }
    output += '}\n\n';
  }

  return output;
}

function capitalizeFirstLetter(str) {
  return str[0].toUpperCase() + str.slice(1);
}

function lowercaseFirstLetter(str) {
  return str[0].toLowerCase() + str.slice(1);
}

function responseSchemaIsLiteralOrRef(schema) {
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

function resolveProperty(property, propertyName) {
  if (property.$ref) {
    if (!property.$ref.startsWith('#/components/schemas/')) {
      throw new Error("Found a ref that doesn't point to #/components/schema");
    }

    return property.$ref.split('#/components/schemas/')[1];
  }

  if (property.enum) {
    return capitalizeFirstLetter(propertyName);
  }

  if (property.type === 'array') {
    return `Array<${resolveProperty(property.items, propertyName)}>`;
  }

  if (property.type === 'string' || property.type === 'number') {
    return property.type;
  }

  if (property.type === 'integer') {
    return 'number';
  }
}

function resolveJsdoc(property) {
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

function generateEnums(schemas) {
  const enums = {};

  for (const interfaceName in schemas) {
    const interfaceData = schemas[interfaceName];

    if (interfaceData.type !== 'object') {
      continue;
    }

    const openapiProperties = Object.entries(schemas[interfaceName].properties);

    for (const [propertyName, propertyData] of openapiProperties) {
      if (propertyData.enum) {
        if (propertyData.type !== 'string') {
          throw new Error('Enums that are not strings are not supported');
        }

        const enumName = capitalizeFirstLetter(propertyName);

        const enumData = {
          name: enumName,
          values: propertyData.enum,
          jsdoc: resolveJsdoc(propertyData),
        };

        if (enums[enumName]) {
          // FIXME: What should we do if there is already an enum with the same name?
        }

        enums[enumName] = enumData;
      }
    }
  }

  return Object.values(enums);
}

function generateProperties(openapiProperties, requiredProperties) {
  const properties = [];

  for (const [propertyName, propertyData] of openapiProperties) {
    const property = {
      name: propertyName,
      jsdoc: propertyData.enum ? undefined : resolveJsdoc(propertyData),
      resolvedType: resolveProperty(propertyData, propertyName),
      required: requiredProperties.includes(propertyName),
    };

    properties.push(property);
  }

  return properties;
}

function generateInterfaces(schemas) {
  const interfaces = [];
  for (const interfaceName in schemas) {
    const interfaceData = schemas[interfaceName];

    if (interfaceData.type !== 'object') {
      continue;
    }

    const tsInterface = {
      name: interfaceName,
      jsdoc: resolveJsdoc(interfaceData),
    };

    const openapiProperties = Object.entries(schemas[interfaceName].properties);

    const properties = generateProperties(
      openapiProperties,
      schemas[interfaceName].required
    );

    tsInterface.properties = properties;

    interfaces.push(tsInterface);
  }

  return interfaces;
}

function generateTypes(schemas) {
  const types = [];

  for (const typeName in schemas) {
    const typeData = schemas[typeName];

    if (typeData.type === 'object') {
      continue;
    }

    const tsType = {
      name: typeName,
      resolvedType: resolveProperty(typeData),
      jsdoc: resolveJsdoc(typeData),
    };

    types.push(tsType);
  }

  return types;
}

function generateOperationTags(paths, tagsData) {
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
      return { ...tag, jsdoc: resolveJsdoc(tagData) };
    }

    return tag;
  });

  return tags;
}

function generateOperations(paths) {
  const operations = [];

  for (const path in paths) {
    const pathOperations = paths[path];

    for (const httpMethod in pathOperations) {
      const openapiOperationData = pathOperations[httpMethod];

      const responseSchema =
        openapiOperationData.responses['200'].content['application/json']
          .schema;

      if (responseSchema && !responseSchemaIsLiteralOrRef(responseSchema)) {
        throw new Error(
          `Operation responses should have a reference to a schema instead of a inline object: \n${JSON.stringify(responseSchema, null, 2)}`
        );
      }

      const operation = {
        httpMethod,
        templatePath: path.replaceAll('{', '${'),
        operationId: openapiOperationData.operationId,
        tags: openapiOperationData.tags,
        jsdoc: resolveJsdoc(openapiOperationData),
        returnType: resolveProperty(responseSchema),
      };

      const allParams = [];

      if (Array.isArray(openapiOperationData.parameters)) {
        for (const operationParam of openapiOperationData.parameters) {
          const param = {
            name: operationParam.name,
            jsdoc: resolveJsdoc(operationParam),
            required: operationParam.required,
            type: operationParam.in,
            resolvedType: resolveProperty(operationParam.schema),
          };

          const schemaJsdoc = resolveJsdoc(operationParam.schema);

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
          jsdoc: resolveJsdoc(openapiOperationData.requestBody),
          resolvedType: resolveProperty(
            openapiOperationData.requestBody.content['application/json'].schema
          ),
        };
      }

      operations.push(operation);
    }
  }

  return operations;
}
