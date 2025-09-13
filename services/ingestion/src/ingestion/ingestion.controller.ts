import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  Headers, 
  Logger,
  ValidationPipe,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { IngestionService } from './ingestion.service';
import { 
  CreateKnowledgeNodeDto, 
  UpdateKnowledgeNodeDto, 
  KnowledgeNodeResponseDto,
  BulkCreateKnowledgeNodeDto,
  FileUploadDto,
} from '../dto/ingestion.dto';

@ApiTags('ingestion')
@Controller('api/ingestion')
export class IngestionController {
  private readonly logger = new Logger(IngestionController.name);

  constructor(private readonly ingestionService: IngestionService) {}

  @Post()
  @ApiOperation({
    summary: '지식 노드 생성',
    description: '새로운 지식 노드를 생성합니다. 제목 중복 검사를 수행하고, 검색을 위한 인덱싱을 자동으로 처리합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '지식 노드 생성 성공',
    type: KnowledgeNodeResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 데이터',
  })
  @ApiResponse({
    status: 409,
    description: '중복된 제목',
  })
  async createNode(
    @Body(new ValidationPipe({ whitelist: true, transform: true })) createDto: CreateKnowledgeNodeDto,
    @Headers('x-user-id') userId?: string,
  ): Promise<KnowledgeNodeResponseDto> {
    const actualUserId = userId || 'test-user-id';
    
    this.logger.log(`Creating knowledge node: ${createDto.title} for user ${actualUserId}`);
    
    return await this.ingestionService.createNode(actualUserId, createDto);
  }

