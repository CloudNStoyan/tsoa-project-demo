using AspNetServer.GeneratedModels;
using Swashbuckle.AspNetCore.Filters;

namespace AspNetServer.OpenApiExamples;

public class PetExample : IExamplesProvider<Pet>
{
  public Pet GetExamples()
  {
    return new Pet()
    {
      Id = Guid.Parse("90dbbed9-bd3d-40ae-ad1c-86602844d4c1"),
      Name = "Max",
      Breed = "European Domestic Cat",
      Notes = "Likes to scratch a lot.",
      Kind = AnimalKind.Cat,
      Age = 2,
      HealthProblems = false,
      AddedDate = DateOnly.Parse("09-08-2024"),
      Status = AdoptionStatus.Pending,
      Tags = ["cat", "orange"]
    };
  }
}