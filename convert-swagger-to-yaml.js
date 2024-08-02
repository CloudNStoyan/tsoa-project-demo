import fs from 'node:fs/promises';
import YAML from 'yaml';
import swaggerDoc from './src/generated/swagger.json' with { type: 'json' };

await fs.writeFile('./src/generated/swagger.yaml', YAML.stringify(swaggerDoc));
