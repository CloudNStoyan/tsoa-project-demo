using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Swashbuckle.AspNetCore.Filters;
using AspNetServer.SwashbuckleFilters;
using AspNetServer.Generated.Models;
using AspNetServer.Generated.Examples;

namespace AspNetServer.Generated.Controllers;

[Authorize]
[ApiController]
[Route("[controller]")]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
[SwaggerErrorExample(StatusCodes.Status401Unauthorized, "Unauthorized", "Access denied!")]
public class StoreController : ControllerBase
{
  /// <summary>
  /// Returns pet inventories by adoption status.
  /// </summary>
  /// <remarks>Returns a map of adoption status to quantities.</remarks>
  /// <response code="200">Successful retrieval of inventory.</response>
  /// <response code="401">Unauthorized</response>
  [HttpGet("inventory")]
  [ProducesResponseType(StatusCodes.Status200OK)]
  public ActionResult<InventoryMap> GetInventory()
  {
    throw new NotImplementedException();
  }

  /// <summary>
  /// Request an adoption of a pet.
  /// </summary>
  /// <remarks>Place an adoption request for a pet.</remarks>
  /// <param name="adoptionRequest">The adoption request.</param>
  /// <response code="200">Successful creation of adoption request.</response>
  /// <response code="401">Unauthorized</response>
  [HttpPost("adopt")]
  [ProducesResponseType(StatusCodes.Status200OK)]
  [SwaggerResponseExample(StatusCodes.Status200OK, typeof(AdoptionRequestExample))]
  public ActionResult<AdoptionRequest> AdoptPet([FromBody][Required] AdoptionRequest adoptionRequest)
  {
    throw new NotImplementedException();
  }

  /// <summary>
  /// Find adoption request by ID.
  /// </summary>
  /// <remarks>Find adoption request by ID.</remarks>
  /// <param name="requestId">The adoption request's ID.</param>
  /// <response code="200">Successful retrieval of adoption request.</response>
  /// <response code="401">Unauthorized</response>
  /// <response code="404">Not Found</response>
  [HttpGet("adopt/{requestId}")]
  [ProducesResponseType(StatusCodes.Status404NotFound)]
  [SwaggerErrorExample(StatusCodes.Status404NotFound, "Not Found", "Adoption request not found!")]
  [ProducesResponseType(StatusCodes.Status200OK)]
  [SwaggerResponseExample(StatusCodes.Status200OK, typeof(AdoptionRequestExample))]
  public ActionResult<AdoptionRequest> GetAdoptRequestById([FromRoute][Required] Guid requestId)
  {
    throw new NotImplementedException();
  }

  /// <summary>
  /// Delete adoption request by ID.
  /// </summary>
  /// <remarks>Delete adoption request by ID.</remarks>
  /// <param name="requestId">The adoption request's ID.</param>
  /// <response code="204">No Content</response>
  /// <response code="401">Unauthorized</response>
  /// <response code="404">Not Found</response>
  [HttpDelete("adopt/{requestId}")]
  [ProducesResponseType(StatusCodes.Status404NotFound)]
  [SwaggerErrorExample(StatusCodes.Status404NotFound, "Not Found", "Adoption request not found!")]
  [ProducesResponseType(StatusCodes.Status204NoContent)]
  public ActionResult DeleteAdoptRequestById([FromRoute][Required] Guid requestId)
  {
    throw new NotImplementedException();
  }
}