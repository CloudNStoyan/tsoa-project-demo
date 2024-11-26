import fs from 'node:fs/promises';

const SWAGGER_JSON_FILE_PATH = './src/generated/swagger.json';

const swaggerJson = await fs.readFile(SWAGGER_JSON_FILE_PATH, {
  encoding: 'utf-8',
});

const swaggerDocument = JSON.parse(swaggerJson);

const schemas = swaggerDocument.components.schemas;

for (const schemaName in schemas) {
  const schema = schemas[schemaName];

  for (const propertyName in schema.properties) {
    const property = schema.properties[propertyName];

    if (property['$ref'] && property['description']) {
      const cachedRef = property['$ref'];

      delete property['$ref'];

      property.allOf = [{ $ref: cachedRef }];
    }
  }
}

for (const path in swaggerDocument.paths) {
  const httpMethods = swaggerDocument.paths[path];

  for (const httpMethod in httpMethods) {
    const operation = httpMethods[httpMethod];

    const parameters = operation.parameters;

    for (const parameter of parameters) {
      if ('required' in parameter && parameter.required === false) {
        delete parameter.required;
      }
    }
  }
}

fs.writeFile(SWAGGER_JSON_FILE_PATH, JSON.stringify(swaggerDocument, null, 2), {
  encoding: 'utf-8',
});
