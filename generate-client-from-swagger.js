import util from 'node:util';
import { exec as unpromisifiedExec } from 'node:child_process';

const exec = util.promisify(unpromisifiedExec);

const SWAGGER_CODEGEN_CLI_PATH =
  './node_modules/.cache/swagger-codegen-cli/swagger-codegen-cli-3.0.59.jar';
const SWAGGER_JSON_FILE_PATH = './src/generated/swagger.json';
const GENERATED_CLIENT_DESTINATION_PATH = './src/generated/client';

const { stdout, stderr } = await exec(
  `java -jar ${SWAGGER_CODEGEN_CLI_PATH} generate -i ${SWAGGER_JSON_FILE_PATH} -l typescript-fetch -o ${GENERATED_CLIENT_DESTINATION_PATH}`
);

if (stderr.length > 0) {
  throw new Error(stderr);
}

console.log(stdout);
