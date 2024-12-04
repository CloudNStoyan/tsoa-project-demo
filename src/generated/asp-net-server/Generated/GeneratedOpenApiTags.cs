using AspNetServer.SwashbuckleFilters;
using Microsoft.OpenApi.Models;

namespace AspNetServer.Generated;

public class GeneratedOpenApiTags : ICustomGeneratedTags
{
  public IEnumerable<OpenApiTag> GetGenerated()
  {
    return [
      new()
      {
        Name = "Pet",
        Description = "Everything about your Pets",
        ExternalDocs = new ()
        {
            Description = "Find out more",
            Url = new ("http://swagger.io"),
        }
      },
      new()
      {
        Name = "Store",
        Description = "Access to Petstore orders",
        ExternalDocs = new ()
        {
          Description = "Find out more about our store",
          Url = new ("http://swagger.io"),
        }
      }
    ];
  }
}
