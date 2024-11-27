using Microsoft.AspNetCore.Mvc;
using AspNetServer.Generated.Models;

namespace AspNetServer.Generated.Controllers;

[ApiController]
[Route("[controller]")]
public class StoreController : ControllerBase
{
  public ActionResult<InventoryMap> GetInventory()
  {
  }

  public ActionResult<AdoptionRequest> AdoptPet()
  {
  }

  public ActionResult<AdoptionRequest> GetAdoptRequestById()
  {
  }

  public ActionResult DeleteAdoptRequestById()
  {
  }

}