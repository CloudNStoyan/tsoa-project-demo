using AspNetServer.GeneratedModels;
using AspNetServer.SwashbuckleFilters;
using Microsoft.AspNetCore.Mvc;

namespace AspNetServer.GeneratedControllers;

[ApiController]
[Route("[controller]")]
public class PetController : ControllerBase {
  /// <summary>
  /// Add a new pet to the store.
  /// </summary>
  /// <remarks>Add a new pet to the store.</remarks>
  /// <param name="pet">Create a new pet in the store.</param>
  /// <response code="200">Successful creation of a pet.</response>
  [HttpPost]
  [ProducesResponseType(StatusCodes.Status200OK)]
  public ActionResult<Pet> CreatePet(Pet pet)
  {
    throw new NotImplementedException();
  }

  /// <summary>
  /// Returns all pets.
  /// </summary>
  /// <remarks>Returns all pets with limit and offset functionality.</remarks>
  /// <param name="offset">Offset to discard elements.</param>
  /// <param name="limit">How many records to return.</param>
  /// <response code="200">Successful retrieval of pets.</response>
  [HttpGet("all")]
  public ActionResult<Pet[]> GetAllPets(int offset, int limit = 10) {
    throw new NotImplementedException();
  }

  /// <summary>
  /// Finds Pets by status.
  /// </summary>
  /// <remarks>Returns pets that have the selected adoption status.</remarks>
  /// <param name="status">The adoption status.</param>
  /// <response code="200">Successful retrieval of pets.</response>
  [HttpGet("findByStatus")]
  public ActionResult<Pet[]> GetPetsByStatus(AdoptionStatus status) {
    throw new NotImplementedException();
  }

  /// <summary>
  /// Finds Pets by set of kinds.
  /// </summary>
  /// <remarks>Returns pets that are of a specific set of kinds.</remarks>
  /// <param name="kind">The set of kinds of pet.</param>
  /// <response code="200">Successful retrieval of pets.</response>
  [HttpGet("findByKinds")]
  public ActionResult<Pet[]> GetPetsByKind(AnimalKind kind) {
    throw new NotImplementedException();
  }

  /// <summary>
  /// Finds Pets by tags.
  /// </summary>
  /// <remarks>Returns pets that include the filter tags.</remarks>
  /// <param name="tags">The tags to filter by.</param>
  /// <response code="200">Successful retrieval of pets.</response>
  [HttpGet("findByTags")]
  public ActionResult<Pet[]> GetPetsByTags(string[] tags) {
    throw new NotImplementedException();
  }

  /// <summary>
  /// Finds Pets by added date.
  /// </summary>
  /// <remarks>Returns pets that were added after the given date.</remarks>
  /// <param name="date">The date to filter by.</param>
  /// <response code="200">Successful retrieval of pets.</response>
  [HttpGet("findByDate")]
  public ActionResult<Pet[]> GetPetsByDate(DateOnly date) {
    throw new NotImplementedException();
  }

  /// <summary>
  /// Find pet by ID.
  /// </summary>
  /// <remarks>Returns a single pet.</remarks>
  /// <param name="petId">The pet's id.</param>
  /// <response code="200">Successful retrieval of a pet.</response>
  [HttpGet("{petId}")]
  [ProducesResponseType(StatusCodes.Status200OK)]
  [ProducesResponseType(StatusCodes.Status404NotFound)]
  [ProducesResponseType(StatusCodes.Status401Unauthorized)]
  [SwaggerErrorExample(StatusCodes.Status404NotFound, "Not Found", "Pet not found!")]
  [SwaggerErrorExample(StatusCodes.Status401Unauthorized, "Unauthorized", "Access denied!")]
  public ActionResult<Pet> GetPet(Guid petId) {
    throw new NotImplementedException();
  }

  /// <summary>
  /// Update an existing pet.
  /// </summary>
  /// <remarks>Update an existing pet by ID.</remarks>
  /// <param name="petToUpdate">The pet's information that should be used in the update.</param>
  /// <response code="200">Successful update of a pet.</response>
  [HttpPut]
  [ProducesResponseType(StatusCodes.Status200OK)]
  [ProducesResponseType(StatusCodes.Status404NotFound)]
  public ActionResult<Pet> UpdatePet(Pet petToUpdate) {
    throw new NotImplementedException();
  }

  /// <summary>
  /// Deletes a pet.
  /// </summary>
  /// <remarks>Deletes a pet by ID.</remarks>
  /// <param name="petId">Pet ID to delete.</param>
  /// <response code="204">No content</response>
  [HttpDelete("{petId}")]
  [ProducesResponseType(StatusCodes.Status204NoContent)]
  [ProducesResponseType(StatusCodes.Status404NotFound)]
  public ActionResult DeletePet(Guid petId) {
    throw new NotImplementedException();
  }
}
