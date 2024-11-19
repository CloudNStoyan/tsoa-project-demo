using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace AspNetServer.SwashbuckleFilters;

public class RemoveModelSuffixFilter : IDocumentFilter
{
  public void Apply(OpenApiDocument swaggerDoc, DocumentFilterContext context)
  {
    const string modelSuffix = "Model";

    var renamedSchemas = new Dictionary<string, OpenApiSchema>();

    foreach (var schemaEntry in swaggerDoc.Components.Schemas) {
      string schemaKey = schemaEntry.Key;

      if (schemaKey.EndsWith(modelSuffix)) {
        schemaKey = schemaKey.Substring(0, schemaKey.Length - modelSuffix.Length);
      }

      renamedSchemas.Add(schemaKey,  schemaEntry.Value);
    }

    swaggerDoc.Components.Schemas = renamedSchemas;
  }
}
