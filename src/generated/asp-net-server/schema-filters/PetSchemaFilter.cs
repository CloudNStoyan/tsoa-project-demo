using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Extensions;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace SchemaFilters;

// [AttributeUsage(AttributeTargets.Property)]
// public class ExampleAttribute : Attribute
// {
//     public Type ExampleType;
//     public ExampleAttribute(Type exampleType)
//     {
//       ExampleType = exampleType;
//     }
// }


public class ExampleSchemaFilter : ISchemaFilter {
  public void Apply(OpenApiSchema schema, SchemaFilterContext context)
      {
        if (schema.Type != "object") {
          return;
        }

        foreach (var entry in schema.Properties) {
          string propertyName = entry.Key;
          var property = entry.Value;

          if (property.Reference != null) {
            Console.WriteLine(propertyName);
          }
        }

        // Console.WriteLine("Cat Start");
        // Console.WriteLine(schema.Properties);
        // Console.WriteLine("Cat End");
        // schema.Example = new OpenApiObject
        // {
        //     [ "Id" ] = new OpenApiInteger(1),
        //     [ "Description" ] = new OpenApiString("An awesome product")
        // };
      }
}
