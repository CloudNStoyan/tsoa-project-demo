using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace AspNetServer.SwashbuckleFilters;

/// <summary>
/// Removes 'text/json' and 'application/*+json' content types from responses and request body.
/// </summary>
public class RemoveUndesiredContentTypesFilter : IOperationFilter
{
  private static readonly string[] UndesiredContentTypes = ["text/json", "application/*+json"];
  public void Apply(OpenApiOperation operation, OperationFilterContext context)
  {
    foreach(var responseEntry in operation.Responses) {
      foreach (string undesiredContentType in UndesiredContentTypes) {
        responseEntry.Value.Content.Remove(undesiredContentType);
      }
    }

    if (operation.RequestBody != null) {
      foreach (string undesiredContentType in UndesiredContentTypes) {
        operation.RequestBody.Content.Remove(undesiredContentType);
      }
    }
  }
}
