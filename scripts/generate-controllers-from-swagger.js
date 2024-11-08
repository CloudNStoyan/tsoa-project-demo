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

class AspNetModel {
  // eslint-disable-next-line no-unused-private-class-members
  #swaggerDocument;

  constructor(swaggerDocument) {
    this.#swaggerDocument = swaggerDocument;
  }
}

class ModelRenderer {}

const model = new AspNetModel(swaggerDocument);

const modelRenderer = new ModelRenderer(model);

await fs.mkdir('./src/generated/asp-net-server/generated-controllers');
// await fs.writeFile('./src/generated/asp-net-server/generated-controllers/api.ts', modelRenderer.render(), {
//   encoding: 'utf-8',
// });
