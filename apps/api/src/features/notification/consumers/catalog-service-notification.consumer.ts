/**
 * catalog-service-notification.consumer.ts — Consumer event Marketplace, Service, Security
 *
 * Mendengarkan event catalog, service, dan security yang memerlukan notifikasi.
 *
 * Event yang ditangani (dari event-map.md):
 *   - catalog.approved          → push + whatsapp: catalog_approved
 *   - catalog.anomaly_detected  → whatsapp: catalog_anomaly_alert (high priority)
 *   - service.approved          → push: service_approved
 *   - security.incident_critical → whatsapp + email: security_incident_alert (high priority)
 *   - membership.plan_changed   → email: membership_plan_changed
 *
 * Ref: event-map.md §B, notification-architecture.md §A
 */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '../../../core/events/event-bus.service';
import { DomainEvent } from '../../../core/events/domain-event.interface';
import { NotificationService } from '../services/notification.service';

interface CatalogApprovedPayload {
  catalogItemId: string;
  vendorId: string;
  approvedAt: string;
}

interface CatalogAnomalyPayload {
  catalogItemId: string;
  vendorId: string;
  anomalyId: string;
  severity: string;
}

interface ServiceApprovedPayload {
  serviceId: string;
  providerId: string;
  approvedAt: string;
}

interface SecurityIncidentPayload {
  incidentId: string;
  userId: string;
  reasonCode: string;
}

interface ContentPublishedPayload {
  contentId: string;
  authorId: string;
  publishedAt: string;
}

interface MembershipPlanChangedPayload {
  userId: string;
  planId: string;
  occurredAt: string;
}

@Injectable()
export class CatalogServiceNotificationConsumer implements OnModuleInit {
  private readonly logger = new Logger(CatalogServiceNotificationConsumer.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly notificationService: NotificationService,
  ) {}

  async onModuleInit(): Promise<void> {
    await Promise.all([
      this.subscribeCatalogApproved(),
      this.subscribeCatalogAnomalyDetected(),
      this.subscribeServiceApproved(),
      this.subscribeSecurityIncidentCritical(),
      this.subscribeMembershipPlanChanged(),
      this.subscribeContentPublished(),
    ]);
  }

  private async subscribeCatalogApproved(): Promise<void> {
    await this.eventBus.subscribe<CatalogApprovedPayload>(
      'notification.queue.catalog-approved',
      'catalog.approved',
      async (event: DomainEvent<CatalogApprovedPayload>) => {
        this.logger.debug(`Handling catalog.approved [${event.event_id}]`);
        await this.notificationService.dispatchFromEvent(
          'catalog.approved',
          event.payload.vendorId,
          {
            catalog_item_id: event.payload.catalogItemId,
            approved_at: event.payload.approvedAt,
          },
          event.event_id,
        );
      },
    );
  }

  private async subscribeCatalogAnomalyDetected(): Promise<void> {
    await this.eventBus.subscribe<CatalogAnomalyPayload>(
      'notification.queue.catalog-anomaly-detected',
      'catalog.anomaly_detected',
      async (event: DomainEvent<CatalogAnomalyPayload>) => {
        this.logger.debug(`Handling catalog.anomaly_detected [${event.event_id}]`);
        await this.notificationService.dispatchFromEvent(
          'catalog.anomaly_detected',
          event.payload.vendorId,
          {
            catalog_item_id: event.payload.catalogItemId,
            anomaly_id: event.payload.anomalyId,
            severity: event.payload.severity,
          },
          event.event_id,
        );
      },
    );
  }

  private async subscribeServiceApproved(): Promise<void> {
    await this.eventBus.subscribe<ServiceApprovedPayload>(
      'notification.queue.service-approved',
      'service.approved',
      async (event: DomainEvent<ServiceApprovedPayload>) => {
        this.logger.debug(`Handling service.approved [${event.event_id}]`);
        await this.notificationService.dispatchFromEvent(
          'service.approved',
          event.payload.providerId,
          {
            service_id: event.payload.serviceId,
            approved_at: event.payload.approvedAt,
          },
          event.event_id,
        );
      },
    );
  }

  private async subscribeSecurityIncidentCritical(): Promise<void> {
    await this.eventBus.subscribe<SecurityIncidentPayload>(
      'notification.queue.security-incident-critical',
      'security.incident_critical',
      async (event: DomainEvent<SecurityIncidentPayload>) => {
        this.logger.debug(`Handling security.incident_critical [${event.event_id}]`);
        await this.notificationService.dispatchFromEvent(
          'security.incident_critical',
          event.payload.userId,
          {
            incident_id: event.payload.incidentId,
            reason: event.payload.reasonCode,
          },
          event.event_id,
        );
      },
    );
  }

  private async subscribeContentPublished(): Promise<void> {
    await this.eventBus.subscribe<ContentPublishedPayload>(
      'notification.queue.content-published',
      'content.published',
      async (event: DomainEvent<ContentPublishedPayload>) => {
        this.logger.debug(`Handling content.published [${event.event_id}]`);
        await this.notificationService.dispatchFromEvent(
          'content.published',
          event.payload.authorId,
          { content_id: event.payload.contentId, published_at: event.payload.publishedAt },
          event.event_id,
        );
      },
    );
  }

  private async subscribeMembershipPlanChanged(): Promise<void> {
    await this.eventBus.subscribe<MembershipPlanChangedPayload>(
      'notification.queue.membership-plan-changed',
      'membership.plan_changed',
      async (event: DomainEvent<MembershipPlanChangedPayload>) => {
        this.logger.debug(`Handling membership.plan_changed [${event.event_id}]`);
        await this.notificationService.dispatchFromEvent(
          'membership.plan_changed',
          event.payload.userId,
          {
            plan_id: event.payload.planId,
            occurred_at: event.payload.occurredAt,
          },
          event.event_id,
        );
      },
    );
  }
}
