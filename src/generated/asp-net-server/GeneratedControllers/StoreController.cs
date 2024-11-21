using AspNetServer.GeneratedModels;
using Microsoft.AspNetCore.Mvc;

namespace AspNetServer.GeneratedControllers;

[ApiController]
[Route("[controller]")]
public class StoreController : ControllerBase {
  [HttpGet]
  public ActionResult<InventoryMap> GetInventory() {
    throw new NotImplementedException();
  }

  [HttpGet("v2/inventory")]
  public ActionResult<InventoryMap> GetInventoryV2() {
    throw new NotImplementedException();
  }

  // public ActionResult AdoptPet() {
  //   throw new NotImplementedException();
  // }
}
