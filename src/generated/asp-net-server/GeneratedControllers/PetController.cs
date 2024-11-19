using AspNetServer.GeneratedModels;
using Microsoft.AspNetCore.Mvc;

namespace AspNetServer.GeneratedControllers;


[ApiController]
[Route("[controller]")]
public class PetController : ControllerBase {
  private List<PetModel> _pets =
  [
   new() {
      Id = new Guid("90dbbed9-bd3d-40ae-ad1c-86602844d4c1"),
      Name = "Kozunak",
      Breed = "Orange Tabby",
      Notes = "Likes to bite a lot.",
      Kind = AnimalKind.Cat,
      Age = 1,
      HealthProblems = false,
      AddedDate = DateOnly.Parse("2023-08-08"),
      Status = AdoptionStatus.Adopted,
      Tags = ["cat", "annoying", "white"]
    }
  ];

  [HttpPost]
  [ProducesResponseType(StatusCodes.Status201Created)]
  [ProducesResponseType(StatusCodes.Status400BadRequest)]
  public ActionResult<PetModel> Create(PetModel pet)
  {
    pet.Id = Guid.NewGuid();

    _pets.Add(pet);

    return CreatedAtAction(nameof(GetById), new { id = pet.Id }, pet);
  }

  [HttpGet]
  [ProducesResponseType(StatusCodes.Status200OK)]
  [ProducesResponseType(StatusCodes.Status404NotFound)]
  public ActionResult<PetModel> GetById(Guid petId) {
    var pet = _pets.Find(x => x.Id == petId);

    if (pet is null) {
      return NotFound();
    }

    return pet;
  }
}
