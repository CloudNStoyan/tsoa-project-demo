using System.ComponentModel.DataAnnotations;
using AspNetServer.SwashbuckleFilters;
using AspNetServer.Generated.Examples;

namespace AspNetServer.Generated.Models;

/// <summary>
/// Inventory of adoption status to quantities.
/// </summary>
[PropertiesExample(typeof(InventoryExample))]
public class Inventory {
  /// <summary>
  /// The number of pets that were adopted.
  /// </summary>
  [Required]
  public int Adopted { get; set; }
  /// <summary>
  /// The number of pets that are available for adoption.
  /// </summary>
  [Required]
  public int Available { get; set; }
  /// <summary>
  /// The number of pets that have a pending adoption status.
  /// </summary>
  [Required]
  public int Pending { get; set; }
}