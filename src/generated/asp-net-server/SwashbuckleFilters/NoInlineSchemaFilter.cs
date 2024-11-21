
using AspNetServer.SwashbuckleFilters.Extensions;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace AspNetServer.SwashbuckleFilters;

public class NoInlineSchemaFilter : IOperationFilter
{
  public void Apply(OpenApiOperation operation, OperationFilterContext context)
  {
    foreach (var response in operation.Responses) {
      var returnType = context.ApiDescription.SupportedResponseTypes.SingleOrDefault(desc => desc.StatusCode.ToString() == response.Key)?.Type;

      if (returnType == null) {
        continue;
      }

      string schemaId = context.SchemaGenerator.GetSchemaId(returnType);

      foreach (var content in response.Value.Content) {
        var responseSchema = content.Value.Schema;

        if (responseSchema.Reference != null || responseSchema.Type != "object") {
          continue;
        }

        if (!context.SchemaRepository.TryLookupByType(returnType, out var _refSchema)) {
          var generatedSchema = context.SchemaGenerator.GenerateSchema(returnType, context.SchemaRepository);

          context.SchemaRepository.RegisterType(returnType, schemaId);
          context.SchemaRepository.AddDefinition(schemaId, generatedSchema);
        }

        content.Value.Schema = new OpenApiSchema {
          Reference = new OpenApiReference {
            Id = schemaId,
            Type = ReferenceType.Schema
          }
        };
      }
    }
  }
}
