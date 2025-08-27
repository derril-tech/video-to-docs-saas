import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LiveService {
  constructor(private jwtService: JwtService) {}

  async createSession(documentId: string, userId: string) {
    const sessionId = uuidv4();
    const token = this.jwtService.sign({
      sessionId,
      documentId,
      userId,
      type: 'live-session',
    });

    return {
      sessionId,
      token,
      documentId,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };
  }

  async validateSession(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch (error) {
      return null;
    }
  }

  async getIceServers() {
    // Return STUN/TURN servers for WebRTC
    return [
      {
        urls: 'stun:stun.l.google.com:19302',
      },
      {
        urls: 'stun:stun1.l.google.com:19302',
      },
    ];
  }
}
