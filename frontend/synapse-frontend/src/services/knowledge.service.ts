import { ingestionApi } from './api';
import type { 
  KnowledgeNode,
  CreateKnowledgeNodeRequest,
  UpdateKnowledgeNodeRequest,
  BulkCreateNodesRequest,
  NodeStats
} from '../types/api';

export class KnowledgeService {
  // CRUD Operations
  async createNode(nodeData: CreateKnowledgeNodeRequest): Promise<KnowledgeNode> {
    return await ingestionApi.post<KnowledgeNode>('/api/ingestion', nodeData);
  }

  async getNode(nodeId: string): Promise<KnowledgeNode> {
    return await ingestionApi.get<KnowledgeNode>(`/api/ingestion/${nodeId}`);
  }

  async updateNode(nodeId: string, nodeData: UpdateKnowledgeNodeRequest): Promise<KnowledgeNode> {
    return await ingestionApi.put<KnowledgeNode>(`/api/ingestion/${nodeId}`, nodeData);
  }

  async deleteNode(nodeId: string): Promise<void> {
    await ingestionApi.delete(`/api/ingestion/${nodeId}`);
  }

  // List operations
  async getUserNodes(options: {
    limit?: number;
    offset?: number;
    nodeType?: string;
    contentType?: string;
    sortBy?: 'createdAt' | 'updatedAt' | 'title';
    sortOrder?: 'ASC' | 'DESC';
  } = {}): Promise<{ nodes: KnowledgeNode[]; total: number }> {
    const params = new URLSearchParams();
    
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.offset) params.append('offset', options.offset.toString());
    if (options.nodeType) params.append('nodeType', options.nodeType);
    if (options.contentType) params.append('contentType', options.contentType);
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.sortOrder) params.append('sortOrder', options.sortOrder);

    return await ingestionApi.get<{ nodes: KnowledgeNode[]; total: number }>(
      `/api/ingestion?${params.toString()}`
    );
  }

  // Bulk operations
  async bulkCreateNodes(nodesData: BulkCreateNodesRequest): Promise<KnowledgeNode[]> {
    return await ingestionApi.post<KnowledgeNode[]>('/api/ingestion/bulk', nodesData);
  }

  // Relationships
  async linkNodes(
    sourceId: string, 
    targetId: string, 
    relationshipData: {
      relationshipType: string;
      weight?: number;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    await ingestionApi.post(`/api/ingestion/${sourceId}/link/${targetId}`, relationshipData);
  }

  // File operations
  async uploadFile(
    file: File, 
    options: {
      fileType: 'text' | 'markdown' | 'pdf' | 'docx';
      parseOptions?: {
        extractImages?: boolean;
        splitByHeaders?: boolean;
        maxNodeLength?: number;
        defaultTags?: string[];
        defaultNodeType?: string;
      };
    }
  ): Promise<KnowledgeNode[]> {
    return await ingestionApi.uploadFile<KnowledgeNode[]>('/api/ingestion/upload', file, options);
  }

  // Statistics
  async getNodeStats(): Promise<NodeStats> {
    return await ingestionApi.get<NodeStats>('/api/ingestion/stats');
  }

  // Health check
  async checkHealth(): Promise<{ status: string; timestamp: string; service: string; version: string }> {
    return await ingestionApi.get('/api/ingestion/health');
  }

  // Helper methods
  static validateNodeData(data: CreateKnowledgeNodeRequest): string[] {
    const errors: string[] = [];

    if (!data.title || data.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (data.title && data.title.length > 500) {
      errors.push('Title must be less than 500 characters');
    }

    if (!data.content || data.content.trim().length === 0) {
      errors.push('Content is required');
    }

    if (data.tags && data.tags.length > 20) {
      errors.push('Maximum 20 tags allowed');
    }

    return errors;
  }

  // Common node templates
  static createNoteTemplate(title: string, content: string, tags: string[] = []): CreateKnowledgeNodeRequest {
    return {
      title,
      content,
      nodeType: 'Knowledge' as any,
      contentType: 'text' as any,
      tags,
      metadata: {
        template: 'note',
        createdFrom: 'frontend',
      },
    };
  }

  static createConceptTemplate(title: string, definition: string, tags: string[] = []): CreateKnowledgeNodeRequest {
    return {
      title,
      content: definition,
      nodeType: 'Concept' as any,
      contentType: 'text' as any,
      tags: [...tags, 'concept'],
      metadata: {
        template: 'concept',
        createdFrom: 'frontend',
      },
    };
  }

  static createQuestionTemplate(question: string, answer?: string, tags: string[] = []): CreateKnowledgeNodeRequest {
    return {
      title: question,
      content: answer || 'No answer provided yet.',
      nodeType: answer ? 'Answer' as any : 'Question' as any,
      contentType: 'text' as any,
      tags: [...tags, 'question'],
      metadata: {
        template: 'qa',
        createdFrom: 'frontend',
        hasAnswer: !!answer,
      },
    };
  }

  // Pagination helper
  static calculatePagination(page: number, limit: number, total: number) {
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + limit, total);

    return {
      currentPage: page,
      totalPages,
      hasNext,
      hasPrev,
      startIndex,
      endIndex,
      showing: `${startIndex + 1}-${endIndex} of ${total}`,
    };
  }
}

export const knowledgeService = new KnowledgeService();