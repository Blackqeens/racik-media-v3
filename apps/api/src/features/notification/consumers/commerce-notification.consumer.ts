/**
 * commerce-notification.consumer.ts — Consumer event domain Order, Payment, Escrow, Logistics
 *
 * Mendengarkan event commerce yang memerlukan notifikasi transaksional kritis.
 *
 * Event yang ditangani (dari event-map.md):
 *   - order.created         → whatsapp + push: order_created_buyer
 *   - order.cancelled       → push + email: order_cancelled
 *   - order.completed       → push: order_completed
 *   - payment.succeeded     → whatsapp + email: payment_succeeded / payment_receipt
 *   - order.escrow_locked   → push + whatsapp: escrow_locked
 *   - escrow.disputed       → email + push: escrow_disputed
 *   - logistics.manifested  → push: logistics_manifested
 *   - logistics.in_transit  → push: logistics_in_transit
 *   - logistics.delivered   → push + whatsapp: logistics_delivered
 *
 * Ref: event-map.md §B, notification-architecture.md §A
 */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '../../../core/events/event-bus.service';
import { DomainEvent } from '../../../core/events/domain-event.interface';
import { NotificationService } from '../services/notification.service';

interface OrderCreatedPayload {
  orderId: string;
  buyerId: string;
  sellerId: string;
  orderType: string;
}

interface OrderCancelledPayload {
  orderId: string;
  buyerId: string;
  reasonCode: string;
}

interface OrderCompletedPayload {
  orderId: string;
  buyerId: string;
  completedAt: string;
}

interface PaymentSucceededPayload {
  paymentId: string;
  orderId: string;
  buyerId: string;
  transactionRef: string;
  amount: number;
}

interface EscrowLockedPayload {
  escrowContractId: string;
  orderId: string;
  lockedAt: string;
}

interface EscrowDisputedPayload {
  escrowContractId: string;
  orderId: string;
  disputeId: string;
  reasonCode: string;
}

interface LogisticsStatusPayload {
  orderId: string;
  trackingRecordId: string;
  carrier?: string;
  occurredAt?: string;
  deliveredAt?: string;
}

@Injectable()
export class CommerceNotificationConsumer implements OnModuleInit {
  private readonly logger = new Logger(CommerceNotificationConsumer.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly notificationService: NotificationService,
  ) {}

  async onModuleInit(): Promise<void> {
    await Promise.all([
      this.subscribeOrderCreated(),
      this.subscribeOrderCancelled(),
      this.subscribeOrderCompleted(),
      this.subscribePaymentSucceeded(),
      this.subscribeEscrowLocked(),
      this.subscribeEscrowDisputed(),
      this.subscribeLogisticsManifested(),
      this.subscribeLogisticsInTransit(),
      this.subscribeLogisticsDelivered(),
    ]);
  }

  private async subscribeOrderCreated(): Promise<void> {
    await this.eventBus.subscribe<OrderCreatedPayload>(
      'notification.queue.order-created',
      'order.created',
      async (event: DomainEvent<OrderCreatedPayload>) => {
        this.logger.debug(`Handling order.created [${event.event_id}]`);
        await this.notificationService.dispatchFromEvent(
          'order.created',
          event.payload.buyerId,
          { order_id: event.payload.orderId, order_type: event.payload.orderType },
          event.event_id,
        );
      },
    );
  }

  private async subscribeOrderCancelled(): Promise<void> {
    await this.eventBus.subscribe<OrderCancelledPayload>(
      'notification.queue.order-cancelled',
      'order.cancelled',
      async (event: DomainEvent<OrderCancelledPayload>) => {
        this.logger.debug(`Handling order.cancelled [${event.event_id}]`);
        await this.notificationService.dispatchFromEvent(
          'order.cancelled',
          event.payload.buyerId,
          { order_id: event.payload.orderId, reason: event.payload.reasonCode },
          event.event_id,
        );
      },
    );
  }

