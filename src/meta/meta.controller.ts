import { Controller, Get, Header } from '@nestjs/common';
import { MetaService } from './meta.service';

@Controller('_meta')
export class MetaController {
  constructor(private readonly metaService: MetaService) {
  }

  @Get()
  @Header('content-type', 'text/plain')
  get() {
    return this.metaService.getMeta()
  }
}
