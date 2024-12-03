using System.ComponentModel.DataAnnotations;
using AspNetServer.Demos.GeneratedModels;
using AspNetServer.SwashbuckleFilters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AspNetServer.Demos.GeneratedControllers;

[Authorize]
[ApiController]
[Route("[controller]")]
[SwaggerErrorExample(StatusCodes.Status401Unauthorized, "Unauthorized", "Access denied!")]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
[NonController]
public class StoreController : ControllerBase {

  /// <summary>
  /// Returns pet inventories by adoption status.
  /// </summary>
  /// <remarks>Returns a map of adoption status to quantities.</remarks>
  /// <response code="200">Successful retrieval of inventory.</response>
  [ProducesResponseType(StatusCodes.Status200OK)]
  [HttpGet("inventory")]
  public ActionResult<InventoryMap> GetInventory() {
    throw new NotImplementedException();
  }

  /// <summary>
  /// Request an adoption of a pet.
  /// </summary>
  /// <remarks>Place an adoption request for a pet.</remarks>
  /// <response code="200">Successful creation of adoption request.</response>
  /// <param name="adoptionRequest">The adoption request.</param>
  [ProducesResponseType(StatusCodes.Status200OK)]
  [HttpPost("adopt")]
  public ActionResult<AdoptionRequest> AdoptPet([Required][FromBody] AdoptionRequest adoptionRequest) {
    throw new NotImplementedException();
  }

  /// <summary>
  /// Find adoption request by ID.
  /// </summary>
  /// <param name="requestId">The adoption request's ID.</param>
  /// <remarks>Find adoption request by ID.</remarks>
  /// <response code="200">Successful retrieval of adoption request.</response>
  [ProducesResponseType(StatusCodes.Status200OK)]
  [ProducesResponseType(StatusCodes.Status404NotFound)]
  [SwaggerErrorExample(StatusCodes.Status404NotFound, "Not Found", "Adoption request not found!")]
  [HttpGet("adopt/{requestId}")]
  public ActionResult<AdoptionRequest> GetAdoptRequestById(Guid requestId) {
    throw new NotImplementedException();
  }

  /// <summary>
  /// Delete adoption request by ID.
  /// </summary>
  /// <param name="requestId">The adoption request's ID.</param>
  /// <remarks>Delete adoption request by ID.</remarks>
  [HttpDelete("adopt/{requestId}")]
  [ProducesResponseType(StatusCodes.Status204NoContent)]
  [ProducesResponseType(StatusCodes.Status404NotFound)]
  [SwaggerErrorExample(StatusCodes.Status404NotFound, "Not Found", "Adoption request not found!")]
  public ActionResult DeleteAdoptRequestById(Guid requestId) {
    throw new NotImplementedException();
  }
}
