"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
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
        origin: process.env.GATEWAY_URL || 'http://localhost:3000',
        credentials: true,
    });
    app.setGlobalPrefix('api');
    const port = process.env.PORT || 3002;
    await app.listen(port);
    logger.log(`🚀 Knowledge Graph Service is running on port ${port}`);
    logger.log(`📊 Neo4j URI: ${process.env.NEO4J_URI || 'bolt://neo4j:7687'}`);
    logger.log(`🗄️  PostgreSQL: ${process.env.POSTGRES_URL ? 'Connected' : 'Using default config'}`);
}
bootstrap();
//# sourceMappingURL=main.js.map