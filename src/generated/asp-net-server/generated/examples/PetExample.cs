using AspNetServer.Generated.Models;
using Swashbuckle.AspNetCore.Filters;

namespace AspNetServer.Generated.Examples;

public class PetExample : IExamplesProvider<Pet>
{
  public Pet GetExamples()
  {
    return new()
    {
      Id = Guid.Parse("90dbbed9-bd3d-40ae-ad1c-86602844d4c1"),
      Name = "Max",
      Breed = "European Domestic Cat",
      Notes = "Likes to scratch a lot.",
      Kind = AnimalKind.Cat,
      Age = 2,
      HealthProblems = false,
      AddedDate = DateOnly.Parse("2024-09-07T21:00:00.000Z"),
      Status = AdoptionStatus.Pending,
      Tags = ["cat", "orange"],
    };
  }
}