import { Controller, Get } from '@nestjs/common';
import { CareersService } from './careers.service';

/** Public: powers the pre-login /explore marketing page as well as the app. */
@Controller('careers')
export class CareersController {
  constructor(private readonly careersService: CareersService) {}

  @Get()
  list() {
    return this.careersService.list();
  }
}
