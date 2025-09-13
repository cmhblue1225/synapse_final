import { IsString, IsEnum, IsOptional, IsArray, IsUUID, IsObject, IsBoolean, Length, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { NodeType, ContentType } from '../entities/knowledge-node.entity';

export class CreateKnowledgeNodeDto {
  @ApiProperty({
    description: '노드 제목',
    example: 'React Hook의 이해',
    minLength: 1,
    maxLength: 500,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  title: string;

  @ApiProperty({
    description: '노드 내용',
    example: 'React Hook은 함수형 컴포넌트에서 상태와 생명주기 기능을 사용할 수 있게 해주는 기능입니다...',
  })
  @IsString()
  @MinLength(1)
  content: string;

  @ApiPropertyOptional({
    description: '콘텐츠 타입',
    enum: ContentType,
    default: ContentType.TEXT,
    example: ContentType.TEXT,
  })
  @IsOptional()
  @IsEnum(ContentType)
  contentType?: ContentType = ContentType.TEXT;

  @ApiPropertyOptional({
    description: '노드 타입',
    enum: NodeType,
    default: NodeType.KNOWLEDGE,
    example: NodeType.KNOWLEDGE,
  })
  @IsOptional()
  @IsEnum(NodeType)
  nodeType?: NodeType = NodeType.KNOWLEDGE;

  @ApiPropertyOptional({
    description: '태그 배열',
    type: [String],
    example: ['React', 'Hook', 'Frontend', 'JavaScript'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => Array.isArray(value) ? value.filter(tag => tag.trim().length > 0) : [])
  tags?: string[] = [];

  @ApiPropertyOptional({
    description: '추가 메타데이터',
    example: { 
      source: 'https://reactjs.org/docs/hooks-intro.html',
      difficulty: 'intermediate',
      estimatedReadTime: '5 minutes'
    },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any> = {};

  @ApiPropertyOptional({
    description: '관련된 노드들과의 관계 정보',
    example: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        relationshipType: 'prerequisite',
        weight: 0.8,
        metadata: { description: '이해하기 전에 필요한 개념' }
      }
    ],
  })
  @IsOptional()
  @IsArray()
  relatedNodes?: Array<{
    id: string;
    relationshipType: string;
    weight: number;
    metadata?: Record<string, any>;
  }> = [];
}

export class UpdateKnowledgeNodeDto extends PartialType(CreateKnowledgeNodeDto) {
  @ApiPropertyOptional({
    description: '노드 활성 상태',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class KnowledgeNodeResponseDto {
  @ApiProperty({
    description: '노드 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: '노드 제목',
    example: 'React Hook의 이해',
  })
  title: string;

  @ApiProperty({
    description: '노드 내용',
    example: 'React Hook은 함수형 컴포넌트에서 상태와 생명주기 기능을 사용할 수 있게 해주는 기능입니다...',
  })
  content: string;

  @ApiProperty({
    description: '콘텐츠 타입',
    enum: ContentType,
    example: ContentType.TEXT,
  })
  contentType: ContentType;

  @ApiProperty({
    description: '노드 타입',
    enum: NodeType,
    example: NodeType.KNOWLEDGE,
  })
  nodeType: NodeType;

  @ApiProperty({
    description: '사용자 ID',
    example: 'user123',
  })
  userId: string;

  @ApiProperty({
    description: '태그 배열',
    type: [String],
    example: ['React', 'Hook', 'Frontend', 'JavaScript'],
  })
  tags: string[];

  @ApiProperty({
    description: '메타데이터',
    example: { 
      source: 'https://reactjs.org/docs/hooks-intro.html',
      difficulty: 'intermediate' 
    },
  })
  metadata: Record<string, any>;

  @ApiProperty({
    description: '관련 노드들',
    example: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        relationshipType: 'prerequisite',
        weight: 0.8
      }
    ],
  })
  relatedNodes: Array<{
    id: string;
    relationshipType: string;
    weight: number;
    metadata?: Record<string, any>;
  }>;

  @ApiProperty({
    description: '버전',
    example: 1,
  })
  version: number;

  @ApiProperty({
    description: '활성 상태',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: '생성일',
    example: '2024-01-15T09:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '수정일',
    example: '2024-01-20T14:45:00Z',
  })
  updatedAt: Date;
}

export class BulkCreateKnowledgeNodeDto {
  @ApiProperty({
    description: '생성할 노드들의 배열',
    type: [CreateKnowledgeNodeDto],
  })
  @IsArray()
  @Type(() => CreateKnowledgeNodeDto)
  nodes: CreateKnowledgeNodeDto[];
}

export class FileUploadDto {
  @ApiProperty({
    description: '파일 타입',
    enum: ['text', 'markdown', 'pdf', 'docx'],
    example: 'markdown',
  })
  @IsEnum(['text', 'markdown', 'pdf', 'docx'])
  fileType: string;

  @ApiPropertyOptional({
    description: '파싱 옵션',
    example: { 
      extractImages: true, 
      splitByHeaders: true,
      maxNodeLength: 1000
    },
  })
  @IsOptional()
  @IsObject()
  parseOptions?: {
    extractImages?: boolean;
    splitByHeaders?: boolean;
    maxNodeLength?: number;
    defaultTags?: string[];
    defaultNodeType?: NodeType;
  };
}