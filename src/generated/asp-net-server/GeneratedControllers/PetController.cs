using AspNetServer.GeneratedModels;
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
  /// <returns>Successful creation of a pet.</returns>
  [HttpPost]
  [ProducesResponseType(StatusCodes.Status201Created)]
  [ProducesResponseType(StatusCodes.Status400BadRequest)]
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
  /// <returns>Successful retrieval of pets.</returns>
  [HttpGet("all")]
  public ActionResult<Pet[]> GetAllPets(int offset, int limit = 10) {
    throw new NotImplementedException();
  }

  /// <summary>
  /// Finds Pets by status.
  /// </summary>
  /// <remarks>Returns pets that have the selected adoption status.</remarks>
  /// <param name="status">The adoption status.</param>
  /// <returns>Successful retrieval of pets.</returns>
  [HttpGet("findByStatus")]
  public ActionResult<Pet[]> GetPetsByStatus(AdoptionStatus status) {
    throw new NotImplementedException();
  }

  /// <summary>
  /// Finds Pets by set of kinds.
  /// </summary>
  /// <remarks>Returns pets that are of a specific set of kinds.</remarks>
  /// <param name="kind">The set of kinds of pet.</param>
  /// <returns>Successful retrieval of pets.</returns>
  [HttpGet("findByKinds")]
  public ActionResult<Pet[]> GetPetsByKind(AnimalKind kind) {
    throw new NotImplementedException();
  }

  /// <summary>
  /// Finds Pets by tags.
  /// </summary>
  /// <remarks>Returns pets that include the filter tags.</remarks>
  /// <param name="tags">The tags to filter by.</param>
  /// <returns>Successful retrieval of pets.</returns>
  [HttpGet("findByTags")]
  public ActionResult<Pet[]> GetPetsByTags(string[] tags) {
    throw new NotImplementedException();
  }

  /// <summary>
  /// Finds Pets by added date.
  /// </summary>
  /// <remarks>Returns pets that were added after the given date.</remarks>
  /// <param name="date">The date to filter by.</param>
  /// <returns>Successful retrieval of pets.</returns>
  [HttpGet("findByDate")]
  public ActionResult<Pet[]> GetPetsByDate(DateOnly date) {
    throw new NotImplementedException();
  }

  /// <summary>
  /// Find pet by ID.
  /// </summary>
  /// <remarks>Returns a single pet.</remarks>
  /// <param name="petId">The pet's id.</param>
  /// <returns>Successful retrieval of a pet.</returns>
  [HttpGet("{petId}")]
  [ProducesResponseType(StatusCodes.Status404NotFound)]
  public ActionResult<Pet> GetPet(Guid petId) {
    throw new NotImplementedException();
  }

  /// <summary>
  /// Update an existing pet.
  /// </summary>
  /// <remarks>Update an existing pet by ID.</remarks>
  /// <param name="petToUpdate">The pet's information that should be used in the update.</param>
  /// <returns>Successful update of a pet.</returns>
  [HttpPut]
  [ProducesResponseType(StatusCodes.Status404NotFound)]
  public ActionResult<Pet> UpdatePet(Pet petToUpdate) {
    throw new NotImplementedException();
  }

  /// <summary>
  /// Deletes a pet.
  /// </summary>
  /// <remarks>Deletes a pet by ID.</remarks>
  /// <param name="petId">Pet ID to delete.</param>
  [HttpDelete("{petId}")]
  [ProducesResponseType(StatusCodes.Status204NoContent)]
  [ProducesResponseType(StatusCodes.Status404NotFound)]
  public ActionResult DeletePet(Guid petId) {
    throw new NotImplementedException();
  }
}
