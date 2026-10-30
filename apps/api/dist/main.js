"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const platform_fastify_1 = require("@nestjs/platform-fastify");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
const app_config_1 = require("./core/config/app.config");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    (0, app_config_1.validateConfig)(process.env);
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_fastify_1.FastifyAdapter({ logger: false }));
    const config = app.get(config_1.ConfigService);
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : config.get('API_PORT', 3001);
    const host = config.get('API_HOST', '0.0.0.0');
    const prefix = config.get('API_PREFIX', '/api/v1');
    const corsOrigins = config
        .get('CORS_ORIGINS', 'http://localhost:3000')
        .split(',')
        .map((o) => o.trim());
    app.setGlobalPrefix(prefix, {
        exclude: ['/'],
    });
    app.enableCors({
        origin: corsOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    await app.listen(port, host);
    logger.log(`🚀 API berjalan di: http://${host}:${port}${prefix}`);
    logger.log(`📦 Environment: ${config.get('NODE_ENV', 'development')}`);
}
bootstrap();
//# sourceMappingURL=main.js.map