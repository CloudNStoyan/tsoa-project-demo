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
  #rootNamespace;

  constructor(swaggerDocument, rootNamespace) {
    this.#swaggerDocument = swaggerDocument;
    this.#rootNamespace = rootNamespace;

    this.models = this.GenerateModels();
    this.controllers = this.GenerateControllers();
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
      example: schema.example,
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

    const imports = new Set();

    const hasAttributes =
      properties.findIndex((prop) => prop.attributes.length > 0) !== -1;

    if (hasAttributes) {
      const dataAnnotationsImport =
        'using System.ComponentModel.DataAnnotations;';

      if (!imports.has(dataAnnotationsImport)) {
        imports.add(dataAnnotationsImport);
      }
    }

    const hasExamples =
      schema.example !== undefined ||
      properties.findIndex((prop) => prop.example === undefined) === -1;

    if (hasExamples) {
      const filtersImport = `using ${this.#rootNamespace}.SwashbuckleFilters;`;

      if (!imports.has(filtersImport)) {
        imports.add(filtersImport);
      }

      const examplesImport = `using ${this.#rootNamespace}.Generated.Examples;`;

      if (!imports.has(examplesImport)) {
        imports.add(examplesImport);
      }
    }

    return {
      name,
      type: 'class',
      xmlObject: this.GenerateXmlObject(schema),
      properties,
      hasExamples,
      example: schema.example,
      imports,
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

  GenerateTags(operations) {
    const tagSchemas = this.#swaggerDocument.tags;

    const tagsMap = new Map();

    for (const operation of operations) {
      for (const operationTag of operation.schema.tags) {
        if (!tagsMap.has(operationTag)) {
          tagsMap.set(operationTag, { name: operationTag });
        }
      }
    }

    const tags = Array.from(tagsMap.values()).map((tag) => {
      const tagSchema = tagSchemas.find((t) => t.name === tag.name);
      if (tagSchema) {
        return { ...tag, xmlObject: this.GenerateXmlObject(tagSchema) };
      }

      return tag;
    });

    return tags;
  }

  ResponseSchemaIsInlineObject(schema) {
    if (schema.type === 'array') {
      if (schema.items.$ref) {
        return false;
      }
    }

    if (schema.$ref) {
      return false;
    }

    if (schema.type === 'object') {
      return true;
    }

    return false;
  }

  ThrowIfResponseContentIsInvalid(content) {
    if (!content) {
      throw new Error(
        `Response '200' did not have 'application/json' content:\n${JSON.stringify(content, null, 2)}`
      );
    }

    if (this.ResponseSchemaIsInlineObject(content.schema)) {
      throw new Error(
        `Operation responses should have a reference to a schema instead of a inline object: \n${JSON.stringify(content.schema, null, 2)}`
      );
    }
  }

  GenerateReturnType(responses) {
    if (responses['204'] && !responses['200']) {
      return { resolved: 'void', type: 'literal' };
    }

    if (responses['200']) {
      const content = responses['200'].content['application/json'];

      this.ThrowIfResponseContentIsInvalid(content);

      // TODO: How to solve this in DotNet?
      // if (responses['204']) {
      //   return `${this.resolveType(content.schema)} | void`;
      // }

      return this.ResolveDotnetType(content.schema);
    }

    throw new Error(
      `Unexpected response object:\n${JSON.stringify(responses, null, 2)}`
    );
  }

  GenerateOperations() {
    const paths = this.#swaggerDocument.paths;

    const operations = [];

    for (const path in paths) {
      for (const method in paths[path]) {
        const operationSchema = paths[path][method];

        const operation = {
          schema: operationSchema,
          path,
          method,
          returnType: this.GenerateReturnType(operationSchema.responses),
        };

        operations.push(operation);
      }
    }

    return operations;
  }

  GenerateControllers() {
    const operations = this.GenerateOperations();
    const tags = this.GenerateTags(operations);

    const controllers = [];

    for (const tag of tags) {
      const tagOperations = operations.filter((op) =>
        op.schema.tags.includes(tag.name)
      );

      controllers.push({
        name: tag.name,
        xmlObject: tag.xmlObject,
        operations: tagOperations,
      });
    }

    return controllers;
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
    if (classModel.hasExamples) {
      output += `[PropertiesExample(typeof(${classModel.name}Example))]\n`;
    }
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

    if (model.imports?.size > 0) {
      output += Array.from(model.imports).join('\n');
      output += '\n\n';
    }

    output += `namespace ${rootNamespace}.Generated.Models;\n\n`;

    if (model.type === 'enum') {
      output += this.renderEnum(model);
    }

    if (model.type === 'class') {
      output += this.renderClass(model);
    }

    return output.trim();
  }
}

class RenderExample {
  #model;
  #rootNamespace;

  constructor(model, rootNamespace) {
    this.#model = model;
    this.#rootNamespace = rootNamespace;
  }

  getIndentationString(indentation = 0) {
    return new Array(indentation).fill(' ').join('');
  }

  renderPropertyValue(dotnetType, example) {
    let output = '';

    if (dotnetType.type === 'literal') {
      if (dotnetType.resolved === 'string') {
        output += `"${example}"`;
      } else {
        output += example;
      }
    } else if (dotnetType.type === 'object') {
      output += `${dotnetType.resolved}.Parse("${example}")`;
    } else if (dotnetType.type === 'enum') {
      output += `${dotnetType.resolved}.${example}`;
    } else if (dotnetType.type === 'array') {
      if (!Array.isArray(example)) {
        throw new Error(
          `Expected array example, but got '${typeof example}' example.`
        );
      }

      output += '[';
      output += example
        .map((exampleElement) =>
          this.renderPropertyValue(dotnetType.itemType, exampleElement)
        )
        .join(', ');
      output += ']';
    } else {
      throw new Error(`Unexpected type '${dotnetType.type}' found.`);
    }

    return output;
  }

  renderProperty(property, schemaExample, indentation = 0) {
    const indentationString = this.getIndentationString(indentation);

    let output = '';

    const name = uppercaseFirstLetter(property.name);

    const example = schemaExample
      ? schemaExample[property.name]
      : property.example;

    output += `${indentationString}${name} = ${this.renderPropertyValue(property.dotnetType, example)},\n`;

    return output;
  }

  renderExample(indentation = 0) {
    const model = this.#model;

    const indentationString = this.getIndentationString(indentation);

    let output = '';

    output += `${indentationString}return new()\n`;
    output += `${indentationString}{\n`;

    for (const property of model.properties) {
      output += this.renderProperty(property, model.example, indentation + 2);
    }

    output += `${indentationString}};\n`;

    return output;
  }

  render() {
    const model = this.#model;
    const rootNamespace = this.#rootNamespace;

    let output = '';

    output += `using ${rootNamespace}.Generated.Models;\n`;
    output += 'using Swashbuckle.AspNetCore.Filters;\n\n';

    output += `namespace ${rootNamespace}.Generated.Examples;\n\n`;

    output += `public class ${model.name}Example : IExamplesProvider<${model.name}>\n`;
    output += '{\n';
    output += `  public ${model.name} GetExamples()\n`;
    output += '  {\n';
    output += this.renderExample(4);
    output += '  }\n';
    output += '}';

    return output;
  }
}

class RenderController {
  #controller;
  #rootNamespace;

  constructor(controller, rootNamespace) {
    this.#controller = controller;
    this.#rootNamespace = rootNamespace;
  }

  getIndentationString(indentation) {
    return new Array(indentation).fill(' ').join('');
  }

  renderOperation(operation, indentation = 0) {
    const indentationString = this.getIndentationString(indentation);

    let output = '';

    //public ActionResult<Pet> CreatePet([Required] Pet pet)

    output += indentationString;
    output += 'public ActionResult';

    if (operation.returnType.resolved !== 'void') {
      output += `<${operation.returnType.resolved}>`;
    }

    output += ` ${operation.schema.operationId}()\n`;
    output += `${indentationString}{\n`;
    output += `${indentationString}}\n\n`;

    return output;
  }

  render() {
    const controller = this.#controller;

    const imports = [
      'using Microsoft.AspNetCore.Mvc;',
      `using ${this.#rootNamespace}.Generated.Models;`,
    ];
    const attributes = ['[ApiController]', '[Route("[controller]")]'];

    let output = '';

    output += imports.join('\n');
    output += '\n\n';

    output += `namespace ${this.#rootNamespace}.Generated.Controllers;\n\n`;

    output += attributes.join('\n');
    output += '\n';
    output += `public class ${controller.name}Controller : ControllerBase\n`;
    output += '{\n';

    for (const operation of controller.operations) {
      output += this.renderOperation(operation, 2);
    }

    output += '}';

    return output;
  }
}

const ROOT_NAMESPACE = 'AspNetServer';

const IGNORED_MODELS = new Set(['ProblemDetails']);

const dotNetModel = new DotNetModel(swaggerDocument, ROOT_NAMESPACE);

await fs.mkdir(path.join(GENERATED_FOLDER, 'models'), { recursive: true });
await fs.mkdir(path.join(GENERATED_FOLDER, 'examples'), { recursive: true });
for (const model of dotNetModel.models) {
  if (model.type === 'class' && model.hasExamples) {
    await fs.writeFile(
      path.join(GENERATED_FOLDER, 'examples', `${model.name}Example.cs`),
      new RenderExample(model, ROOT_NAMESPACE).render(),
      {
        encoding: 'utf-8',
      }
    );
  }

  if (!IGNORED_MODELS.has(model.name)) {
    await fs.writeFile(
      path.join(GENERATED_FOLDER, 'models', `${model.name}.cs`),
      new RenderModel(model, ROOT_NAMESPACE).render(),
      {
        encoding: 'utf-8',
      }
    );
  }
}
await fs.mkdir(path.join(GENERATED_FOLDER, 'controllers'), { recursive: true });
for (const controller of dotNetModel.controllers) {
  await fs.writeFile(
    path.join(
      GENERATED_FOLDER,
      'controllers',
      `${controller.name}Controller.cs`
    ),
    new RenderController(controller, ROOT_NAMESPACE).render(),
    {
      encoding: 'utf-8',
    }
  );
}
