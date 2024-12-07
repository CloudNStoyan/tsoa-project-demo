using System.Reflection;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.Filters;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace AspNetServer.SwashbuckleFilters;

/// <summary>
/// Removes the automatic content examples of the request body of
/// operations that don't have an explicit SwaggerRequestExample.
/// </summary>
public class RemoveAutomaticRequestExampleFilter : IOperationFilter
{
  public void Apply(OpenApiOperation operation, OperationFilterContext context)
  {
    var actionAttributes = context.MethodInfo.GetCustomAttributes<SwaggerRequestExampleAttribute>();

    if (actionAttributes.Any()) {
      return;
    }

    var contents = operation.RequestBody?.Content;

    if (contents == null) {
      return;
    }

    foreach(var contentEntry in contents) {
      contentEntry.Value.Example = null;
    }
  }
}
