using System.ComponentModel.DataAnnotations;
using AspNetServer.Demos.OpenApiExamples;
using AspNetServer.SwashbuckleFilters;

namespace AspNetServer.Demos.GeneratedModels;

/// <summary>
/// Adoption request information.
/// </summary>
[PropertiesExample(typeof(AdoptionRequestExample))]
public class AdoptionRequest {
  /// <summary>
  /// The adoption's ID.
  /// </summary>
  [Required]
  public Guid Id { get; set; }

  /// <summary>
  /// The adoptee's ID.
  /// </summary>
  [Required]
  public Guid PetId { get; set; }

  /// <summary>
  /// The date of submission of the adoption request.
  /// </summary>
  [Required]
  public DateTime DateOfSubmission { get; set; }

  /// <summary>
  /// The adoption request status.
  /// </summary>
  [Required]
  public AdoptionRequestStatus Status { get; set; }
}
