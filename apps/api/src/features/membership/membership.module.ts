/**
 * membership.module.ts — Membership Domain Module
 * Ref: membership-architecture.md, module-dependency.md
 */
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../core/database/database.module';
import { EventBusModule } from '../../core/events/event-bus.module';
import { MembershipService } from './services/membership.service';
import { MembershipRepository } from './repositories/membership.repository';

@Module({
  imports: [DatabaseModule, EventBusModule],
  providers: [MembershipService, MembershipRepository],
  exports: [MembershipService],
})
export class MembershipModule {}
