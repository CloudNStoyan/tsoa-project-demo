using System.ComponentModel.DataAnnotations;
using AspNetServer.SwashbuckleFilters;

namespace AspNetServer.Generated.Models;

/// <summary>
/// Inventory map of adoption status to quantities.
/// </summary>
public class InventoryMap {
  [Required]
  public double Adopted { get; set; }
  [Required]
  public double Available { get; set; }
  [Required]
  public double Pending { get; set; }
}