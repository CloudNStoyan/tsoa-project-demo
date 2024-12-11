using AspNetServer.Generated;
using Swashbuckle.AspNetCore.Filters;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace AspNetServer.SwashbuckleFilters.Extensions;

public static class SwaggerGenOptionsExtensions {
  public static void AddCustomFilters(this SwaggerGenOptions options)
  {
    options.SchemaFilter<PropertyExampleFilter>();
    options.OperationFilter<RemoveUndesiredContentTypesFilter>();
    options.OperationFilter<ErrorExampleFilter>();
    options.OperationFilter<RemoveAutomaticRequestExampleFilter>();
    options.SchemaFilter<RemoveUndesiredMinLengthFilter>();
    options.SchemaFilter<AddPatternToUuidFilter>();
  }

  public static void SwaggerDocUsingGeneratedDefinitions(this SwaggerGenOptions options, string name) {
    options.SwaggerDoc(name, GeneratedDefinitions.GetGeneratedApiInfo());

    options.DocumentFilter<AddTagsMetadataFilter>([GeneratedDefinitions.GetGeneratedTags()]);

    var securitySchemes = GeneratedDefinitions.GetGeneratedSecuritySchemes();

    foreach (var securityScheme in securitySchemes) {
      options.AddSecurityDefinition(securityScheme.Name, securityScheme);
    }

    options.OperationFilter<SecurityRequirementsOperationFilter>(false, securitySchemes[0].Name);
  }
}
