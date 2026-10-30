import { RawBodyRequest } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LogisticsService } from '../services/logistics.service';
import { FastifyRequest } from 'fastify';
export declare class LogisticsWebhookController {
    private readonly logisticsService;
    private readonly config;
    private readonly logger;
    constructor(logisticsService: LogisticsService, config: ConfigService);
    receiveWebhook(req: RawBodyRequest<FastifyRequest>, payload: Record<string, unknown>, signature: string): Promise<{
        ok: boolean;
    }>;
    private verifySignature;
}
