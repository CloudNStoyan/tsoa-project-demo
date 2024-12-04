using Microsoft.OpenApi.Models;

namespace AspNetServer.SwashbuckleFilters;

public interface ICustomGeneratedTags {
  public IEnumerable<OpenApiTag> GetGenerated();
}

public interface ICustomGeneratedSecurityDefinitions {
  public IEnumerable<OpenApiSecurityScheme> GetGenerated();
}

public interface ICustomGeneratedOpenApiInfo {
  public OpenApiInfo GetGenerated();
}
