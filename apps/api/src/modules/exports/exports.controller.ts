import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ExportsService } from './exports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('exports')
@Controller('exports')
@UseGuards(JwtAuthGuard)
export class ExportsController {
  constructor(private exportsService: ExportsService) {}

  @Post()
  @ApiOperation({ summary: 'Create export' })
  @ApiResponse({ status: 201, description: 'Export created' })
  async create(@Body() createExportDto: any) {
    return this.exportsService.create(createExportDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all exports' })
  @ApiResponse({ status: 200, description: 'Exports retrieved' })
  async findAll() {
    return this.exportsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get export by id' })
  @ApiResponse({ status: 200, description: 'Export retrieved' })
  async findOne(@Param('id') id: string) {
    return this.exportsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update export' })
  @ApiResponse({ status: 200, description: 'Export updated' })
  async update(@Param('id') id: string, @Body() updateExportDto: any) {
    return this.exportsService.update(id, updateExportDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete export' })
  @ApiResponse({ status: 200, description: 'Export deleted' })
  async remove(@Param('id') id: string) {
    return this.exportsService.remove(id);
  }
}