  private async subscribeOrderCompleted(): Promise<void> {
    await this.eventBus.subscribe<OrderCompletedPayload>(
      'notification.queue.order-completed',
      'order.completed',
      async (event: DomainEvent<OrderCompletedPayload>) => {
        this.logger.debug(`Handling order.completed [${event.event_id}]`);
        await this.notificationService.dispatchFromEvent(
          'order.completed',
          event.payload.buyerId,
          { order_id: event.payload.orderId, completed_at: event.payload.completedAt },
          event.event_id,
        );
      },
    );
  }

  private async subscribePaymentSucceeded(): Promise<void> {
    await this.eventBus.subscribe<PaymentSucceededPayload>(
      'notification.queue.payment-succeeded',
      'payment.succeeded',
      async (event: DomainEvent<PaymentSucceededPayload>) => {
        this.logger.debug(`Handling payment.succeeded [${event.event_id}]`);
        await this.notificationService.dispatchFromEvent(
          'payment.succeeded',
          event.payload.buyerId,
          {
            order_id: event.payload.orderId,
            transaction_ref: event.payload.transactionRef,
            amount: String(event.payload.amount),
          },
          event.event_id,
        );
      },
    );
  }

  private async subscribeEscrowLocked(): Promise<void> {
    await this.eventBus.subscribe<EscrowLockedPayload>(
      'notification.queue.order-escrow-locked',
      'order.escrow_locked',
      async (event: DomainEvent<EscrowLockedPayload>) => {
        this.logger.debug(`Handling order.escrow_locked [${event.event_id}]`);
        await this.notificationService.dispatchFromEvent(
          'order.escrow_locked',
          event.payload.orderId,
          { order_id: event.payload.orderId, locked_at: event.payload.lockedAt },
          event.event_id,
        );
      },
    );
  }

  private async subscribeEscrowDisputed(): Promise<void> {
    await this.eventBus.subscribe<EscrowDisputedPayload>(
      'notification.queue.escrow-disputed',
      'escrow.disputed',
      async (event: DomainEvent<EscrowDisputedPayload>) => {
        this.logger.debug(`Handling escrow.disputed [${event.event_id}]`);
        await this.notificationService.dispatchFromEvent(
          'escrow.disputed',
          event.payload.orderId,
          {
            order_id: event.payload.orderId,
            dispute_id: event.payload.disputeId,
            reason: event.payload.reasonCode,
          },
          event.event_id,
        );
      },
    );
  }

  private async subscribeLogisticsManifested(): Promise<void> {
    await this.eventBus.subscribe<LogisticsStatusPayload>(
      'notification.queue.logistics-manifested',
      'logistics.manifested',
      async (event: DomainEvent<LogisticsStatusPayload>) => {
        this.logger.debug(`Handling logistics.manifested [${event.event_id}]`);
        await this.notificationService.dispatchFromEvent(
          'logistics.manifested',
          event.payload.orderId,
          { order_id: event.payload.orderId, carrier: event.payload.carrier ?? '' },
          event.event_id,
        );
      },
    );
  }

  private async subscribeLogisticsInTransit(): Promise<void> {
    await this.eventBus.subscribe<LogisticsStatusPayload>(
      'notification.queue.logistics-in-transit',
      'logistics.in_transit',
      async (event: DomainEvent<LogisticsStatusPayload>) => {
        this.logger.debug(`Handling logistics.in_transit [${event.event_id}]`);
        await this.notificationService.dispatchFromEvent(
          'logistics.in_transit',
          event.payload.orderId,
          {
            order_id: event.payload.orderId,
            occurred_at: event.payload.occurredAt ?? '',
          },
          event.event_id,
        );
      },
    );
  }

  private async subscribeLogisticsDelivered(): Promise<void> {
    await this.eventBus.subscribe<LogisticsStatusPayload>(
      'notification.queue.logistics-delivered',
      'logistics.delivered',
      async (event: DomainEvent<LogisticsStatusPayload>) => {
        this.logger.debug(`Handling logistics.delivered [${event.event_id}]`);
        await this.notificationService.dispatchFromEvent(
          'logistics.delivered',
          event.payload.orderId,
          {
            order_id: event.payload.orderId,
            delivered_at: event.payload.deliveredAt ?? '',
          },
          event.event_id,
        );
      },
    );
  }
}
