import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../core/database/database.module';
import { EventBusModule } from '../../core/events/event-bus.module';
import { ServiceMarketplaceController } from './controllers/service-marketplace.controller';
import { ServiceListingService } from './services/service-listing.service';
import { MilestoneService } from './services/milestone.service';

@Module({
  imports: [DatabaseModule, EventBusModule],
  controllers: [ServiceMarketplaceController],
  providers: [ServiceListingService, MilestoneService],
  exports: [ServiceListingService, MilestoneService],
})
export class ServiceMarketplaceModule {}
