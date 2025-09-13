import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphService } from './graph.service';
import { GraphController } from './graph.controller';
import { Neo4jModule } from '../neo4j/neo4j.module';
import { KnowledgeNodeEntity } from '../entities/knowledge-node.entity';
import { SemanticRelationEntity } from '../entities/semantic-relation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      KnowledgeNodeEntity,
      SemanticRelationEntity,
    ]),
    Neo4jModule,
  ],
  controllers: [GraphController],
  providers: [GraphService],
  exports: [GraphService],
})
export class GraphModule {}