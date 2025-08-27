import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AudioService } from './audio.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('audio')
@Controller('audio')
@UseGuards(JwtAuthGuard)
export class AudioController {
  constructor(private audioService: AudioService) {}

  @Post()
  @ApiOperation({ summary: 'Create audio blob' })
  @ApiResponse({ status: 201, description: 'Audio blob created' })
  async create(@Body() createAudioBlobDto: any) {
    return this.audioService.create(createAudioBlobDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all audio blobs' })
  @ApiResponse({ status: 200, description: 'Audio blobs retrieved' })
  async findAll() {
    // TODO: Get org_id from user context
    return this.audioService.findAll('org-id');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get audio blob by id' })
  @ApiResponse({ status: 200, description: 'Audio blob retrieved' })
  async findOne(@Param('id') id: string) {
    return this.audioService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update audio blob' })
  @ApiResponse({ status: 200, description: 'Audio blob updated' })
  async update(@Param('id') id: string, @Body() updateAudioBlobDto: any) {
    return this.audioService.update(id, updateAudioBlobDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete audio blob' })
  @ApiResponse({ status: 200, description: 'Audio blob deleted' })
  async remove(@Param('id') id: string) {
    return this.audioService.remove(id);
  }
}
