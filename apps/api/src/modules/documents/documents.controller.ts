import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('documents')
@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create document' })
  @ApiResponse({ status: 201, description: 'Document created' })
  async create(@Body() createDocumentDto: any, @Request() req) {
    return this.documentsService.create({
      ...createDocumentDto,
      created_by: req.user.id,
      updated_by: req.user.id,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all documents' })
  @ApiResponse({ status: 200, description: 'Documents retrieved' })
  async findAll(@Request() req) {
    // TODO: Get org_id from user context
    return this.documentsService.findAll('org-id');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document by id' })
  @ApiResponse({ status: 200, description: 'Document retrieved' })
  async findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update document' })
  @ApiResponse({ status: 200, description: 'Document updated' })
  async update(@Param('id') id: string, @Body() updateDocumentDto: any, @Request() req) {
    return this.documentsService.update(id, {
      ...updateDocumentDto,
      updated_by: req.user.id,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete document' })
  @ApiResponse({ status: 200, description: 'Document deleted' })
  async remove(@Param('id') id: string) {
    return this.documentsService.remove(id);
  }
}
