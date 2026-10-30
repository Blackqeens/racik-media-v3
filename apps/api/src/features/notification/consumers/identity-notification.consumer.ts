/**
 * identity-notification.consumer.ts — Consumer event domain Identity
 *
 * Mendengarkan event dari Identity domain yang memerlukan notifikasi.
 * Queue terpisah per event type agar retry tidak saling mempengaruhi.
 *
 * Event yang ditangani (dari event-map.md):
 *   - identity.role_activated      → push: role_activated
 *   - identity.password_changed    → whatsapp + email: password_changed_alert
 *   - identity.verification_decision_recorded → push + email: verification_decision
 *
 * Ref: event-map.md §B, notification-architecture.md §A
 */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '../../../core/events/event-bus.service';
import { DomainEvent } from '../../../core/events/domain-event.interface';
import { NotificationService } from '../services/notification.service';

/** Payload identity.role_activated */
interface RoleActivatedPayload {
  userId: string;
  role: string;
  verificationId: string;
}

/** Payload identity.password_changed */
interface PasswordChangedPayload {
  userId: string;
  occurredAt: string;
}

/** Payload identity.verification_decision_recorded */
interface VerificationDecisionPayload {
  userId: string;
  verificationId: string;
  verificationType: string;
  decision: string;
}

@Injectable()
export class IdentityNotificationConsumer implements OnModuleInit {
  private readonly logger = new Logger(IdentityNotificationConsumer.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly notificationService: NotificationService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.subscribeRoleActivated();
    await this.subscribePasswordChanged();
    await this.subscribeVerificationDecision();
  }

  private async subscribeRoleActivated(): Promise<void> {
    await this.eventBus.subscribe<RoleActivatedPayload>(
      'notification.queue.identity-role-activated',
      'identity.role_activated',
      async (event: DomainEvent<RoleActivatedPayload>) => {
        this.logger.debug(`Handling identity.role_activated [${event.event_id}]`);

        await this.notificationService.dispatchFromEvent(
          'identity.role_activated',
          event.payload.userId,
          { role: event.payload.role },
          event.event_id,
        );
      },
    );
  }

  private async subscribePasswordChanged(): Promise<void> {
    await this.eventBus.subscribe<PasswordChangedPayload>(
      'notification.queue.identity-password-changed',
      'identity.password_changed',
      async (event: DomainEvent<PasswordChangedPayload>) => {
        this.logger.debug(`Handling identity.password_changed [${event.event_id}]`);

        await this.notificationService.dispatchFromEvent(
          'identity.password_changed',
          event.payload.userId,
          { occurred_at: event.payload.occurredAt },
          event.event_id,
        );
      },
    );
  }

  private async subscribeVerificationDecision(): Promise<void> {
    await this.eventBus.subscribe<VerificationDecisionPayload>(
      'notification.queue.identity-verification-decision',
      'identity.verification_decision_recorded',
      async (event: DomainEvent<VerificationDecisionPayload>) => {
        this.logger.debug(
          `Handling identity.verification_decision_recorded [${event.event_id}]`,
        );

        await this.notificationService.dispatchFromEvent(
          'identity.verification_decision_recorded',
          event.payload.userId,
          {
            verification_type: event.payload.verificationType,
            decision: event.payload.decision,
          },
          event.event_id,
        );
      },
    );
  }
}
