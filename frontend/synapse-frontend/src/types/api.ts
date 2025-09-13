// API Base Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

// Auth Types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Knowledge Node Types
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

export interface KnowledgeNode {
  id: string;
  title: string;
  content: string;
  contentType: ContentType;
  nodeType: NodeType;
  userId: string;
  tags: string[];
  metadata: Record<string, any>;
  relatedNodes: RelatedNode[];
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RelatedNode {
  id: string;
  relationshipType: string;
  weight: number;
  metadata?: Record<string, any>;
}

export interface CreateKnowledgeNodeRequest {
  title: string;
  content: string;
  contentType?: ContentType;
  nodeType?: NodeType;
  tags?: string[];
  metadata?: Record<string, any>;
  relatedNodes?: RelatedNode[];
}

export interface UpdateKnowledgeNodeRequest extends Partial<CreateKnowledgeNodeRequest> {
  isActive?: boolean;
}

export interface BulkCreateNodesRequest {
  nodes: CreateKnowledgeNodeRequest[];
}

// Search Types
export interface SearchQuery {
  query: string;
  nodeTypes?: NodeType[];
  contentTypes?: ContentType[];
  tags?: string[];
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'date' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  contentType: ContentType;
  nodeType: NodeType;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  relevanceScore: number;
  highlights: string[];
}

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  searchTime: number;
  appliedFilters: Record<string, any>;
}

export interface AutocompleteQuery {
  query: string;
  limit?: number;
}

export interface AutocompleteResponse {
  suggestions: string[];
}

export interface PopularTag {
  tag: string;
  count: number;
}

// Graph Types
export interface GraphNode {
  id: string;
  title: string;
  nodeType: NodeType;
  contentType: ContentType;
  tags: string[];
  createdAt: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  relationshipType: string;
  weight: number;
  metadata?: Record<string, any>;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphQuery {
  nodeId?: string;
  depth?: number;
  relationshipTypes?: string[];
  minWeight?: number;
  maxNodes?: number;
}

// Statistics Types
export interface NodeStats {
  totalNodes: number;
  nodeTypeDistribution: Record<NodeType, number>;
  contentTypeDistribution: Record<ContentType, number>;
}

export interface UserActivity {
  date: string;
  nodesCreated: number;
  nodesUpdated: number;
  searchCount: number;
}