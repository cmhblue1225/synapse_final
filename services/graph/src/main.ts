import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';

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
      process.env.GATEWAY_URL || 'http://localhost:3000',
      process.env.FRONTEND_URL || 'http://localhost:5173'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'x-user-id'],
  });

  // Add global prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3002;
  await app.listen(port);
  
  logger.log(`🚀 Knowledge Graph Service is running on port ${port}`);
  logger.log(`📊 Neo4j URI: ${process.env.NEO4J_URI || 'bolt://neo4j:7687'}`);
  logger.log(`🗄️  PostgreSQL: ${process.env.POSTGRES_URL ? 'Connected' : 'Using default config'}`);
}
bootstrap();