import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { AudioModule } from './modules/audio/audio.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { ExportsModule } from './modules/exports/exports.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { SearchModule } from './modules/search/search.module';
import { WebSocketModule } from './modules/websocket/websocket.module';
import { LiveModule } from './modules/live/live.module';
import { DatabaseConfig } from './config/database.config';
import { Organization } from './modules/auth/organization.entity';
import { Membership } from './modules/auth/membership.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),
    TypeOrmModule.forFeature([
      Organization,
      Membership,
    ]),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    AuthModule,
    UsersModule,
    DocumentsModule,
    ProjectsModule,
    AudioModule,
    TemplatesModule,
    ExportsModule,
    IntegrationsModule,
    SearchModule,
    WebSocketModule,
    LiveModule,
  ],
})
export class AppModule {}
