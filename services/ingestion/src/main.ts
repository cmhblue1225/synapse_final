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
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'x-user-id'],
  });

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Synapse Ingestion Service API')
    .setDescription('지식 노드 생성 및 관리 서비스 - 사용자의 지식을 구조화하고 저장하여 검색 가능한 형태로 변환합니다.')
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
    .addTag('ingestion', '지식 노드 생성/수정/삭제 - CRUD 작업')
    .addTag('relationships', '노드 간 관계 관리 - 연관 관계 설정')
    .addTag('bulk-operations', '일괄 작업 - 대량 데이터 처리')
    .addTag('file-processing', '파일 처리 - 문서 업로드 및 파싱')
    .addTag('analytics', '분석 및 통계 - 사용자 지식 현황')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3004;
  await app.listen(port);
  
  logger.log(`📝 Ingestion Service is running on port ${port}`);
  logger.log(`📚 API Documentation available at http://localhost:${port}/api/docs`);
  logger.log(`🔄 Connected to database for knowledge node management`);
}

bootstrap();