using System.ComponentModel.DataAnnotations;
using AspNetServer.SwashbuckleFilters;

namespace AspNetServer.Generated.Models;

public class ProblemDetails {
  public string? Type { get; set; }
  public string? Title { get; set; }
  public int? Status { get; set; }
  public string? Detail { get; set; }
  public string? Instance { get; set; }
}