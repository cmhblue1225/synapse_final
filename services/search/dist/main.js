"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
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
            'http://localhost:3000',
            'http://localhost:5173',
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Synapse Search Service API')
        .setDescription('지식 그래프 검색 및 발견 서비스 - 사용자의 지식 노드와 관계를 빠르게 검색하고 연관된 정보를 발견할 수 있습니다.')
        .setVersion('1.0.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT 토큰을 입력하세요',
    }, 'JWT-auth')
        .addTag('search', '전체 텍스트 검색 - 제목, 내용, 태그 전반에 걸친 통합 검색')
        .addTag('filter', '필터링 - 노드 타입, 콘텐츠 타입, 날짜 범위별 필터링')
        .addTag('suggestions', '자동완성 - 실시간 검색 제안 및 자동완성')
        .addTag('analytics', '검색 분석 - 검색 패턴 분석 및 인기 키워드')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = process.env.PORT || 3003;
    await app.listen(port);
    logger.log(`🔍 Search Service is running on port ${port}`);
    logger.log(`📚 API Documentation available at http://localhost:${port}/api/docs`);
    logger.log(`🔄 Connected to database for search operations`);
}
bootstrap();
//# sourceMappingURL=main.js.map