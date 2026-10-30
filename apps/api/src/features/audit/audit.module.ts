import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../core/database/database.module';
import { EventBusModule } from '../../core/events/event-bus.module';
import { AuditWriterService } from './services/audit-writer.service';
import { IdentityAuditConsumer } from './consumers/identity-audit.consumer';
import { FinancialAuditConsumer } from './consumers/financial-audit.consumer';
import { ModerationAuditConsumer } from './consumers/moderation-audit.consumer';
import { SecurityAuditConsumer } from './consumers/security-audit.consumer';

@Module({
  imports: [DatabaseModule, EventBusModule],
  providers: [AuditWriterService, IdentityAuditConsumer, FinancialAuditConsumer, ModerationAuditConsumer, SecurityAuditConsumer],
  exports: [AuditWriterService],
})
export class AuditModule {}
