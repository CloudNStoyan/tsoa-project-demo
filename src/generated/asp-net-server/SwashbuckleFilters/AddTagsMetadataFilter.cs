using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace AspNetServer.SwashbuckleFilters;

public class CustomOpenApiTags(IEnumerable<OpenApiTag> tags)
{
  public IEnumerable<OpenApiTag> Tags { get; set; } = tags;
}

public class AddTagsMetadataFilter : IDocumentFilter
{
  private OpenApiTag[] Tags {get; set;}

  public AddTagsMetadataFilter(CustomOpenApiTags customOpenApiTags)
  {
    this.Tags = customOpenApiTags.Tags.ToArray();
  }

  public void Apply(OpenApiDocument swaggerDoc, DocumentFilterContext context)
  {
    swaggerDoc.Tags = this.Tags;
  }
}