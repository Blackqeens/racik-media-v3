"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EventBusService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBusService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const amqplib_1 = require("amqplib");
const crypto_1 = require("crypto");
const EXCHANGE_NAME = "racik.events";
const DLX_NAME = "racik.dlx";
let EventBusService = EventBusService_1 = class EventBusService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(EventBusService_1.name);
        this.connection = null;
        this.channel = null;
    }
    async onModuleInit() {
        await this.connect();
    }
    async onModuleDestroy() {
        await this.disconnect();
    }
    async connect() {
        const url = this.config.getOrThrow("RABBITMQ_URL");
        try {
            this.connection = await (0, amqplib_1.connect)(url);
            if (!this.connection) {
                throw new Error("RabbitMQ connection instance is undefined.");
            }
            this.channel = await this.connection.createChannel();
            if (!this.channel) {
                throw new Error("Failed to create RabbitMQ channel.");
            }
            await this.channel.assertExchange(EXCHANGE_NAME, "topic", {
                durable: true,
            });
            await this.channel.assertExchange(DLX_NAME, "fanout", { durable: true });
            this.logger.log("✅ EventBus (RabbitMQ) terhubung");
        }
        catch (err) {
            this.logger.warn("⚠️ RabbitMQ tidak dapat diakses saat ini. Event bus berjalan dalam mode fallback / offline.");
        }
    }
    async disconnect() {
        try {
            await this.channel?.close();
            await this.connection?.close();
            this.logger.log("EventBus: koneksi ditutup");
        }
        catch {
        }
    }
    async publish(eventData) {
        if (!this.channel) {
            this.logger.warn(`EventBus: channel belum siap, event [${eventData.event_name}] dilewati (offline mode).`);
            return;
        }
        const event = {
            ...eventData,
            event_id: (0, crypto_1.randomUUID)(),
            occurred_at: new Date().toISOString(),
        };
        const message = Buffer.from(JSON.stringify(event));
        this.channel.publish(EXCHANGE_NAME, event.event_name, message, {
            persistent: true,
            contentType: "application/json",
            messageId: event.event_id,
            timestamp: Date.now(),
        });
        this.logger.debug(`📤 Event published: ${event.event_name} [${event.event_id}]`);
    }
    async subscribe(queueName, routingKey, handler) {
        if (!this.channel) {
            this.logger.warn(`EventBus: channel belum siap, subscribe [${queueName} -> ${routingKey}] dilewati (offline mode).`);
            return;
        }
        await this.channel.assertQueue(queueName, {
            durable: true,
            arguments: {
                "x-dead-letter-exchange": DLX_NAME,
            },
        });
        await this.channel.bindQueue(queueName, EXCHANGE_NAME, routingKey);
        await this.channel.prefetch(1);
        await this.channel.consume(queueName, async (msg) => {
            if (!msg)
                return;
            try {
                const event = JSON.parse(msg.content.toString());
                await handler(event);
                this.channel.ack(msg);
            }
            catch (err) {
                this.logger.error(`❌ Error proses event di queue ${queueName}`, err);
                this.channel.nack(msg, false, false);
            }
        });
        this.logger.log(`👂 Subscribed: queue=${queueName} key=${routingKey}`);
    }
};
exports.EventBusService = EventBusService;
exports.EventBusService = EventBusService = EventBusService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EventBusService);
//# sourceMappingURL=event-bus.service.js.map