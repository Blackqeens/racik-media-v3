/**
 * content.module.ts — Content Domain Module
 * Ref: domain-map.md §2.2, content-lifecycle.md
 */
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../core/database/database.module';
import { EventBusModule } from '../../core/events/event-bus.module';
import { ContentController } from './controllers/content.controller';
import { ContentService } from './services/content.service';
import { ContentRepository } from './repositories/content.repository';

@Module({
  imports: [DatabaseModule, EventBusModule],
  controllers: [ContentController],
  providers: [ContentService, ContentRepository],
  exports: [ContentService],
})
export class ContentModule {}
