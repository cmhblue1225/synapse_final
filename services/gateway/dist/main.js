"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const swagger_config_1 = require("./docs/swagger.config");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.enableCors({
        origin: [
            process.env.FRONTEND_URL || 'http://localhost:5173',
            'http://localhost:3000',
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });
    (0, swagger_config_1.setupSwagger)(app);
    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.log(`🚀 Gateway Service is running on port ${port}`);
    logger.log(`📚 API Documentation available at http://localhost:${port}/api/docs`);
    logger.log(`❤️  Health Check available at http://localhost:${port}/health`);
    logger.log(`🔄 Proxying to:`);
    logger.log(`   - Users Service: ${process.env.USERS_SERVICE_URL || 'http://users:3001'}`);
    logger.log(`   - Graph Service: ${process.env.GRAPH_SERVICE_URL || 'http://graph:3002'}`);
}
bootstrap();
//# sourceMappingURL=main.js.map