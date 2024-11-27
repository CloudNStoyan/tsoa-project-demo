using AspNetServer.Generated.Models;
using Swashbuckle.AspNetCore.Filters;

namespace AspNetServer.Generated.Examples;

public class AdoptionRequestExample : IExamplesProvider<AdoptionRequest>
{
  public AdoptionRequest GetExamples()
  {
    return new()
    {
      Id = Guid.Parse("67120cf3-1434-44be-b660-b02df64db677"),
      PetId = Guid.Parse("90dbbed9-bd3d-40ae-ad1c-86602844d4c1"),
      DateOfSubmission = DateTime.Parse("2024-08-25T00:00:00.000Z"),
      Status = AdoptionRequestStatus.Pending,
    };
  }
}