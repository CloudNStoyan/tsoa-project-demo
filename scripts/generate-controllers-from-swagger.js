import { openapi } from '@apidevtools/openapi-schemas';
import Ajv from 'ajv-draft-04';
import fs from 'node:fs/promises';
import path from 'node:path';

const SWAGGER_JSON_FILE_PATH = './src/generated/swagger.json';
const GENERATED_FOLDER = './src/generated/asp-net-server/generated';

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

function uppercaseFirstLetter(string) {
  return string[0].toUpperCase() + string.slice(1);
}

class DotNetModel {
  #swaggerDocument;

  constructor(swaggerDocument) {
    this.#swaggerDocument = swaggerDocument;

    this.models = this.GenerateModels();
  }

  GetDotnetType(schema) {
    if (Array.isArray(schema.allOf) && schema.allOf.length === 1) {
      return this.GetDotnetType(schema.allOf[0]);
    }

    if (schema.$ref) {
      if (!schema.$ref.startsWith('#/components/schemas/')) {
        throw new Error(
          "Found a ref that doesn't point to #/components/schema"
        );
      }

      const typeName = schema.$ref.split('#/components/schemas/')[1];

      return typeName;
    }

    switch (schema.type) {
      case 'array': {
        return `${this.GetDotnetType(schema.items)}[]`;
      }
      case 'string': {
        if (schema.format === 'uuid') {
          return 'Guid';
        } else if (schema.format === 'date') {
          return 'DateOnly';
        } else if (schema.format === 'date-time') {
          return 'DateTime';
        } else {
          return 'string';
        }
      }
      case 'boolean': {
        return 'bool';
      }
      case 'integer': {
        return 'int';
      }
      case 'number': {
        if (schema.format === 'float') {
          return 'float';
        } else if (schema.format === 'double') {
          return 'double';
        } else if (schema.format === 'int32') {
          return 'int';
        } else if (schema.format === 'int64') {
          return 'long';
        } else {
          throw new Error(`Unexpected number format '${schema.format}'.`);
        }
      }
      default: {
        console.log(schema);
        throw new Error(`Unexpected schema type '${schema.type}'.`);
      }
    }
  }

  GenerateXmlObject(schema) {
    return {
      summary: schema.description,
    };
  }

  GenerateProperty(schema, name, required) {
    return {
      name,
      type: schema.type,
      required,
      xmlObject: this.GenerateXmlObject(schema),
      dotnetType: this.GetDotnetType(schema),
    };
  }

  GenerateModel(schema, name) {
    const properties = [];

    for (const propertyName in schema.properties) {
      const propertySchema = schema.properties[propertyName];

      const isRequired = schema.required?.includes(propertyName) || false;

      properties.push(
        this.GenerateProperty(propertySchema, propertyName, isRequired)
      );
    }

    return {
      name,
      type: 'class',
      xmlObject: this.GenerateXmlObject(schema),
      properties,
    };
  }

  GenerateEnumModel(schema, name) {
    return {
      name,
      type: 'enum',
      enumMembers: schema.enum,
      xmlObject: this.GenerateXmlObject(schema),
    };
  }

  GenerateModels() {
    const generatedModels = [];

    const schemas = this.#swaggerDocument.components.schemas;

    for (const schemaName in schemas) {
      const schema = schemas[schemaName];

      if (schema.type === 'object') {
        generatedModels.push(this.GenerateModel(schema, schemaName));
      }

      if (schema.type === 'string' && Array.isArray(schema.enum)) {
        generatedModels.push(this.GenerateEnumModel(schema, schemaName));
      }
    }

    return generatedModels;
  }
}

class RenderModel {
  #model;
  #rootNamespace;

  constructor(model, rootNamespace) {
    this.#model = model;
    this.#rootNamespace = rootNamespace;
  }

  isEmpty(obj) {
    for (const prop in obj) {
      if (Object.hasOwn(obj, prop)) {
        return false;
      }
    }

    return true;
  }

  renderXml(xmlObject, indentation = 0) {
    if (this.isEmpty(xmlObject)) {
      return '';
    }

    let indentationString = new Array(indentation).fill(' ').join('');

    let output = '';

    if ('summary' in xmlObject) {
      output += `${indentationString}/// <summary>\n`;
      output += `${indentationString}/// ${xmlObject['summary']}\n`;
      output += `${indentationString}/// </summary>\n`;
    }

    return output;
  }

  renderEnum(enumModel) {
    let output = '';

    output += this.renderXml(enumModel.xmlObject);
    output += `public enum ${enumModel.name} {\n`;

    for (const enumMember of enumModel.enumMembers) {
      output += `  ${enumMember},\n`;
    }

    output += '}';

    return output;
  }

  renderProperty(property) {
    let output = '';

    output += this.renderXml(property.xmlObject, 2);
    output += `  public ${property.dotnetType} ${uppercaseFirstLetter(property.name)} { get; set; }\n`;

    return output;
  }

  renderClass(classModel) {
    let output = '';

    output += this.renderXml(classModel.xmlObject);
    //output += `[PropertiesExample(typeof(${classModel.name}Example))]\n`;
    output += `public class ${classModel.name} {\n`;

    for (const property of classModel.properties) {
      output += `${this.renderProperty(property)}\n`;
    }

    output += '}';

    return output;
  }

  render() {
    const model = this.#model;
    const rootNamespace = this.#rootNamespace;

    let output = '';

    output += `using AspNetServer.SwashbuckleFilters;\n\n`;

    output += `namespace ${rootNamespace}.Generated.Models;\n\n`;

    if (model.type === 'enum') {
      output += this.renderEnum(model);
    }

    if (model.type === 'class') {
      output += this.renderClass(model);
    }

    return output;
  }
}

const dotNetModel = new DotNetModel(swaggerDocument);

await fs.mkdir(path.join(GENERATED_FOLDER, 'models'), { recursive: true });
for (const model of dotNetModel.models) {
  await fs.writeFile(
    path.join(GENERATED_FOLDER, 'models', `${model.name}.cs`),
    new RenderModel(model, 'AspNetServer').render(),
    {
      encoding: 'utf-8',
    }
  );
}
