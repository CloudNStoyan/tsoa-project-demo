using System.Reflection;
using System.Runtime.InteropServices;
using Microsoft.OpenApi.Any;
using AspNetServer.SchemaFilters.Extensions;
using Microsoft.OpenApi.Extensions;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Text.Json.Nodes;

namespace AspNetServer.SchemaFilters;

[AttributeUsage(AttributeTargets.Class)]
public class PropertiesExampleAttribute : Attribute {
  public PropertiesExampleAttribute(Type examplesProviderType)
  {
    ExamplesProviderType = examplesProviderType;
  }

  public Type ExamplesProviderType { get; }
}

public class PropertyExampleSchemaFilter : ISchemaFilter {
  private readonly IServiceProvider serviceProvider;
  public PropertyExampleSchemaFilter(IServiceProvider serviceProvider)
  {
    this.serviceProvider = serviceProvider;
  }

  public void Apply(OpenApiSchema schema, SchemaFilterContext context)
      {
        if (context.MemberInfo?.ReflectedType == null) {
          return;
        }

        Type schemaType = context.MemberInfo.ReflectedType;

        var attr = schemaType.GetCustomAttribute<PropertiesExampleAttribute>();

        if (attr == null) {
          return;
        }

        var example = this.serviceProvider.GetCustomExampleWithExamplesProviderType(attr.ExamplesProviderType);

        if (example == null) {
          return;
        }

        var exampleJsonObject = JsonObject.Parse(System.Text.Json.JsonSerializer.Serialize(example));

        schema.Example = new OpenApiString(exampleJsonObject[context.MemberInfo.Name].ToString());

        Console.WriteLine(schema.SerializeAsJson(Microsoft.OpenApi.OpenApiSpecVersion.OpenApi3_0));
      }
}
