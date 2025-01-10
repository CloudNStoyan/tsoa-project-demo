using System.ComponentModel.DataAnnotations;
using Swashbuckle.AspNetCore.Filters;
using AspNetServer.SwashbuckleFilters;

namespace AspNetServer.Generated.Models;

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

public class AdoptionRequestExample : IExamplesProvider<AdoptionRequest>
{
  public AdoptionRequest GetExamples()
  {
    return new()
    {
      Id = Guid.Parse("67120cf3-1434-44be-b660-b02df64db677"),
      PetId = Guid.Parse("90dbbed9-bd3d-40ae-ad1c-86602844d4c1"),
      DateOfSubmission = DateTime.Parse("2024-08-25T00:00:00.000"),
      Status = AdoptionRequestStatus.Pending,
    };
  }
}