using System.Reflection;
using AspNetServer.SwashbuckleFilters.Extensions;
using Microsoft.OpenApi.Extensions;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.Filters;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace AspNetServer.SwashbuckleFilters;

public class RemoveAutomaticRequestExample : IOperationFilter
{
  public void Apply(OpenApiOperation operation, OperationFilterContext context)
  {
    var actionAttributes = context.MethodInfo.GetCustomAttributes<SwaggerRequestExampleAttribute>();

    if (actionAttributes.Any()) {
      System.Console.WriteLine(operation.OperationId);
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
