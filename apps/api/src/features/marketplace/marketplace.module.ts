/**
 * marketplace.module.ts — Marketplace Domain Module
 * Ref: domain-map.md §2.3, marketplace-lifecycle.md
 */
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../core/database/database.module';
import { EventBusModule } from '../../core/events/event-bus.module';
import { MarketplaceController } from './controllers/marketplace.controller';
import { CatalogService } from './services/catalog.service';
import { PriceAnomalyService } from './services/price-anomaly.service';
import { CatalogRepository } from './repositories/catalog.repository';

@Module({
  imports: [DatabaseModule, EventBusModule],
  controllers: [MarketplaceController],
  providers: [CatalogService, PriceAnomalyService, CatalogRepository],
  exports: [CatalogService, PriceAnomalyService],
})
export class MarketplaceModule {}
