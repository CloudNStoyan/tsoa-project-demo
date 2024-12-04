using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace AspNetServer.SwashbuckleFilters.Extensions;

public static class SwaggerGenOptionsExtensions {
  public static void AddCustomFilters(this SwaggerGenOptions options)
  {
    options.SchemaFilter<PropertyExampleFilter>();
    options.OperationFilter<RemoveUndesiredContentTypesFilter>();
    options.OperationFilter<ErrorExampleFilter>();
    options.OperationFilter<NoInlineSchemaFilter>();
    options.OperationFilter<RemoveAutomaticRequestExample>();
    options.SchemaFilter<RemoveUndesiredMinLengthFilter>();
  }

  public static void AddGeneratedSecurityDefinitions(this SwaggerGenOptions options) {

  }

  public static void AddGeneratedTags(this SwaggerGenOptions options) {

  }

  public static void AddGeneratedApiInfo(this SwaggerGenOptions options) {

  }

  public static void AddCustomTagsMetadata(this SwaggerGenOptions options, OpenApiTag[] tags) {
    options.DocumentFilter<AddTagsMetadataFilter>(new CustomOpenApiTags(tags));
  }
}
