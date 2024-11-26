using AspNetServer.SwashbuckleFilters;

namespace AspNetServer.Generated.Models;

/// <summary>
/// Adoption request information.
/// </summary>
public class AdoptionRequest {
  /// <summary>
  /// The adoption's ID.
  /// </summary>
  public UUID Id { get; set; }

  /// <summary>
  /// The adoptee's ID.
  /// </summary>
  public UUID PetId { get; set; }

  /// <summary>
  /// The date of submission of the adoption request.
  /// </summary>
  public DateTime DateOfSubmission { get; set; }

  /// <summary>
  /// The adoption request status.
  /// </summary>
  public AdoptionRequestStatus Status { get; set; }

}
