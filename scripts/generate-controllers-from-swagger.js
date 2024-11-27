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

  SchemaIsEnum(schema) {
    return schema.type === 'string' && Array.isArray(schema.enum);
  }

  ResolveDotnetType(schema) {
    if (Array.isArray(schema.allOf) && schema.allOf.length === 1) {
      return this.ResolveDotnetType(schema.allOf[0]);
    }

    if (schema.$ref) {
      if (!schema.$ref.startsWith('#/components/schemas/')) {
        throw new Error(
          "Found a ref that doesn't point to #/components/schema"
        );
      }

      const typeName = schema.$ref.split('#/components/schemas/')[1];

      const schemaType = this.#swaggerDocument.components.schemas[typeName];

      const isEnum = this.SchemaIsEnum(schemaType);

      if (schemaType.type != 'object' && !isEnum) {
        return this.ResolveDotnetType(schemaType);
      }

      return { resolved: typeName, type: isEnum ? 'enum' : 'object' };
    }

    switch (schema.type) {
      case 'array': {
        const itemType = this.ResolveDotnetType(schema.items);

        return {
          resolved: `${itemType.resolved}[]`,
          itemType,
          type: 'array',
        };
      }
      case 'string': {
        if (schema.format === 'uuid') {
          return { resolved: 'Guid', type: 'object', builtin: true };
        } else if (schema.format === 'date') {
          return { resolved: 'DateOnly', type: 'object', builtin: true };
        } else if (schema.format === 'date-time') {
          return { resolved: 'DateTime', type: 'object', builtin: true };
        } else {
          return { resolved: 'string', type: 'literal' };
        }
      }
      case 'boolean': {
        return { resolved: 'bool', type: 'literal' };
      }
      case 'integer': {
        return { resolved: 'int', type: 'literal' };
      }
      case 'number': {
        if (schema.format === 'float') {
          return { resolved: 'float', type: 'literal' };
        } else if (schema.format === 'double') {
          return { resolved: 'double', type: 'literal' };
        } else if (schema.format === 'int32') {
          return { resolved: 'int', type: 'literal' };
        } else if (schema.format === 'int64') {
          return { resolved: 'long', type: 'literal' };
        } else {
          throw new Error(`Unexpected number format '${schema.format}'.`);
        }
      }
      default: {
        throw new Error(`Unexpected schema type '${schema.type}'.`);
      }
    }
  }

  GenerateXmlObject(schema) {
    const output = {
      summary: schema.description,
    };

    for (const key in output) {
      if (output[key] !== undefined) {
        return output;
      }
    }

    return '';
  }

  GenerateAttributes(schema, required) {
    const attributes = [];

    if (schema.minLength !== undefined || schema.minItems !== undefined) {
      attributes.push(`[MinLength(${schema.minLength || schema.minItems})]`);
    }

    if (schema.maxLength !== undefined || schema.maxItems !== undefined) {
      attributes.push(`[MaxLength(${schema.maxLength || schema.maxItems})]`);
    }

    if (schema.maximum !== undefined || schema.minimum !== undefined) {
      const numberType = this.ResolveDotnetType(schema);

      const maximum = schema.maximum || `${numberType}.MaxValue`;
      const minimum = schema.minimum || '0';

      attributes.push(`[Range(${minimum}, ${maximum})]`);
    }

    if (required === true) {
      attributes.push('[Required]');
    }

    return attributes;
  }

  GenerateProperty(schema, name, required) {
    return {
      name,
      type: schema.type,
      required,
      xmlObject: this.GenerateXmlObject(schema),
      dotnetType: this.ResolveDotnetType(schema),
      nullable: schema.nullable || false,
      attributes: this.GenerateAttributes(schema, required),
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

  getIndentationString(indentation) {
    return new Array(indentation).fill(' ').join('');
  }

  renderXml(xmlObject, indentation = 0) {
    if (this.isEmpty(xmlObject)) {
      return '';
    }

    let indentationString = this.getIndentationString(indentation);

    let output = '';

    if ('summary' in xmlObject) {
      output += `${indentationString}/// <summary>\n`;
      output += `${indentationString}/// ${xmlObject['summary']}\n`;
      output += `${indentationString}/// </summary>\n`;
    }

    return output;
  }

  renderAttributes(attributes, indentation = 0) {
    if (attributes.length === 0) {
      return '';
    }

    let output = '';

    let indentationString = this.getIndentationString(indentation);

    for (const attribute of attributes) {
      output += `${indentationString}${attribute}\n`;
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

    const indentationString = this.getIndentationString(2);

    output += this.renderAttributes(property.attributes, 2);

    const nullableString = property.nullable ? '?' : '';
    const requiredModifierString =
      (property.dotnetType.resolved === 'string' ||
        property.dotnetType.itemType?.resolved === 'string') &&
      property.required
        ? 'required '
        : '';

    output += `${indentationString}public ${requiredModifierString}${property.dotnetType.resolved}${nullableString} ${uppercaseFirstLetter(property.name)} { get; set; }\n`;

    return output.trimEnd();
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

    output += 'using System.ComponentModel.DataAnnotations;\n';
    output += 'using AspNetServer.SwashbuckleFilters;\n\n';

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
