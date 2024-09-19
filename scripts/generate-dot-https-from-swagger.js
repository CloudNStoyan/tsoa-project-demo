import fs from 'node:fs/promises';

const SWAGGER_JSON_FILE_PATH = './src/generated/swagger.json';

const BASE_URL = 'http://localhost:3000';

const swaggerJson = await fs.readFile(SWAGGER_JSON_FILE_PATH, {
  encoding: 'utf-8',
});

const swaggerDocument = JSON.parse(swaggerJson);

if (!swaggerDocument.openapi.startsWith('3')) {
  throw new Error(
    `Unsupported OpenAPI version that is not '3.X.X' was found: '${swaggerDocument.openapi}'.`
  );
}

function uppercaseFirstLetter(string) {
  return string[0].toUpperCase() + string.slice(1);
}

class OperationsModel {
  #swaggerDocument;

  constructor(swaggerDoc) {
    this.#swaggerDocument = swaggerDoc;

    this.parse(swaggerDoc);
  }

  resolveSchemaRef(schema) {
    const schemaRef = schema['$ref'];

    if (schemaRef) {
      delete schema['$ref'];

      if (!schemaRef.startsWith('#/components/schemas/')) {
        throw new Error(
          `Found a ref that doesn't point to #/components/schemas '${schemaRef}'.`
        );
      }

      const schemaName = schemaRef.split('#/components/schemas/')[1];

      const originalSchema = schema;
      const refSchema = this.#swaggerDocument.components.schemas[schemaName];

      return { ...refSchema, ...originalSchema };
    }

    if (Array.isArray(schema.allOf)) {
      if (schema.allOf.length !== 1) {
        throw new Error(
          `Found an 'allOf' that doesn't have only one element in it:\n${JSON.stringify(schema.allOf, null, 2)}`
        );
      }

      const refSchema = this.resolveSchemaRef(schema.allOf[0]);

      delete schema['allOf'];

      return { ...refSchema, ...schema };
    }

    if (schema.type === 'array') {
      schema.items = this.resolveSchemaRef(schema.items);

      return schema;
    }

    return schema;
  }

  parse(swaggerDoc) {
    const paths = swaggerDoc.paths;
    const securitySchemes = swaggerDoc.components.securitySchemes;

    const operations = [];

    for (const path in paths) {
      const pathData = paths[path];

      for (const method in pathData) {
        const operationData = pathData[method];

        const operation = {
          id: operationData.operationId,
          method,
          path,
          params: operationData.parameters,
          description: operationData.description,
          summary: operationData.summary,
        };

        if (operationData.security.length > 0) {
          const securityDefinitionName = Object.keys(
            operationData.security[0]
          )[0];

          operation.security = securitySchemes[securityDefinitionName];

          if (
            operation.security.in !== 'query' &&
            operation.security.in !== 'header'
          ) {
            throw new Error(
              `Unsupported security definition 'in' property, only 'query' and 'header' are allowed instead got '${operation.security.in}'.`
            );
          }

          if (operation.security.type !== 'apiKey') {
            throw new Error(
              `Unsupported security definition 'type' property, only 'apiKey' is allowed instead got '${operation.security.type}'.`
            );
          }
        }

        if (operationData.requestBody) {
          const requestBody = operationData.requestBody;
          if (!requestBody.content['application/json']) {
            throw new Error(
              `Found an request body without 'application/json' content:\n\n${JSON.stringify(operation.requestBody.content, null, 2)}`
            );
          }

          const content = requestBody.content['application/json'];

          content.schema = this.resolveSchemaRef(content.schema);

          if (content.schema.type === 'object') {
            const properties = content.schema.properties;
            for (const property in properties) {
              const propertySchema = this.resolveSchemaRef(
                properties[property]
              );

              properties[property] = propertySchema;
            }
          }

          operation.body = content.schema;
        }

        for (const param of operation.params) {
          param.schema = this.resolveSchemaRef(param.schema);
        }

        operations.push(operation);
      }
    }

    this.operations = operations;
  }
}

class HttpFileRenderer {
  constructor(operation) {
    this.operation = operation;
  }

  getDefaultValue(schema) {
    switch (schema.type) {
      case 'string': {
        if (Array.isArray(schema.enum)) {
          return schema.enum[0];
        }

        if (schema.format === 'date') {
          return '2024-01-01';
        }

        if (schema.format === 'date-time') {
          return '2024-01-01T00:00';
        }

        if (schema.format === 'uuid') {
          return 'b517dd49-4b9c-49bd-87b1-6e692cf85e6c';
        }

        return 'str';
      }
      case 'number': {
        return 0;
      }
      case 'integer': {
        return 0;
      }
      case 'boolean': {
        return false;
      }
      case 'array': {
        return [this.getDefaultValue(schema.items)];
      }
      default: {
        throw new Error(`Invalid default value type: '${schema.type}'`);
      }
    }
  }

