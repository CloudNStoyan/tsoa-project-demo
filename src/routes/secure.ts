import { Controller, Get, Route, Security, Tags } from "tsoa";

@Tags("Secure")
@Route("secure")
export class SecureController extends Controller {
  @Security("api_key", ["cat", "dog"])
  @Get()
  getTreasure(): Promise<string> {
    return Promise.resolve("One Piece");
  }
}