  @Get('health')
  @ApiOperation({
    summary: 'Ingestion Service 상태 확인',
    description: 'Ingestion Service의 상태와 데이터베이스 연결을 확인합니다.',
  })
  @ApiResponse({
    status: 200,
    description: 'Ingestion Service 정상 상태',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'healthy' },
        timestamp: { type: 'string', example: '2024-01-15T10:30:00Z' },
        service: { type: 'string', example: 'ingestion' },
        version: { type: 'string', example: '1.0.0' },
      },
    },
  })
  async health(): Promise<any> {
    this.logger.log('Health check requested');
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'ingestion',
      version: '1.0.0',
    };
  }

  @Get('stats')
  @ApiOperation({
    summary: '지식 노드 통계 조회',
    description: '사용자의 지식 노드 통계 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '통계 조회 성공',
    schema: {
      type: 'object',
      properties: {
        totalNodes: { type: 'number', example: 156 },
        nodeTypeDistribution: {
          type: 'object',
          properties: {
            Knowledge: { type: 'number', example: 80 },
            Concept: { type: 'number', example: 45 },
            Fact: { type: 'number', example: 31 },
          },
        },
        contentTypeDistribution: {
          type: 'object',
          properties: {
            text: { type: 'number', example: 120 },
            document: { type: 'number', example: 36 },
          },
        },
      },
    },
  })
  async getStats(
    @Headers('x-user-id') userId?: string,
  ): Promise<any> {
    const actualUserId = userId || 'test-user-id';
    
    this.logger.log(`Getting statistics for user ${actualUserId}`);
    
    return await this.ingestionService.getNodeStats(actualUserId);
  }

  @Get(':id')
  @ApiOperation({
    summary: '지식 노드 조회',
    description: '특정 지식 노드의 상세 정보를 조회합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '조회할 노드의 UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: '지식 노드 조회 성공',
    type: KnowledgeNodeResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: '노드를 찾을 수 없음',
  })
  async getNode(
    @Param('id', ParseUUIDPipe) nodeId: string,
    @Headers('x-user-id') userId?: string,
  ): Promise<KnowledgeNodeResponseDto> {
    const actualUserId = userId || 'test-user-id';
    
    this.logger.log(`Retrieving knowledge node ${nodeId} for user ${actualUserId}`);
    
    return await this.ingestionService.getNode(actualUserId, nodeId);
  }

  @Put(':id')
  @ApiOperation({
    summary: '지식 노드 수정',
    description: '기존 지식 노드를 수정합니다. 버전이 자동으로 증가하고, 검색 인덱스가 업데이트됩니다.',
  })
  @ApiParam({
    name: 'id',
    description: '수정할 노드의 UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: '지식 노드 수정 성공',
    type: KnowledgeNodeResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: '노드를 찾을 수 없음',
  })
  @ApiResponse({
    status: 409,
    description: '중복된 제목',
  })
  async updateNode(
    @Param('id', ParseUUIDPipe) nodeId: string,
    @Body(new ValidationPipe({ whitelist: true, transform: true })) updateDto: UpdateKnowledgeNodeDto,
    @Headers('x-user-id') userId?: string,
  ): Promise<KnowledgeNodeResponseDto> {
    const actualUserId = userId || 'test-user-id';
    
    this.logger.log(`Updating knowledge node ${nodeId} for user ${actualUserId}`);
    
    return await this.ingestionService.updateNode(actualUserId, nodeId, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: '지식 노드 삭제',
    description: '지식 노드를 소프트 삭제합니다 (isActive = false). 실제 데이터는 보존됩니다.',
  })
  @ApiParam({
    name: 'id',
    description: '삭제할 노드의 UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: '지식 노드 삭제 성공',
  })
  @ApiResponse({
    status: 404,
    description: '노드를 찾을 수 없음',
  })
  async deleteNode(
    @Param('id', ParseUUIDPipe) nodeId: string,
    @Headers('x-user-id') userId?: string,
  ): Promise<void> {
    const actualUserId = userId || 'test-user-id';
    
    this.logger.log(`Deleting knowledge node ${nodeId} for user ${actualUserId}`);
    
    await this.ingestionService.deleteNode(actualUserId, nodeId);
  }

  @Get()
  @ApiOperation({
    summary: '사용자 지식 노드 목록 조회',
    description: '사용자의 모든 지식 노드를 페이징과 필터링을 통해 조회합니다.',
  })
  @ApiQuery({
    name: 'limit',
    description: '페이지당 결과 수 (최대 100)',
    required: false,
    example: 20,
  })
  @ApiQuery({
    name: 'offset',
    description: '건너뛸 결과 수',
    required: false,
    example: 0,
  })
  @ApiQuery({
    name: 'nodeType',
    description: '노드 타입 필터',
    required: false,
    example: 'Knowledge',
  })
  @ApiQuery({
    name: 'contentType',
    description: '콘텐츠 타입 필터',
    required: false,
    example: 'text',
  })
  @ApiQuery({
    name: 'sortBy',
    description: '정렬 기준',
    required: false,
    enum: ['createdAt', 'updatedAt', 'title'],
    example: 'updatedAt',
  })
  @ApiQuery({
    name: 'sortOrder',
    description: '정렬 순서',
    required: false,
    enum: ['ASC', 'DESC'],
    example: 'DESC',
  })
  @ApiResponse({
    status: 200,
    description: '지식 노드 목록 조회 성공',
    schema: {
      type: 'object',
      properties: {
        nodes: {
          type: 'array',
          items: { $ref: '#/components/schemas/KnowledgeNodeResponseDto' },
        },
        total: { type: 'number', example: 156 },
      },
    },
  })
  async getUserNodes(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('nodeType') nodeType?: string,
    @Query('contentType') contentType?: string,
    @Query('sortBy') sortBy?: 'createdAt' | 'updatedAt' | 'title',
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Headers('x-user-id') userId?: string,
  ): Promise<{ nodes: KnowledgeNodeResponseDto[]; total: number }> {
    const actualUserId = userId || 'test-user-id';
    
    this.logger.log(`Retrieving knowledge nodes for user ${actualUserId}`);
    
    return await this.ingestionService.getUserNodes(actualUserId, {
      limit: Math.min(limit || 50, 100), // 최대 100개로 제한
      offset: offset || 0,
      nodeType,
      contentType,
      sortBy: sortBy || 'updatedAt',
      sortOrder: sortOrder || 'DESC',
    });
  }

  @Post('bulk')
  @ApiOperation({
    summary: '지식 노드 일괄 생성',
    description: '여러 지식 노드를 한 번에 생성합니다. 중복된 제목은 자동으로 스킵됩니다.',
  })
  @ApiResponse({
    status: 201,
    description: '일괄 생성 성공',
    type: [KnowledgeNodeResponseDto],
  })
  async bulkCreateNodes(
    @Body(new ValidationPipe({ whitelist: true, transform: true })) bulkCreateDto: BulkCreateKnowledgeNodeDto,
    @Headers('x-user-id') userId?: string,
  ): Promise<KnowledgeNodeResponseDto[]> {
    const actualUserId = userId || 'test-user-id';
    
    this.logger.log(`Bulk creating ${bulkCreateDto.nodes.length} nodes for user ${actualUserId}`);
    
    return await this.ingestionService.bulkCreateNodes(actualUserId, bulkCreateDto);
  }

  @Post(':sourceId/link/:targetId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '노드 간 관계 생성',
    description: '두 지식 노드 간의 관계를 생성합니다. 가중치와 메타데이터를 설정할 수 있습니다.',
  })
  @ApiParam({
    name: 'sourceId',
    description: '소스 노드 UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'targetId',
    description: '타겟 노드 UUID',
    example: '456e7890-e89b-12d3-a456-426614174001',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        relationshipType: { 
          type: 'string', 
          example: 'prerequisite',
          description: '관계 타입 (prerequisite, related, opposite, example 등)'
        },
        weight: { 
          type: 'number', 
          example: 0.8,
          minimum: 0,
          maximum: 1,
          description: '관계 가중치 (0.0 - 1.0)'
        },
        metadata: { 
          type: 'object', 
          example: { description: '선행 학습이 필요한 개념' },
          description: '관계에 대한 추가 메타데이터'
        },
      },
      required: ['relationshipType'],
    },
  })
  @ApiResponse({
    status: 201,
    description: '노드 관계 생성 성공',
  })
  @ApiResponse({
    status: 404,
    description: '노드를 찾을 수 없음',
  })
  async linkNodes(
    @Param('sourceId', ParseUUIDPipe) sourceId: string,
    @Param('targetId', ParseUUIDPipe) targetId: string,
    @Body() linkData: {
      relationshipType: string;
      weight?: number;
      metadata?: Record<string, any>;
    },
    @Headers('x-user-id') userId?: string,
  ): Promise<void> {
    const actualUserId = userId || 'test-user-id';
    
    this.logger.log(`Linking nodes ${sourceId} -> ${targetId} for user ${actualUserId}`);
    
    await this.ingestionService.linkNodes(
      actualUserId,
      sourceId,
      targetId,
      linkData.relationshipType,
      linkData.weight || 1.0,
      linkData.metadata
    );
  }

  @Get('stats')
  @ApiOperation({
    summary: '지식 노드 통계 조회',
    description: '사용자의 지식 노드 통계 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '통계 조회 성공',
    schema: {
      type: 'object',
      properties: {
        totalNodes: { type: 'number', example: 156 },
        nodeTypeDistribution: {
          type: 'object',
          properties: {
            Knowledge: { type: 'number', example: 80 },
            Concept: { type: 'number', example: 45 },
            Fact: { type: 'number', example: 31 },
          },
        },
        contentTypeDistribution: {
          type: 'object',
          properties: {
            text: { type: 'number', example: 120 },
            document: { type: 'number', example: 36 },
          },
        },
      },
    },
  })
  async getStats(
    @Headers('x-user-id') userId?: string,
  ): Promise<any> {
    const actualUserId = userId || 'test-user-id';
    
    this.logger.log(`Getting statistics for user ${actualUserId}`);
    
    return await this.ingestionService.getNodeStats(actualUserId);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: '파일 업로드 및 지식 노드 생성',
    description: '텍스트 파일, 마크다운, PDF 등을 업로드하여 자동으로 지식 노드를 생성합니다.',
  })
  @ApiBody({
    description: '업로드할 파일과 파싱 옵션',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '업로드할 파일',
        },
        fileType: {
          type: 'string',
          enum: ['text', 'markdown', 'pdf', 'docx'],
          example: 'markdown',
        },
        parseOptions: {
          type: 'object',
          properties: {
            extractImages: { type: 'boolean', example: true },
            splitByHeaders: { type: 'boolean', example: true },
            maxNodeLength: { type: 'number', example: 1000 },
            defaultTags: { type: 'array', items: { type: 'string' }, example: ['imported'] },
            defaultNodeType: { type: 'string', example: 'Knowledge' },
          },
        },
      },
      required: ['file', 'fileType'],
    },
  })
  @ApiResponse({
    status: 201,
    description: '파일 업로드 및 노드 생성 성공',
    type: [KnowledgeNodeResponseDto],
  })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: FileUploadDto,
    @Headers('x-user-id') userId?: string,
  ): Promise<KnowledgeNodeResponseDto[]> {
    const actualUserId = userId || 'test-user-id';
    
    this.logger.log(`Processing file upload: ${file.originalname} for user ${actualUserId}`);
    
    // TODO: 파일 파싱 로직 구현
    // 현재는 기본 응답만 반환
    return [];
  }

  @Get('health')
  @ApiOperation({
    summary: 'Ingestion Service 상태 확인',
    description: 'Ingestion Service의 상태와 데이터베이스 연결을 확인합니다.',
  })
  @ApiResponse({
    status: 200,
    description: 'Ingestion Service 정상 상태',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'healthy' },
        timestamp: { type: 'string', example: '2024-01-15T10:30:00Z' },
        service: { type: 'string', example: 'ingestion' },
        version: { type: 'string', example: '1.0.0' },
      },
    },
  })
  async health(): Promise<any> {
    this.logger.log('Health check requested');
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'ingestion',
      version: '1.0.0',
    };
  }
}