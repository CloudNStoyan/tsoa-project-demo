using AspNetServer.SwashbuckleFilters;
using Microsoft.OpenApi.Models;

namespace AspNetServer.Generated;

public static class GeneratedDefinitions
{
  public static OpenApiInfo GetGeneratedApiInfo()
  {
    return new()
    {
      Version = "1.0.0",
      Title = "TSOA Demo Pet Store - OpenAPI 3.0",
      Description = "Pet Store Server OpenAPI 3.0 specification.\n\nSome useful links:\n- [The TSOA Demo Pet Store repository](https://github.com/CloudNStoyan/tsoa-project-demo)\n- [The source API definition for the Pet Store](https://github.com/CloudNStoyan/tsoa-project-demo/blob/main/src/generated/swagger.yaml)",
    };
  }

  public static OpenApiSecurityScheme[] GetGeneratedSecuritySchemes()
  {
    return [
      new()
      {
        Name = "api_key",
        Description = "The TSOA Demo Pet Store API Key is:\n\n`simple-pet-token`",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer"
      }
    ];
  }

  public static OpenApiTag[] GetGeneratedTags()
  {
    return [
      new()
      {
        Name = "Pet",
        Description = "Everything about your Pets",
        ExternalDocs = new()
        {
          Description = "Find out more",
          Url = new ("http://swagger.io"),
        },
      },
      new()
      {
        Name = "Store",
        Description = "Access to Petstore orders",
        ExternalDocs = new()
        {
          Description = "Find out more about our store",
          Url = new ("http://swagger.io"),
        },
      },
    ];
  }
}