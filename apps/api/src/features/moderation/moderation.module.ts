/**
 * moderation.module.ts — Moderation Domain Module
 */
import { Module } from '@nestjs/common';
import { AuthModule } from '../../core/auth/auth.module';
import { DatabaseModule } from '../../core/database/database.module';
import { EventBusModule } from '../../core/events/event-bus.module';
import { ModerationController } from './controllers/moderation.controller';
import { TicketService } from './services/ticket.service';
import { PanelService } from './services/panel.service';
import { ModerationRepository } from './repositories/moderation.repository';

@Module({
  imports: [AuthModule, DatabaseModule, EventBusModule],
  controllers: [ModerationController],
  providers: [TicketService, PanelService, ModerationRepository],
  exports: [TicketService, PanelService],
})
export class ModerationModule {}
