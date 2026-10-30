import { ConfigService } from '@nestjs/config';
export declare class AppController {
    private readonly configService;
    constructor(configService: ConfigService);
    getRoot(): {
        status: string;
        service: string;
        timestamp: string;
    };
    checkHealth(): Promise<{
        status: string;
        timestamp: string;
        services: {
            database: string;
            api: string;
        };
    }>;
}
