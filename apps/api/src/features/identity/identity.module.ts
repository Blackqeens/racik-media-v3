/**
 * identity.module.ts — Identity Domain Module
 * Ref: domain-map.md §2.1, module-dependency.md
 */
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../core/database/database.module';
import { EventBusModule } from '../../core/events/event-bus.module';
import { UserController } from './controllers/user.controller';
import { VerificationController } from './controllers/verification.controller';
import { AuthPagesController } from './controllers/auth-pages.controller';
import { UserService } from './services/user.service';
import { RoleService } from './services/role.service';
import { VerificationService } from './services/verification.service';
import { UserRepository } from './repositories/user.repository';
import { VerificationRepository } from './repositories/verification.repository';

@Module({
  imports: [DatabaseModule, EventBusModule],
  controllers: [UserController, VerificationController, AuthPagesController],
  providers: [UserService, RoleService, VerificationService, UserRepository, VerificationRepository],
  exports: [UserService, RoleService, VerificationService],
})
export class IdentityModule {}
