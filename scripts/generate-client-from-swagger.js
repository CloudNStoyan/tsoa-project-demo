import { exec } from 'node:child_process';
import fs from 'node:fs/promises';

const SWAGGER_CODEGEN_CLI_PATH =
  './node_modules/.cache/swagger-codegen-cli/swagger-codegen-cli.jar';
const SWAGGER_JSON_FILE_PATH = './src/generated/swagger.json';
const GENERATED_CLIENT_DESTINATION_PATH = './src/generated/client';

const codegenCliExists = await fs
  .stat(SWAGGER_CODEGEN_CLI_PATH)
  .then(() => true)
  .catch(() => false);

if (!codegenCliExists) {
  throw new Error(
    `Couldn't find '${SWAGGER_CODEGEN_CLI_PATH}' make sure you have ran the install script: 'npm run install-codegen-cli'.`
  );
}

await new Promise((resolve, reject) => {
  const { stdout, stderr } = exec(
    `java -jar ${SWAGGER_CODEGEN_CLI_PATH} generate -i ${SWAGGER_JSON_FILE_PATH} -l typescript-fetch -o ${GENERATED_CLIENT_DESTINATION_PATH}`,
    (error, stdout, _stderr) => {
      if (error) {
        reject(error);
      }

      resolve(stdout);
    }
  );

  stdout.pipe(process.stdout);
  stderr.pipe(process.stderr);
});
