using Microsoft.AspNetCore.Mvc;

namespace AspNetServer.SwashbuckleFilters;

[AttributeUsage(AttributeTargets.Method, AllowMultiple = true)]
public class SwaggerErrorExampleAttribute : Attribute {
  public int StatusCode { get; set; }
  public string Title { get; set; }
  public string Detail { get; set; }
  public SwaggerErrorExampleAttribute(int statusCode, string title, string detail)
  {
    this.StatusCode = statusCode;
    this.Title = title;
    this.Detail = detail;
  }

  public ProblemDetails ToProblemDetails() {
    return new ProblemDetails {
      Title = this.Title,
      Status = this.StatusCode,
      Detail = this.Detail
    };
  }
}
