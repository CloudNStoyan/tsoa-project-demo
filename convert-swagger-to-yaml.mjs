import fs from "node:fs";
import YAML from "yaml";
import swaggerDoc from "./src/generated/swagger.json" with {type: "json"};

fs.writeFileSync("./src/generated/swagger.yaml", YAML.stringify(swaggerDoc));
