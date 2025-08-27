import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('search')
@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search documents' })
  @ApiResponse({ status: 200, description: 'Search results' })
  async search(@Query('q') query: string, @Query('org_id') orgId: string) {
    return this.searchService.search(query, orgId);
  }

  @Get('filters')
  @ApiOperation({ summary: 'Search documents by filters' })
  @ApiResponse({ status: 200, description: 'Filtered results' })
  async searchByFilters(@Query() filters: any, @Query('org_id') orgId: string) {
    return this.searchService.searchByFilters(filters, orgId);
  }
}
