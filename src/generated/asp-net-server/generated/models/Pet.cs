using AspNetServer.SwashbuckleFilters;

namespace AspNetServer.Generated.Models;

/// <summary>
/// Pet characteristics.
/// </summary>
public class Pet {
  /// <summary>
  /// The pet's identifier.
  /// </summary>
  public UUID Id { get; set; }

  /// <summary>
  /// The name of the pet.
  /// </summary>
  public string Name { get; set; }

  /// <summary>
  /// The kind of breed the pet is.
  /// </summary>
  public string Breed { get; set; }

  /// <summary>
  /// Free form text associated with the pet.
  /// </summary>
  public string Notes { get; set; }

  /// <summary>
  /// What kind of pet it is.
  /// </summary>
  public AnimalKind Kind { get; set; }

  /// <summary>
  /// The age of the pet.
  /// </summary>
  public int Age { get; set; }

  /// <summary>
  /// Whether or not the pet has any health problems.
  /// </summary>
  public bool HealthProblems { get; set; }

  /// <summary>
  /// When the pet was added to the system.
  /// </summary>
  public DateOnly AddedDate { get; set; }

  /// <summary>
  /// Pet's adoption status in the store.
  /// </summary>
  public AdoptionStatus Status { get; set; }

  /// <summary>
  /// The pet's tags.
  /// </summary>
  public string[] Tags { get; set; }

}