import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { GraphService } from './graph.service';
import { CreateNodeDto } from './dto/create-node.dto';
import { CreateRelationDto } from './dto/create-relation.dto';
// JWT Guard는 추후 구현
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('graph')
// @UseGuards(JwtAuthGuard)  // 추후 활성화
export class GraphController {
  constructor(private readonly graphService: GraphService) {}

  // === 노드 관리 API ===
  @Post('nodes')
  async createNode(@Body() createNodeDto: CreateNodeDto, @Request() req: any) {
    // 임시로 하드코딩된 사용자 ID 사용
    const userId = req.user?.id || 'temp-user-id';
    
    return await this.graphService.createNode({
      ...createNodeDto,
      userId,
    });
  }

  @Get('nodes/:id')
  async getNode(@Param('id') id: string) {
    return await this.graphService.getNode(id);
  }

  @Put('nodes/:id')
  async updateNode(
    @Param('id') id: string,
    @Body() updateNodeDto: Partial<CreateNodeDto>
  ) {
    return await this.graphService.updateNode(id, updateNodeDto);
  }

  @Delete('nodes/:id')
  async deleteNode(@Param('id') id: string) {
    await this.graphService.deleteNode(id);
    return { success: true, message: '노드가 성공적으로 삭제되었습니다.' };
  }

  // === 관계 관리 API ===
  @Post('relations')
  async createRelation(@Body() createRelationDto: CreateRelationDto, @Request() req: any) {
    const userId = req.user?.id || 'temp-user-id';
    
    return await this.graphService.createRelation({
      ...createRelationDto,
      userId,
    });
  }

  @Put('relations/:id')
  async updateRelation(
    @Param('id') id: string,
    @Body() updateRelationDto: Partial<CreateRelationDto>
  ) {
    return await this.graphService.updateRelation(id, updateRelationDto);
  }

  @Delete('relations/:id')
  async deleteRelation(@Param('id') id: string) {
    await this.graphService.deleteRelation(id);
    return { success: true, message: '관계가 성공적으로 삭제되었습니다.' };
  }

  // === 검색 및 탐색 API ===
  @Get('search')
  async searchNodes(
    @Query('q') query: string = '',
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Request() req: any
  ) {
    const userId = req.user?.id || 'temp-user-id';
    
    return await this.graphService.searchNodes(query, userId, limit, offset);
  }

  @Get('path')
  async findPath(
    @Query('from') fromNodeId: string,
    @Query('to') toNodeId: string,
    @Query('maxDepth', new DefaultValuePipe(6), ParseIntPipe) maxDepth: number
  ) {
    return await this.graphService.findPath(fromNodeId, toNodeId, maxDepth);
  }

  @Get('stats')
  async getGraphStats(@Request() req: any) {
    const userId = req.user?.id || 'temp-user-id';
    
    return await this.graphService.getGraphStats(userId);
  }

  // === 그래프 분석 API ===
  @Get('nodes/:id/neighbors')
  async getNodeNeighbors(
    @Param('id') nodeId: string,
    @Query('depth', new DefaultValuePipe(1), ParseIntPipe) depth: number
  ) {
    // 이웃 노드 탐색 로직 구현
    return {
      nodeId,
      neighbors: [],
      depth,
      message: '이웃 노드 탐색 기능은 구현 예정입니다.',
    };
  }

  @Get('clusters')
  async getClusters(@Request() req: any) {
    const userId = req.user?.id || 'temp-user-id';
    
    // 클러스터 분석 로직 구현
    return {
      userId,
      clusters: [],
      message: '클러스터 분석 기능은 구현 예정입니다.',
    };
  }

  @Get('recommendations/:nodeId')
  async getRecommendations(@Param('nodeId') nodeId: string) {
    // 추천 시스템 로직 구현
    return {
      nodeId,
      recommendations: [],
      message: '추천 시스템은 구현 예정입니다.',
    };
  }

  // === 시스템 상태 API ===
  @Get('health')
  async getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Graph Service is running',
    };
  }

  @Get('neo4j/status')
  async getNeo4jStatus() {
    const isConnected = await this.graphService['neo4jService'].checkConnection();
    const serverInfo = isConnected ? 
      await this.graphService['neo4jService'].getServerInfo() : null;

    return {
      connected: isConnected,
      serverInfo,
      timestamp: new Date().toISOString(),
    };
  }
}