/**
 * index.ts — Barrel Export Notification Domain
 *
 * Hanya mengekspos public API domain ini.
 * Domain lain TIDAK boleh mengimpor dari dalam folder (services/, adapters/, consumers/).
 * Import hanya melalui file ini.
 *
 * Ref: coding-standards.md, module-dependency.md §Cross-Domain Boundary
 */
export { NotificationModule } from './notification.module';
export { NotificationService } from './services/notification.service';
export type { SendNotificationDto, NotificationChannel, NotificationPriority } from './dto/send-notification.dto';
