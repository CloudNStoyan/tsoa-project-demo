using Microsoft.OpenApi.Models;

namespace AspNetServer.SwashbuckleFilters;

public interface ICustomGenerated {
  public IEnumerable<OpenApiTag> GetGeneratedTags();
  public IEnumerable<OpenApiSecurityScheme> GetGeneratedSecuritySchemes();
  public OpenApiInfo GetGeneratedApiInfo();
}
