import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { KnowledgeNodeEntity } from '../entities/knowledge-node.entity';

@Module({
  imports: [TypeOrmModule.forFeature([KnowledgeNodeEntity])],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}