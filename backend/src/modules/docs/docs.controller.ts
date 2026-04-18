import { Controller, Get, Param, Query } from '@nestjs/common';
import { DocsService } from './docs.service';

@Controller('docs')
export class DocsController {
  constructor(private docsService: DocsService) {}

  @Get('*')
  async getDocContent(@Param('*') path: string) {
    return this.docsService.getDocContent(path);
  }

  @Get('tree')
  async getDocTree() {
    return this.docsService.getDocTree();
  }

  @Get('search')
  async searchDocs(@Query('q') query: string) {
    if (!query) {
      throw new Error('搜索关键词不能为空');
    }
    return this.docsService.searchDocs(query);
  }
}
