using AspNetServer.Generated.Models;
using Swashbuckle.AspNetCore.Filters;

namespace AspNetServer.Generated.Examples;

public class GetPetExample : IExamplesProvider<Pet>
{
  public Pet GetExamples()
  {
    return new()
    {
      Id = Guid.Parse("d4c8d1c2-3928-468f-8e34-b3166a56f9ce"),
      Name = "Unhappy",
      Breed = "European Domestic Cat",
      Notes = "Very annoying.",
      Kind = AnimalKind.Cat,
      Age = 1,
      HealthProblems = false,
      AddedDate = DateOnly.Parse("2023-08-08T00:00:00.000Z"),
      Status = AdoptionStatus.Adopted,
      Tags = ["cat", "annoying", "white"],
    };
  }
}