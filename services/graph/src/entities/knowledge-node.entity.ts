import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { NodeType, ContentType } from '../types/semantic-types';

@Entity('knowledge_nodes')
@Index(['userId', 'createdAt'])
@Index(['nodeType'])
@Index(['title'])
export class KnowledgeNodeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 500 })
  @Index('title_search_idx')
  title: string;

  @Column('text')
  content: string;

  @Column({
    type: 'enum',
    enum: ContentType,
    default: ContentType.TEXT,
  })
  contentType: ContentType;

  @Column({
    type: 'enum',
    enum: NodeType,
    default: NodeType.KNOWLEDGE,
  })
  nodeType: NodeType;

  @Column('uuid')
  @Index('user_nodes_idx')
  userId: string;

  @Column('jsonb', { default: {} })
  metadata: Record<string, any>;

  @Column('simple-array', { default: '' })
  tags: string[];

  @Column({ default: 1 })
  version: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 검색을 위한 가상 컬럼 (PostgreSQL full-text search)
  @Column('tsvector', { 
    nullable: true,
    comment: 'Full-text search vector for title and content'
  })
  searchVector?: string;
}