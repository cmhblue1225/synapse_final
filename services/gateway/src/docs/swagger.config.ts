import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Synapse API Gateway')
    .setDescription(`
# Synapse "기억의 비서" API Documentation

## 개요
Synapse는 지식 그래프 기반의 개인 지식 관리 시스템입니다. 
정보들 간의 의미론적 관계를 표현하고 관리하는 "두 번째 뇌" 역할을 합니다.

## 핵심 기능
- **지식 노드 관리**: 다양한 타입의 지식을 노드로 저장
- **의미론적 관계**: 10가지 의미론적 관계 타입으로 연결
- **그래프 탐색**: 복잡한 관계 네트워크 탐색
- **지능형 검색**: 콘텐츠 및 관계 기반 검색

## 인증
모든 보호된 엔드포인트는 JWT 토큰이 필요합니다.
\`Authorization: Bearer <your-jwt-token>\`

## 서비스 구조
- **Users Service** (3001): 사용자 인증 및 관리
- **Graph Service** (3002): 지식 그래프 관리
- **Search Service** (3003): 검색 및 추천 *[구현 예정]*
- **Ingestion Service** (3004): 데이터 수집 *[구현 예정]*

## 의미론적 관계 타입
- **REFERENCES**: A가 B를 참조함
- **EXPANDS_ON**: A가 B를 확장 설명함
- **CONTRADICTS**: A가 B와 모순됨
- **SUPPORTS**: A가 B를 뒷받침함
- **IS_A**: A가 B의 한 종류임
- **CAUSES**: A가 B를 야기함
- **PRECEDES**: A가 B보다 먼저 일어남
- **INCLUDES**: A가 B를 포함함
- **SIMILAR_TO**: A가 B와 유사함
- **DIFFERENT_FROM**: A가 B와 다름
    `)
    .setVersion('1.0.0')
    .setContact(
      'Synapse Team',
      'https://github.com/cmhblue1225/synapse_final',
      'support@synapse.ai'
    )
    .setLicense(
      'MIT',
      'https://opensource.org/licenses/MIT'
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Authorization header using the Bearer scheme',
      },
      'JWT-auth'
    )
    .addServer('http://localhost:3000', 'Development Server')
    .addServer('https://api.synapse.ai', 'Production Server')
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('Users', 'User management operations')
    .addTag('Graph', 'Knowledge graph operations')
    .addTag('Nodes', 'Knowledge node management')
    .addTag('Relations', 'Semantic relationship management')
    .addTag('Search', 'Search and discovery operations')
    .addTag('Analytics', 'Graph analytics and statistics')
    .addTag('System', 'System health and monitoring')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // Custom CSS for better appearance
  const customCss = `
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info { margin: 50px 0; }
    .swagger-ui .info .title { color: #1f2937; }
    .swagger-ui .scheme-container { background: #f8fafc; padding: 20px; margin: 20px 0; border-radius: 8px; }
  `;

  SwaggerModule.setup('api/docs', app, document, {
    customCss,
    customSiteTitle: 'Synapse API Documentation',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      tryItOutEnabled: true,
    },
  });

  return document;
}