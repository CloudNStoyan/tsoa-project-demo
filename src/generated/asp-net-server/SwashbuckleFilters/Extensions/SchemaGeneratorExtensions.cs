using Swashbuckle.AspNetCore.SwaggerGen;

namespace AspNetServer.SwashbuckleFilters.Extensions;

public static class SchemaGeneratorExtensions {
  public static string GetSchemaId(this ISchemaGenerator generator, Type modelType) {
    if (!modelType.IsConstructedGenericType) {
      return modelType.Name.Replace("[]", "Array");
    }

    var prefix = modelType.GetGenericArguments()
        .Select(genericArg => GetSchemaId(generator, genericArg))
        .Aggregate((previous, current) => previous + current);

    return prefix + modelType.Name.Split('`').First();
  }
}
