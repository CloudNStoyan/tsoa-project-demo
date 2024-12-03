using AspNetServer.Demos.GeneratedModels;
using Swashbuckle.AspNetCore.Filters;

namespace AspNetServer.Demos.OpenApiExamples;

public class MultiplePetExample : IExamplesProvider<Pet[]>
{
  public Pet[] GetExamples()
  {
    Pet[] petExamples = [
      new()
    {
      Id = Guid.Parse("90dbbed9-bd3d-40ae-ad1c-86602844d4c1"),
      Name = "Kozunak",
      Breed = "Orange Tabby",
      Notes = "Likes to bite a lot.",
      Kind = AnimalKind.Cat,
      Age = 4,
      HealthProblems = false,
      AddedDate = DateOnly.Parse("2020-08-21"),
      Status = AdoptionStatus.Adopted,
      Tags = ["cat", "orange"]
    },
    new()
    {
      Id = Guid.Parse("d4c8d1c2-3928-468f-8e34-b3166a56f9ce"),
      Name = "Happy",
      Breed = "European Domestic Cat",
      Notes = "Very annoying.",
      Kind = AnimalKind.Cat,
      Age = 1,
      HealthProblems = false,
      AddedDate = DateOnly.Parse("2023-08-08"),
      Status = AdoptionStatus.Adopted,
      Tags = ["cat", "annoying", "white"]
    }];


    return petExamples;
  }
}
