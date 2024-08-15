import { Controller, Path, Post, Route, Tags } from 'tsoa';

/**
 * Cat operations.
 */
@Route('cats')
@Tags('Cat')
export class CatController extends Controller {
  /**
   * Demonstrative cat endpoint that returns static data.
   * @returns "add :)".
   * @summary Retrieve "add :)" from the server.
   */
  @Post('add')
  postCat() {
    return 'add :)';
  }

  /**
   * Demonstrative cat endpoint that returns dynamic data.
   * @param catId The identification of a cat.
   * @returns     The given catId.
   * @summary     Retrieve catId from the server.
   */
  @Post('{catId}')
  postCatId(@Path() catId: string) {
    return catId;
  }
}
