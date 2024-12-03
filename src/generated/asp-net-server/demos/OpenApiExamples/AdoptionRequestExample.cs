using AspNetServer.Demos.GeneratedModels;
using Swashbuckle.AspNetCore.Filters;

namespace AspNetServer.Demos.OpenApiExamples;

public class AdoptionRequestExample : IExamplesProvider<AdoptionRequest>
{
  public AdoptionRequest GetExamples()
  {
    return new AdoptionRequest()
    {
      Id = Guid.Parse("67120cf3-1434-44be-b660-b02df64db677"),
      PetId = Guid.Parse("90dbbed9-bd3d-40ae-ad1c-86602844d4c1"),
      DateOfSubmission = DateTime.Parse("2024-08-25"),
      Status = AdoptionRequestStatus.Pending
    };
  }
}
