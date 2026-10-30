import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../core/database/database.module';
import { EventBusModule } from '../../core/events/event-bus.module';
import { IncidentService } from './services/incident.service';
import { SecurityRepository } from './repositories/security.repository';

@Module({
  imports: [DatabaseModule, EventBusModule],
  providers: [IncidentService, SecurityRepository],
  exports: [IncidentService],
})
export class SecurityModule {}
