import { OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DomainEvent, CreateEventPayload } from "./domain-event.interface";
export declare class EventBusService implements OnModuleInit, OnModuleDestroy {
    private readonly config;
    private readonly logger;
    private connection;
    private channel;
    constructor(config: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private connect;
    private disconnect;
    publish<T>(eventData: CreateEventPayload<T>): Promise<void>;
    subscribe<T>(queueName: string, routingKey: string, handler: (event: DomainEvent<T>) => Promise<void>): Promise<void>;
}
