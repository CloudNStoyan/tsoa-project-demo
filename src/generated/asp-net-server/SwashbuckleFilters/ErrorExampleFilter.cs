using System.Reflection;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace AspNetServer.SwashbuckleFilters;

public class ErrorExampleFilter : IOperationFilter
{
  private readonly JsonSerializerOptions customJsonSerializerOptions;
  public ErrorExampleFilter()
  {
    this.customJsonSerializerOptions = new JsonSerializerOptions(JsonSerializerDefaults.Web);
    this.customJsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
  }
  public void Apply(OpenApiOperation operation, OperationFilterContext context)
  {
    var errorExamples = context.MethodInfo.GetCustomAttributes<SwaggerErrorExampleAttribute>();

    if (!errorExamples.Any()) {
      return;
    }

    foreach (var errorExample in errorExamples) {
      string statusCodeAsString = errorExample.StatusCode.ToString();

      if (operation.Responses.TryGetValue(statusCodeAsString, out OpenApiResponse? response)) {
        response.Description = errorExample.Title;

        if (response.Content.TryGetValue("application/json", out OpenApiMediaType? content)) {
          string exampleKey = $"Example {content.Examples.Count + 1}";
          string errorExampleAsJson = JsonSerializer.Serialize(errorExample.ToProblemDetails(), this.customJsonSerializerOptions);

          content.Examples.Add(exampleKey, new OpenApiExample {
            Value = new OpenApiString(errorExampleAsJson, false, true)
          });
        }
      }
    }
  }
}
