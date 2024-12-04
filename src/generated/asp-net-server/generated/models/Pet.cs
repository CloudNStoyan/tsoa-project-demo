using System.ComponentModel.DataAnnotations;
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