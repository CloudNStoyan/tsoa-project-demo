using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Filters;
using AspNetServer.SwashbuckleFilters;
using AspNetServer.Generated.Models;

namespace AspNetServer.Generated.Controllers;

[ApiController]
[Route("[controller]")]
public class PetController : ControllerBase
{
  /// <summary>
  /// Add a new pet to the store.
  /// </summary>
  /// <remarks>Add a new pet to the store.</remarks>
  /// <param name="pet">Create a new pet in the store.</param>
  /// <response code="200">Successful creation of a pet.</response>
  [HttpPost]
  [ProducesResponseType(StatusCodes.Status200OK)]
  [SwaggerResponseExample(StatusCodes.Status200OK, typeof(PetExample))]
  public ActionResult<Pet> CreatePet([FromBody][Required] Pet pet)
  {
    throw new NotImplementedException();
  }

  /// <summary>
  /// Update an existing pet.
  /// </summary>
  /// <remarks>Update an existing pet by ID.</remarks>
  /// <param name="pet">The pet's information that should be used in the update.</param>
  /// <response code="200">Successful update of a pet.</response>
  /// <response code="404">Not Found</response>
  [HttpPut]
  [ProducesResponseType(StatusCodes.Status404NotFound)]
  [SwaggerErrorExample(StatusCodes.Status404NotFound, "Not Found", "Pet not found!")]
  [ProducesResponseType(StatusCodes.Status200OK)]
  [SwaggerResponseExample(StatusCodes.Status200OK, typeof(PetExample))]
  public ActionResult<Pet> UpdatePet([FromBody][Required] Pet pet)
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
  [ProducesResponseType(StatusCodes.Status200OK)]
  [SwaggerResponseExample(StatusCodes.Status200OK, typeof(MultiplePetExample))]
  public ActionResult<Pet[]> GetAllPets([FromQuery] int offset = 0, [FromQuery] int limit = 10)
  {
    throw new NotImplementedException();
  }

  /// <summary>
  /// Finds Pets by status.
  /// </summary>
  /// <remarks>Returns pets that have the selected adoption status.</remarks>
  /// <param name="status">The adoption status.</param>
  /// <response code="200">Successful retrieval of pets.</response>
  [HttpGet("findByStatus")]
  [ProducesResponseType(StatusCodes.Status200OK)]
  [SwaggerResponseExample(StatusCodes.Status200OK, typeof(MultiplePetExample))]
  public ActionResult<Pet[]> GetPetsByStatus([FromQuery][Required] AdoptionStatus status)
  {
    throw new NotImplementedException();
  }

  /// <summary>
  /// Finds Pets by set of kinds.
  /// </summary>
  /// <remarks>Returns pets that are of a specific set of kinds.</remarks>
  /// <param name="kinds">The set of kinds of pet.</param>
  /// <response code="200">Successful retrieval of pets.</response>
  [HttpGet("findByKinds")]
  [ProducesResponseType(StatusCodes.Status200OK)]
  [SwaggerResponseExample(StatusCodes.Status200OK, typeof(MultiplePetExample))]
  public ActionResult<Pet[]> GetPetsByKind([FromQuery][Required] AnimalKind[] kinds)
  {
    throw new NotImplementedException();
  }

  /// <summary>
  /// Finds Pets by tags.
  /// </summary>
  /// <remarks>Returns pets that include the filter tags.</remarks>
  /// <param name="tags">The tags to filter by.</param>
  /// <response code="200">Successful retrieval of pets.</response>
  [HttpGet("findByTags")]
  [ProducesResponseType(StatusCodes.Status200OK)]
  [SwaggerResponseExample(StatusCodes.Status200OK, typeof(MultiplePetExample))]
  public ActionResult<Pet[]> GetPetsByTags([FromQuery][Required] string[] tags)
  {
    throw new NotImplementedException();
  }

  /// <summary>
  /// Finds Pets by added date.
  /// </summary>
  /// <remarks>Returns pets that were added after the given date.</remarks>
  /// <param name="afterDate">The date to filter by.</param>
  /// <response code="200">Successful retrieval of pets.</response>
  [Obsolete]
  [HttpGet("findByDate")]
  [ProducesResponseType(StatusCodes.Status200OK)]
  [SwaggerResponseExample(StatusCodes.Status200OK, typeof(GetPetsByDateExample))]
  public ActionResult<Pet[]> GetPetsByDate([FromQuery][Required] DateOnly afterDate)
  {
    throw new NotImplementedException();
  }

  /// <summary>
  /// Find pet by ID.
  /// </summary>
  /// <remarks>Returns a single pet.</remarks>
  /// <param name="petId">The pet's id.</param>
  /// <response code="200">Successful retrieval of a pet.</response>
  /// <response code="404">Not Found</response>
  [HttpGet("{petId}")]
  [ProducesResponseType(StatusCodes.Status404NotFound)]
  [SwaggerErrorExample(StatusCodes.Status404NotFound, "Not Found", "Pet not found!")]
  [ProducesResponseType(StatusCodes.Status200OK)]
  [SwaggerResponseExample(StatusCodes.Status200OK, typeof(GetPetExample))]
  public ActionResult<Pet> GetPet([FromRoute][Required] Guid petId)
  {
    throw new NotImplementedException();
  }

  /// <summary>
  /// Deletes a pet.
  /// </summary>
  /// <remarks>Deletes a pet by ID.</remarks>
  /// <param name="petId">Pet ID to delete.</param>
  /// <response code="204">No Content</response>
  /// <response code="404">Not Found</response>
  [HttpDelete("{petId}")]
  [ProducesResponseType(StatusCodes.Status404NotFound)]
  [SwaggerErrorExample(StatusCodes.Status404NotFound, "Not Found", "Pet not found!")]
  [ProducesResponseType(StatusCodes.Status204NoContent)]
  public ActionResult DeletePet([FromRoute][Required] Guid petId)
  {
    throw new NotImplementedException();
  }
}