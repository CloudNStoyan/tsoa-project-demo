import { Controller, Path, Post, Route, Tags } from 'tsoa';

@Route('cats')
@Tags('Cat')
export class CatController extends Controller {
  @Post('add')
  postCat() {
    return 'add :)';
  }

  @Post('{catId}')
  postCatId(@Path() catId: string) {
    return catId;
  }
}
