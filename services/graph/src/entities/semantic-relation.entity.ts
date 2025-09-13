import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { SemanticRelationType } from '../types/semantic-types';

@Entity('semantic_relations')
@Index(['fromNodeId', 'toNodeId'])
@Index(['relationType'])
@Index(['userId', 'createdAt'])
@Index(['strength'])
export class SemanticRelationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index('from_node_idx')
  fromNodeId: string;

  @Column('uuid')
  @Index('to_node_idx')
  toNodeId: string;

  @Column({
    type: 'enum',
    enum: SemanticRelationType,
  })
  relationType: SemanticRelationType;

  @Column('decimal', { precision: 3, scale: 2, default: 0.5 })
  strength: number; // 관계의 강도 (0-1)

  @Column('decimal', { precision: 3, scale: 2, default: 0.8 })
  confidence: number; // 관계의 확신도 (0-1)

  @Column('jsonb', { default: {} })
  metadata: Record<string, any>;

  @Column('uuid')
  @Index('user_relations_idx')
  userId: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isSystemGenerated: boolean; // AI가 자동 생성한 관계인지 여부

  @Column({ default: 1 })
  version: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 관계 검증을 위한 체크섬
  @Column({ nullable: true })
  checksum?: string;

  // 관계가 양방향인지 여부
  @Column({ default: false })
  isBidirectional: boolean;
}