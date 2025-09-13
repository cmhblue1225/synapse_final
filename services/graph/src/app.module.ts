import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphModule } from './graph/graph.module';
import { Neo4jModule } from './neo4j/neo4j.module';
import databaseConfig from './config/database.config';
import neo4jConfig from './config/neo4j.config';

@Module({
  imports: [
    // Configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, neo4jConfig],
      envFilePath: ['.env.local', '.env'],
    }),
    
    // TypeORM module for PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get('database');
        if (!dbConfig) {
          throw new Error('Database configuration not found');
        }
        return dbConfig;
      },
      inject: [ConfigService],
    }),

    // Neo4j module
    Neo4jModule,

    // Graph module
    GraphModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}