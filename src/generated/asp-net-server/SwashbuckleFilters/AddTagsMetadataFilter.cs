using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace AspNetServer.SwashbuckleFilters;

/// <summary>
/// Adds OpenAPI Tags to the schema.
/// </summary>
public class AddTagsMetadataFilter : IDocumentFilter
{
  private OpenApiTag[] Tags {get; set;}

  public AddTagsMetadataFilter(OpenApiTag[] tags)
  {
    this.Tags = tags;
  }

  public void Apply(OpenApiDocument swaggerDoc, DocumentFilterContext context)
  {
    swaggerDoc.Tags = this.Tags;
  }
}
