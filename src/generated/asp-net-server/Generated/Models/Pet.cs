using System.ComponentModel.DataAnnotations;
using Swashbuckle.AspNetCore.Filters;
using AspNetServer.SwashbuckleFilters;

namespace AspNetServer.Generated.Models;

/// <summary>
/// Pet characteristics.
/// </summary>
[PropertiesExample(typeof(PetExample))]
public class Pet {
  /// <summary>
  /// The pet's identifier.
  /// </summary>
  [Required]
  public Guid Id { get; set; }
  /// <summary>
  /// The name of the pet.
  /// </summary>
  [MinLength(3)]
  [MaxLength(20)]
  [Required]
  public required string Name { get; set; }
  /// <summary>
  /// The kind of breed the pet is.
  /// </summary>
  [Required]
  public required string Breed { get; set; }
  /// <summary>
  /// Free form text associated with the pet.
  /// </summary>
  [Required]
  public required string Notes { get; set; }
  /// <summary>
  /// What kind of pet it is.
  /// </summary>
  [Required]
  public AnimalKind Kind { get; set; }
  /// <summary>
  /// The age of the pet.
  /// </summary>
  [Range(0, 99)]
  [Required]
  public int Age { get; set; }
  /// <summary>
  /// Whether or not the pet has any health problems.
  /// </summary>
  [Required]
  public bool HealthProblems { get; set; }
  /// <summary>
  /// When the pet was added to the system.
  /// </summary>
  [Required]
  public DateOnly AddedDate { get; set; }
  /// <summary>
  /// Pet's adoption status in the store.
  /// </summary>
  [Required]
  public AdoptionStatus Status { get; set; }
  /// <summary>
  /// The pet's tags.
  /// </summary>
  [MinLength(1)]
  [MaxLength(5)]
  [Required]
  public required string[] Tags { get; set; }
}

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
      AddedDate = DateOnly.Parse("2024-09-07T21:00:00.000"),
      Status = AdoptionStatus.Pending,
      Tags = ["cat", "orange"],
    };
  }
}

public class MultiplePetExample : IExamplesProvider<Pet[]>
{
  public Pet[] GetExamples()
  {
    return [
      new()
      {
        Id = Guid.Parse("90dbbed9-bd3d-40ae-ad1c-86602844d4c1"),
        Name = "Kozunak",
        Breed = "Orange Tabby",
        Notes = "Likes to bite a lot.",
        Kind = AnimalKind.Cat,
        Age = 4,
        HealthProblems = false,
        AddedDate = DateOnly.Parse("2020-08-21T00:00:00.000"),
        Status = AdoptionStatus.Adopted,
        Tags = ["cat", "orange"],
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
        AddedDate = DateOnly.Parse("2023-08-08T00:00:00.000"),
        Status = AdoptionStatus.Adopted,
        Tags = ["cat", "annoying", "white"],
      }
    ];
  }
}