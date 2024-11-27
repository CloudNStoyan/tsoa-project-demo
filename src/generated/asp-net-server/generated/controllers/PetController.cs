using Microsoft.AspNetCore.Mvc;
using AspNetServer.Generated.Models;

namespace AspNetServer.Generated.Controllers;

[ApiController]
[Route("[controller]")]
public class PetController : ControllerBase
{
  public ActionResult<Pet> CreatePet()
  {
  }

  public ActionResult<Pet> UpdatePet()
  {
  }

  public ActionResult<Pet[]> GetAllPets()
  {
  }

  public ActionResult<Pet[]> GetPetsByStatus()
  {
  }

  public ActionResult<Pet[]> GetPetsByKind()
  {
  }

  public ActionResult<Pet[]> GetPetsByTags()
  {
  }

  public ActionResult<Pet[]> GetPetsByDate()
  {
  }

  public ActionResult<Pet> GetPet()
  {
  }

  public ActionResult DeletePet()
  {
  }

}