using System.Reflection;
using Microsoft.OpenApi.Any;
using AspNetServer.SchemaFilters.Extensions;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace AspNetServer.SwashbuckleFilters;

public class PropertyExampleFilter : ISchemaFilter {
  private readonly IServiceProvider serviceProvider;
  private readonly JsonSerializerOptions customJsonSerializerOptions;
  public PropertyExampleFilter(IServiceProvider serviceProvider)
  {
    this.serviceProvider = serviceProvider;
    this.customJsonSerializerOptions = new JsonSerializerOptions(JsonSerializerDefaults.Web);
    this.customJsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
  }

  public void Apply(OpenApiSchema schema, SchemaFilterContext context)
      {
        var schemaType = context.Type;

        if (schema.Type != "object" || schema.Properties.Count == 0 || schemaType == null) {
          return;
        }

        var propertiesExampleAttr = schemaType.GetCustomAttribute<PropertiesExampleAttribute>();

        if (propertiesExampleAttr == null) {
          return;
        }

        var example = this.serviceProvider.GetCustomExampleWithExamplesProviderType(propertiesExampleAttr.ExamplesProviderType);

        if (example == null) {
          return;
        }

        var exampleJsonObject = JsonObject.Parse(JsonSerializer.Serialize(example, this.customJsonSerializerOptions));

        if (exampleJsonObject == null) {
          return;
        }

        foreach(var property in schema.Properties) {
          string propertyName = property.Key;
          var propertySchema = property.Value;

          propertySchema.Example = new OpenApiString(exampleJsonObject[propertyName]!.ToJsonString(), false, true);
        }
      }
}
