import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const SWAGGER_CODEGEN_CLI_MAVEN_DOWNLOAD_URL =
  'https://repo1.maven.org/maven2/io/swagger/codegen/v3/swagger-codegen-cli/3.0.59/swagger-codegen-cli-3.0.59.jar';

const SWAGGER_CODEGEN_CLI_SHA1 = '1bf18ee1c26b00e3acd4bb50db282c03c42304ce';

const SWAGGER_CODEGEN_CLI_FILENAME = 'swagger-codegen-cli.jar';

const DESTINATION_FOLDER = './node_modules/.cache/swagger-codegen-cli';

const fileAlreadyExists = await fs
  .stat(path.join(DESTINATION_FOLDER, SWAGGER_CODEGEN_CLI_FILENAME))
  .then(() => true)
  .catch(() => false);

if (fileAlreadyExists) {
  console.log(
    `The file '${SWAGGER_CODEGEN_CLI_FILENAME}' is already downloaded at: '${DESTINATION_FOLDER}'.`
  );
} else {
  const response = await fetch(SWAGGER_CODEGEN_CLI_MAVEN_DOWNLOAD_URL);

  if (!response.ok) {
    throw new Error(
      `Couldn't download the file because the server returned a non-ok status code: '${response.status}'.`
    );
  }

  const blob = await response.blob();

  const buffer = Buffer.from(await blob.arrayBuffer());

  const sha1 = Buffer.from(
    await crypto.subtle.digest('SHA-1', buffer)
  ).toString('hex');

  if (sha1 !== SWAGGER_CODEGEN_CLI_SHA1) {
    throw new Error(
      `File downloaded from: '${SWAGGER_CODEGEN_CLI_MAVEN_DOWNLOAD_URL}' does not match SHA1: '${SWAGGER_CODEGEN_CLI_SHA1}'.`
    );
  }

  const filePath = path.join(DESTINATION_FOLDER, SWAGGER_CODEGEN_CLI_FILENAME);

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, buffer);

  console.log(
    `Successfully downloaded '${SWAGGER_CODEGEN_CLI_FILENAME}' to: '${DESTINATION_FOLDER}'.`
  );
}