  renderMainDescriptionBlock(operation) {
    let output = '';

    output += '#################################################\n';
    output += `### Request: ${operation.method.toUpperCase()} ${operation.path}\n`;

    if (operation.summary) {
      output += `### Summary: ${operation.summary}\n`;
    }

    if (operation.description) {
      output += `### Description: ${operation.summary}\n`;
    }

    output += '#################################################';

    return output;
  }

  renderDescriptionBlock(description) {
    let output = '';

    const lines = description.split('\n');

    output += '#################################################\n';

    for (const line of lines) {
      if (line.trim().length === 0) {
        continue;
      }

      output += `### ${line}\n`;
    }

    output += '#################################################\n';

    return output.trim();
  }

  renderParams(params) {
    let output = '';

    for (const param of params) {
      if (param.description) {
        output += `### ${param.in === 'path' ? 'Path' : 'Query'} Parameter: ${param.description}\n`;
      }

      let paramValue = this.getDefaultValue(param.schema);

      if (param.schema.example) {
        paramValue = param.schema.example;
      }

      if (param.schema.default) {
        paramValue = param.schema.default;
      }

      if (param.schema.type === 'array') {
        paramValue = this.getDefaultValue(param.schema.items);
      }

      output += `@${param.name} = ${!Array.isArray(paramValue) ? paramValue : JSON.stringify(paramValue)}\n\n`;
    }

    return output.trim();
  }

  renderPath(operation) {
    let output = '';

    const method = operation.method.toUpperCase();

    const path = operation.path.replaceAll('{', '{{').replaceAll('}', '}}');

    output += `${method} ${BASE_URL}${path}`;

    const queryParams = operation.params.filter(
      (param) => param.in === 'query'
    );

    if (queryParams.length > 0) {
      output += '?';

      const queryParamsEntries = [];

      for (const queryParam of queryParams) {
        queryParamsEntries.push(`${queryParam.name}={{${queryParam.name}}}`);
      }

      output += queryParamsEntries.join('&');

      console.log(operation.security);

      if (operation.security?.in === 'query') {
        output += `&${operation.security.name}={{apiToken}}`;
      }
    } else if (operation.security?.in === 'query') {
      output += `?${operation.security.name}={{apiToken}}`;
    }

    return output;
  }

  renderBody(operation) {
    if (!operation.body) {
      return '';
    }

    const bodyJson = {};

    for (const propertyName in operation.body.properties) {
      const propertySchema = operation.body.properties[propertyName];

      bodyJson[propertyName] = this.getDefaultValue(propertySchema);

      if (propertySchema.example) {
        bodyJson[propertyName] = propertySchema.example;
      }
    }

    return JSON.stringify(bodyJson, null, 2);
  }

  renderHeaders(operation) {
    let output = '';

    output += 'Content-Type: {{contentType}}\n';

    if (operation.security?.in === 'header') {
      output += `${operation.security.name}: {{apiToken}}`;
    }

    return output.trim();
  }

  render() {
    let output = '';

    output += '@contentType = application/json\n';

    if (this.operation.security) {
      if (this.operation.security.description) {
        output += `\n${this.renderDescriptionBlock(this.operation.security.description)}\n`;
      }

      output += '@apiToken = str\n';
    }

    output += '\n';
    output +=
      `${this.renderMainDescriptionBlock(this.operation)}\n\n${this.renderParams(this.operation.params)}\n\n${this.renderPath(this.operation)}\n${this.renderHeaders(this.operation)}\n\n${this.renderBody(this.operation)}`.trim();

    return output;
  }
}

const model = new OperationsModel(swaggerDocument);

await fs.mkdir('./src/generated/custom-dot-http');

for (const operation of model.operations) {
  const httpFileContent = new HttpFileRenderer(operation).render();

  const operationMethodFormatted = uppercaseFirstLetter(
    operation.method.toLowerCase()
  );

  const filename = operation.id.startsWith(operationMethodFormatted)
    ? operation.id
    : `${operationMethodFormatted}${operation.id}`;

  await fs.writeFile(
    `./src/generated/custom-dot-http/${filename}.http`,
    httpFileContent,
    {
      encoding: 'utf-8',
    }
  );
}
