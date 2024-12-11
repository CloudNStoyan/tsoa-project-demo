using System.ComponentModel.DataAnnotations;
using Swashbuckle.AspNetCore.Filters;
using AspNetServer.SwashbuckleFilters;

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

public class InventoryExample : IExamplesProvider<Inventory>
{
  public Inventory GetExamples()
  {
    return new()
    {
      Adopted = 3,
      Available = 1,
      Pending = 2,
    };
  }
}