using AspNetServer.Generated.Models;
using Swashbuckle.AspNetCore.Filters;

namespace AspNetServer.Generated.Examples;

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