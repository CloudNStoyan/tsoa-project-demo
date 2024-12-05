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
    options.OperationFilter<NoInlineSchemaFilter>();
    options.OperationFilter<RemoveAutomaticRequestExample>();
    options.SchemaFilter<RemoveUndesiredMinLengthFilter>();
  }

  public static void SwaggerDocUsingGeneratedDefinitions(this SwaggerGenOptions options, string name) {
    var generatedDefinitions = new GeneratedDefinitions();

    options.SwaggerDoc(name, generatedDefinitions.GetGeneratedApiInfo());

    var tags = generatedDefinitions.GetGeneratedTags().ToArray();

    options.DocumentFilter<AddTagsMetadataFilter>([tags]);

    var securitySchemes = generatedDefinitions.GetGeneratedSecuritySchemes().ToArray();

    foreach (var securityScheme in securitySchemes) {
      options.AddSecurityDefinition(securityScheme.Name, securityScheme);
    }

    options.OperationFilter<SecurityRequirementsOperationFilter>(false, securitySchemes[0].Name);
  }
}
