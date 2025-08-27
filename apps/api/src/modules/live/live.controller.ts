import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LiveService } from './live.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('live')
@Controller('live')
@UseGuards(JwtAuthGuard)
export class LiveController {
  constructor(private liveService: LiveService) {}

  @Post('session')
  @ApiOperation({ summary: 'Create live session' })
  @ApiResponse({ status: 201, description: 'Session created' })
  async createSession(@Body() body: { documentId: string }, @Request() req) {
    return this.liveService.createSession(body.documentId, req.user.id);
  }

  @Get('ice-servers')
  @ApiOperation({ summary: 'Get ICE servers for WebRTC' })
  @ApiResponse({ status: 200, description: 'ICE servers retrieved' })
  async getIceServers() {
    return this.liveService.getIceServers();
  }
}
