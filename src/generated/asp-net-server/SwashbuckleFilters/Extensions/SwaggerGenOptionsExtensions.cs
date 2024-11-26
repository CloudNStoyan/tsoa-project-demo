using Swashbuckle.AspNetCore.SwaggerGen;

namespace AspNetServer.SwashbuckleFilters.Extensions;

public static class SwaggerGenOptionsExtensions {
  public static void AddCustomFilters(this SwaggerGenOptions options)
  {
    options.SchemaFilter<PropertyExampleFilter>();
    options.OperationFilter<RemoveUndesiredContentTypesFilter>();
    options.OperationFilter<ErrorExampleFilter>();
    options.OperationFilter<NoInlineSchemaFilter>();
  }
}
