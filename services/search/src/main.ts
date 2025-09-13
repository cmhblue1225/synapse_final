import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  
  // Enable validation globally
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));
  
  // Enable CORS
  app.enableCors({
    origin: [
      'http://localhost:3000', // Gateway
      'http://localhost:5173', // Frontend
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Synapse Search Service API')
    .setDescription('지식 그래프 검색 및 발견 서비스 - 사용자의 지식 노드와 관계를 빠르게 검색하고 연관된 정보를 발견할 수 있습니다.')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT 토큰을 입력하세요',
      },
      'JWT-auth',
    )
    .addTag('search', '전체 텍스트 검색 - 제목, 내용, 태그 전반에 걸친 통합 검색')
    .addTag('filter', '필터링 - 노드 타입, 콘텐츠 타입, 날짜 범위별 필터링')
    .addTag('suggestions', '자동완성 - 실시간 검색 제안 및 자동완성')
    .addTag('analytics', '검색 분석 - 검색 패턴 분석 및 인기 키워드')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3003;
  await app.listen(port);
  
  logger.log(`🔍 Search Service is running on port ${port}`);
  logger.log(`📚 API Documentation available at http://localhost:${port}/api/docs`);
  logger.log(`🔄 Connected to database for search operations`);
}

bootstrap();