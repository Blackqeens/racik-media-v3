/**
 * event-bus.module.ts — EventBus Core Module
 *
 * Global module: EventBusService tersedia di seluruh aplikasi.
 * Digunakan oleh semua domain untuk publish dan subscribe event.
 */
import { Global, Module } from '@nestjs/common';
import { EventBusService } from './event-bus.service';

@Global()
@Module({
  providers: [EventBusService],
  exports: [EventBusService],
})
export class EventBusModule {}
