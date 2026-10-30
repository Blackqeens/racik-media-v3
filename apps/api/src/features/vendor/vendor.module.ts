import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VendorService } from './services/vendor.service';
import { VendorController } from './controllers/vendor.controller';

@Module({
  imports: [ConfigModule],
  providers: [VendorService],
  controllers: [VendorController],
  exports: [VendorService],
})
export class VendorModule {}
