import fs from 'node:fs/promises';
import path from 'node:path';

const SWAGGER_CODEGEN_CLI_MAVEN_DOWNLOAD_URL =
  'https://repo1.maven.org/maven2/io/swagger/codegen/v3/swagger-codegen-cli/3.0.59/swagger-codegen-cli-3.0.59.jar';

const SWAGGER_CODEGEN_CLI_FILENAME = 'swagger-codegen-cli-3.0.59.jar';

const DESTINATION_FOLDER = './node_modules/.cache/swagger-codegen-cli';

async function downloadFile(url, fileName, destinationPath) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Couldn't download the file because the server returned a non-ok status code: '${response.status}'.`
    );
  }

  const blob = await response.blob();

  const buffer = Buffer.from(await blob.arrayBuffer());

  const filePath = path.join(destinationPath, fileName);

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, buffer);
}

await downloadFile(
  SWAGGER_CODEGEN_CLI_MAVEN_DOWNLOAD_URL,
  SWAGGER_CODEGEN_CLI_FILENAME,
  DESTINATION_FOLDER
);

console.log(
  `Successfully downloaded '${SWAGGER_CODEGEN_CLI_FILENAME}' to: '${DESTINATION_FOLDER}'.`
);
