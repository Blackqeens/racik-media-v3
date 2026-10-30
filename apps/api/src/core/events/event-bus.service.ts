/**
 * event-bus.service.ts — RabbitMQ Event Publisher & Consumer Helper
 *
 * Publisher: Kirim event ke RabbitMQ exchange 'racik.events' (topic exchange)
 * Routing key: nama event (contoh: 'identity.user_registered')
 *
 * Consumer: Setiap domain punya queue sendiri di features/{domain}/consumers/
 * Consumer WAJIB idempoten — cek event_id sebelum proses (simpan di Redis/DB)
 *
 * Ref: event-map.md, ADR-001 D3, ADR-001 D6 (idempoten)
 */
import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { connect, Channel, ConsumeMessage } from "amqplib";
import { randomUUID } from "crypto";
import { DomainEvent, CreateEventPayload } from "./domain-event.interface";

/** Nama exchange utama — semua event dikirim ke sini */
const EXCHANGE_NAME = "racik.events";

/** Dead Letter Exchange untuk event yang gagal diproses */
const DLX_NAME = "racik.dlx";

@Injectable()
export class EventBusService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventBusService.name);
  // typed as `any` because amqplib's Connection typings omit createChannel/close
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private connection: any = null;
  private channel: Channel | null = null;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  // ─── Koneksi & Setup ──────────────────────────────────────────────────────

  private async connect(): Promise<void> {
    const url = this.config.getOrThrow<string>("RABBITMQ_URL");

    try {
      this.connection = await connect(url);

      if (!this.connection) {
        throw new Error("RabbitMQ connection instance is undefined.");
      }
      this.channel = await this.connection.createChannel();

      if (!this.channel) {
        throw new Error("Failed to create RabbitMQ channel.");
      }
      // Pastikan exchange ada — type 'topic' agar bisa filter by routing key pattern
      await this.channel.assertExchange(EXCHANGE_NAME, "topic", {
        durable: true, // bertahan restart broker
      });

      // Pastikan DLX ada untuk menangkap event yang gagal
      await this.channel.assertExchange(DLX_NAME, "fanout", { durable: true });

      this.logger.log("✅ EventBus (RabbitMQ) terhubung");
    } catch (err) {
      this.logger.warn(
        "⚠️ RabbitMQ tidak dapat diakses saat ini. Event bus berjalan dalam mode fallback / offline.",
      );
    }
  }

  private async disconnect(): Promise<void> {
    try {
      await this.channel?.close();
      await this.connection?.close();
      this.logger.log("EventBus: koneksi ditutup");
    } catch {
      // Abaikan error saat shutdown
    }
  }

  // ─── Publisher ────────────────────────────────────────────────────────────

  /**
   * Publish event domain ke RabbitMQ.
   *
   * Contoh penggunaan:
   *   await this.eventBus.publish({
   *     event_name: 'identity.user_registered',
   *     tenant_id: user.tenant_id,
   *     schema_version: 1,
   *     payload: { user_id: user.id, email: user.email },
   *   });
   */
  async publish<T>(eventData: CreateEventPayload<T>): Promise<void> {
    if (!this.channel) {
      this.logger.warn(
        `EventBus: channel belum siap, event [${eventData.event_name}] dilewati (offline mode).`,
      );
      return;
    }

    const event: DomainEvent<T> = {
      ...eventData,
      event_id: randomUUID(),
      occurred_at: new Date().toISOString(),
    };

    const message = Buffer.from(JSON.stringify(event));

    this.channel.publish(EXCHANGE_NAME, event.event_name, message, {
      persistent: true, // simpan ke disk, tidak hilang jika broker restart
      contentType: "application/json",
      messageId: event.event_id, // untuk idempoten check di consumer
      timestamp: Date.now(),
    });

    this.logger.debug(
      `📤 Event published: ${event.event_name} [${event.event_id}]`,
    );
  }

  // ─── Consumer Helper ──────────────────────────────────────────────────────

  /**
   * Subscribe ke event tertentu dengan membuat queue khusus domain.
   *
   * Contoh:
   *   await this.eventBus.subscribe(
   *     'reputation.queue.content-published',  // nama queue unik domain
   *     'content.published',                   // routing key (dari event-map.md)
   *     async (event) => { ... },
   *   );
   *
   * Consumer WAJIB idempoten — selalu cek event_id sudah diproses sebelumnya.
   */
  async subscribe<T>(
    queueName: string,
    routingKey: string,
    handler: (event: DomainEvent<T>) => Promise<void>,
  ): Promise<void> {
    if (!this.channel) {
      this.logger.warn(
        `EventBus: channel belum siap, subscribe [${queueName} -> ${routingKey}] dilewati (offline mode).`,
      );
      return;
    }

    // Buat queue dengan dead letter exchange untuk pesan gagal
    await this.channel.assertQueue(queueName, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": DLX_NAME,
      },
    });

    // Bind queue ke exchange dengan routing key
    await this.channel.bindQueue(queueName, EXCHANGE_NAME, routingKey);

    // Prefetch 1 → proses 1 pesan sekaligus (tidak overwhelm consumer)
    await this.channel.prefetch(1);

    await this.channel.consume(
      queueName,
      async (msg: ConsumeMessage | null) => {
        if (!msg) return;

        try {
          const event: DomainEvent<T> = JSON.parse(msg.content.toString());
          await handler(event);
          this.channel!.ack(msg); // konfirmasi berhasil diproses
        } catch (err) {
          this.logger.error(`❌ Error proses event di queue ${queueName}`, err);
          // nack + jangan requeue → kirim ke DLX untuk investigasi
          this.channel!.nack(msg, false, false);
        }
      },
    );

    this.logger.log(`👂 Subscribed: queue=${queueName} key=${routingKey}`);
  }
}
