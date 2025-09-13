import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

export enum NodeType {
  KNOWLEDGE = 'Knowledge',
  CONCEPT = 'Concept',
  FACT = 'Fact',
  OPINION = 'Opinion',
  QUESTION = 'Question',
  ANSWER = 'Answer',
  DOCUMENT = 'Document',
  PERSON = 'Person',
  EVENT = 'Event',
  LOCATION = 'Location',
}

export enum ContentType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  URL = 'url',
  CODE = 'code',
}

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

  // 관계 정보 (Graph Service와의 연동을 위한 필드)
  @Column('jsonb', { default: [] })
  relatedNodes: Array<{
    id: string;
    relationshipType: string;
    weight: number;
    metadata?: Record<string, any>;
  }>;

  // 자동으로 검색 벡터 업데이트
  @BeforeInsert()
  @BeforeUpdate()
  updateSearchVector() {
    // PostgreSQL에서 트리거를 통해 처리하는 것이 더 효율적이므로
    // 여기서는 기본적인 메타데이터 업데이트만 수행
    this.metadata.lastModified = new Date().toISOString();
  }
}