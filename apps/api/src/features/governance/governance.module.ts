import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../core/database/database.module';
import { EventBusModule } from '../../core/events/event-bus.module';
import { GovernanceService } from './services/governance.service';
import { GovernanceRepository } from './repositories/governance.repository';

@Module({
  imports: [DatabaseModule, EventBusModule],
  providers: [GovernanceService, GovernanceRepository],
  exports: [GovernanceService],
})
export class GovernanceModule {}
