using Microsoft.OpenApi.Extensions;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace AspNetServer.SwashbuckleFilters;

public class RemoveTextJsonResponseFilter : IOperationFilter
{
  public void Apply(OpenApiOperation operation, OperationFilterContext context)
  {
    foreach(var responseEntry in operation.Responses) {
      responseEntry.Value.Content.Remove("text/json");
    }
  }
}
