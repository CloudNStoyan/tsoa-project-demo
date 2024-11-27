using System.ComponentModel.DataAnnotations;
using AspNetServer.SwashbuckleFilters;

namespace AspNetServer.Generated.Models;

/// <summary>
/// The pet's adoption status.
/// </summary>
public enum AdoptionStatus {
  Adopted,
  Available,
  Pending,
}