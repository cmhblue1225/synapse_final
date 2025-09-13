import { IsOptional, IsString, IsEnum, IsDateString, IsInt, Min, Max, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { NodeType, ContentType } from '../entities/knowledge-node.entity';

export class SearchQueryDto {
  @ApiProperty({
    description: '검색할 키워드 또는 구문',
    example: '머신러닝 알고리즘',
  })
  @IsString()
  query: string;

  @ApiPropertyOptional({
    description: '검색할 노드 타입들',
    enum: NodeType,
    isArray: true,
    example: [NodeType.KNOWLEDGE, NodeType.CONCEPT],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(NodeType, { each: true })
  nodeTypes?: NodeType[];

  @ApiPropertyOptional({
    description: '검색할 콘텐츠 타입들',
    enum: ContentType,
    isArray: true,
    example: [ContentType.TEXT, ContentType.DOCUMENT],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(ContentType, { each: true })
  contentTypes?: ContentType[];

  @ApiPropertyOptional({
    description: '검색할 태그들',
    type: [String],
    example: ['AI', '딥러닝', '기계학습'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: '검색 시작 날짜 (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: '검색 종료 날짜 (YYYY-MM-DD)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: '페이지 번호 (1부터 시작)',
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiPropertyOptional({
    description: '페이지당 결과 수 (1-100)',
    minimum: 1,
    maximum: 100,
    default: 10,
    example: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;

  @ApiPropertyOptional({
    description: '정렬 기준',
    enum: ['relevance', 'date', 'title'],
    default: 'relevance',
    example: 'relevance',
  })
  @IsOptional()
  @IsEnum(['relevance', 'date', 'title'])
  sortBy?: 'relevance' | 'date' | 'title' = 'relevance';

  @ApiPropertyOptional({
    description: '정렬 순서',
    enum: ['asc', 'desc'],
    default: 'desc',
    example: 'desc',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class AutocompleteQueryDto {
  @ApiProperty({
    description: '자동완성을 위한 부분 키워드',
    example: '머신',
  })
  @IsString()
  query: string;

  @ApiPropertyOptional({
    description: '반환할 제안 수',
    minimum: 1,
    maximum: 20,
    default: 5,
    example: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 5;
}

export class SearchResultDto {
  @ApiProperty({
    description: '노드 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: '노드 제목',
    example: '머신러닝 기초 개념',
  })
  title: string;

  @ApiProperty({
    description: '노드 내용 (요약)',
    example: '머신러닝은 컴퓨터가 명시적으로 프로그래밍되지 않고도 학습할 수 있게 하는...',
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
    description: '태그들',
    type: [String],
    example: ['AI', '머신러닝', '기초'],
  })
  tags: string[];

  @ApiProperty({
    description: '생성 날짜',
    example: '2024-01-15T09:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '수정 날짜',
    example: '2024-01-20T14:45:00Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: '검색 관련도 점수 (0.0-1.0)',
    example: 0.85,
  })
  relevanceScore: number;

  @ApiProperty({
    description: '강조된 텍스트 스니펫들',
    type: [String],
    example: ['<mark>머신러닝</mark>은 AI의 한 분야로...', '다양한 <mark>알고리즘</mark>이 존재합니다.'],
  })
  highlights: string[];
}

export class SearchResponseDto {
  @ApiProperty({
    description: '검색 결과들',
    type: [SearchResultDto],
  })
  results: SearchResultDto[];

  @ApiProperty({
    description: '전체 결과 수',
    example: 156,
  })
  totalCount: number;

  @ApiProperty({
    description: '현재 페이지',
    example: 1,
  })
  currentPage: number;

  @ApiProperty({
    description: '페이지당 결과 수',
    example: 10,
  })
  pageSize: number;

  @ApiProperty({
    description: '전체 페이지 수',
    example: 16,
  })
  totalPages: number;

  @ApiProperty({
    description: '검색 소요 시간 (밀리초)',
    example: 45,
  })
  searchTime: number;

  @ApiProperty({
    description: '적용된 필터들',
    example: { nodeTypes: ['Knowledge'], tags: ['AI'] },
  })
  appliedFilters: Record<string, any>;
}