import { Controller, Get, Query, Headers, Logger, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchQueryDto, AutocompleteQueryDto, SearchResponseDto } from '../dto/search.dto';

@ApiTags('search')
@Controller('api/search')
export class SearchController {
  private readonly logger = new Logger(SearchController.name);

  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({
    summary: '지식 노드 검색',
    description: '사용자의 지식 노드들을 키워드, 타입, 태그, 날짜 범위 등으로 검색합니다. PostgreSQL의 전체 텍스트 검색을 활용하여 관련도 높은 결과를 제공합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '검색 성공',
    type: SearchResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 검색 쿼리',
  })
  @ApiResponse({
    status: 401,
    description: '인증 필요',
  })
  async search(
    @Query() searchQuery: SearchQueryDto,
    @Headers('x-user-id') userId?: string,
  ): Promise<SearchResponseDto> {
    // 임시로 userId를 쿼리에서 받거나 기본값 사용 (실제로는 JWT에서 추출)
    const actualUserId = userId || 'test-user-id';
    
    this.logger.log(`Search request from user ${actualUserId}: ${JSON.stringify(searchQuery)}`);
    
    return await this.searchService.search(actualUserId, searchQuery);
  }

  @Get('autocomplete')
  @ApiOperation({
    summary: '자동완성 검색',
    description: '사용자가 입력한 키워드에 대한 자동완성 제안을 제공합니다. 제목과 태그를 기반으로 제안합니다.',
  })
  @ApiQuery({
    name: 'query',
    description: '자동완성할 키워드',
    example: '머신',
  })
  @ApiQuery({
    name: 'limit',
    description: '반환할 제안 수',
    required: false,
    example: 5,
  })
  @ApiResponse({
    status: 200,
    description: '자동완성 제안 성공',
    schema: {
      type: 'object',
      properties: {
        suggestions: {
          type: 'array',
          items: { type: 'string' },
          example: ['머신러닝', '머신러닝 알고리즘', '머신러닝 기초'],
        },
      },
    },
  })
  async autocomplete(
    @Query() query: AutocompleteQueryDto,
    @Headers('x-user-id') userId?: string,
  ): Promise<{ suggestions: string[] }> {
    const actualUserId = userId || 'test-user-id';
    
    this.logger.log(`Autocomplete request from user ${actualUserId}: ${query.query}`);
    
    const suggestions = await this.searchService.autocomplete(actualUserId, query);
    return { suggestions };
  }

  @Get('popular-tags')
  @ApiOperation({
    summary: '인기 태그 조회',
    description: '사용자의 지식 노드에서 자주 사용되는 태그들을 빈도순으로 조회합니다.',
  })
  @ApiQuery({
    name: 'limit',
    description: '반환할 태그 수',
    required: false,
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: '인기 태그 조회 성공',
    schema: {
      type: 'object',
      properties: {
        tags: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              tag: { type: 'string', example: 'AI' },
              count: { type: 'number', example: 25 },
            },
          },
        },
      },
    },
  })
  async getPopularTags(
    @Query('limit') limit?: number,
    @Headers('x-user-id') userId?: string,
  ): Promise<{ tags: Array<{ tag: string; count: number }> }> {
    const actualUserId = userId || 'test-user-id';
    const actualLimit = limit || 20;
    
    this.logger.log(`Popular tags request from user ${actualUserId}, limit: ${actualLimit}`);
    
    const tags = await this.searchService.getPopularTags(actualUserId, actualLimit);
    return { tags };
  }

  @Get('stats')
  @ApiOperation({
    summary: '검색 통계 조회',
    description: '사용자의 지식 노드 통계 정보를 조회합니다. 노드 수, 타입별 분포, 콘텐츠 타입별 분포 등을 제공합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '검색 통계 조회 성공',
    schema: {
      type: 'object',
      properties: {
        totalNodes: { type: 'number', example: 150 },
        nodeTypeDistribution: {
          type: 'object',
          properties: {
            Knowledge: { type: 'number', example: 80 },
            Concept: { type: 'number', example: 45 },
            Fact: { type: 'number', example: 25 },
          },
        },
        contentTypeDistribution: {
          type: 'object',
          properties: {
            text: { type: 'number', example: 120 },
            document: { type: 'number', example: 30 },
          },
        },
      },
    },
  })
  async getSearchStats(
    @Headers('x-user-id') userId?: string,
  ): Promise<any> {
    const actualUserId = userId || 'test-user-id';
    
    this.logger.log(`Search stats request from user ${actualUserId}`);
    
    return await this.searchService.getSearchStats(actualUserId);
  }

  @Get('health')
  @ApiOperation({
    summary: 'Search Service 상태 확인',
    description: 'Search Service의 상태와 데이터베이스 연결을 확인합니다.',
  })
  @ApiResponse({
    status: 200,
    description: 'Search Service 정상 상태',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'healthy' },
        timestamp: { type: 'string', example: '2024-01-15T10:30:00Z' },
        service: { type: 'string', example: 'search' },
        version: { type: 'string', example: '1.0.0' },
      },
    },
  })
  async health(): Promise<any> {
    this.logger.log('Health check requested');
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'search',
      version: '1.0.0',
    };
  }
}