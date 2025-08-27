import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IntegrationsService } from './integrations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('integrations')
@Controller('integrations')
@UseGuards(JwtAuthGuard)
export class IntegrationsController {
  constructor(private integrationsService: IntegrationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create integration' })
  @ApiResponse({ status: 201, description: 'Integration created' })
  async create(@Body() createIntegrationDto: any) {
    return this.integrationsService.create(createIntegrationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all integrations' })
  @ApiResponse({ status: 200, description: 'Integrations retrieved' })
  async findAll() {
    // TODO: Get org_id from user context
    return this.integrationsService.findAll('org-id');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get integration by id' })
  @ApiResponse({ status: 200, description: 'Integration retrieved' })
  async findOne(@Param('id') id: string) {
    return this.integrationsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update integration' })
  @ApiResponse({ status: 200, description: 'Integration updated' })
  async update(@Param('id') id: string, @Body() updateIntegrationDto: any) {
    return this.integrationsService.update(id, updateIntegrationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete integration' })
  @ApiResponse({ status: 200, description: 'Integration deleted' })
  async remove(@Param('id') id: string) {
    return this.integrationsService.remove(id);
  }
}
