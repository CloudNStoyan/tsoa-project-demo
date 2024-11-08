using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using SchemaFilters;

namespace GeneratedControllers;

/// <summary>
/// The pet's animal kind.
/// </summary>
public enum AnimalKind {
  Cat,
  Dog,
  Parrot,
}

/// <summary>
/// The pet's adoption status.
/// </summary>
public enum AdoptionStatus {
  Adopted,
  Available,
  Pending,
}

/// <summary>
/// Pet characteristics.
/// </summary>
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
  public AnimalKind Kind {get; set;}
  /// <summary>
  /// The age of the pet.
  /// </summary>
  [Required]
  public int Age {get; set; }
  /// <summary>
  /// Whether or not the pet has any health problems.
  /// </summary>
  [Required]
  public bool HealthProblems {get; set;}
  /// <summary>
  /// When the pet was added to the system.
  /// </summary>
  [Required]
  public DateOnly AddedDate {get; set;}
  /// <summary>
  /// Pet's adoption status in the store.
  /// </summary>
  [Required]
  public AdoptionStatus Status {get; set;}
  /// <summary>
  /// The pet's tags.
  /// </summary>
  [Required]
  public required string[] Tags {get; set;}
}

[ApiController]
[Route("[controller]")]
public class PetController : ControllerBase {
  private List<Pet> _pets =
  [
   new() {
      Id = new Guid("90dbbed9-bd3d-40ae-ad1c-86602844d4c1"),
      Name = "Kozunak",
      Breed = "Orange Tabby",
      Notes = "Likes to bite a lot.",
      Kind = AnimalKind.Cat,
      Age = 1,
      HealthProblems = false,
      AddedDate = DateOnly.Parse("2023-08-08"),
      Status = AdoptionStatus.Adopted,
      Tags = ["cat", "annoying", "white"]
    }
  ];

  [HttpPost]
  [ProducesResponseType(StatusCodes.Status201Created)]
  [ProducesResponseType(StatusCodes.Status400BadRequest)]
  public ActionResult<Pet> Create(Pet pet)
  {
    pet.Id = Guid.NewGuid();

    _pets.Add(pet);

    return CreatedAtAction(nameof(GetById), new { id = pet.Id }, pet);
  }

  [HttpGet]
  public ActionResult<Pet> GetById(Guid petId) {
    var pet = _pets.Find(x => x.Id == petId);

    if (pet is null) {
      return NotFound();
    }

    return pet;
  }
}
