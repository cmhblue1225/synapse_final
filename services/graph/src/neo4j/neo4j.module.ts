import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Neo4jService } from './neo4j.service';
import neo4jConfig from '../config/neo4j.config';

@Module({
  imports: [
    ConfigModule.forFeature(neo4jConfig),
  ],
  providers: [Neo4jService],
  exports: [Neo4jService],
})
export class Neo4jModule {}