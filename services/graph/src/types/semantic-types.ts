// 의미론적 관계 타입 정의
export enum SemanticRelationType {
  // 핵심 의미론적 관계
  REFERENCES = 'REFERENCES',           // 참조 관계: A가 B를 참조함
  EXPANDS_ON = 'EXPANDS_ON',          // 확장 관계: A가 B를 더 자세히 설명함
  CONTRADICTS = 'CONTRADICTS',        // 모순 관계: A가 B와 모순됨
  SUPPORTS = 'SUPPORTS',              // 지지 관계: A가 B를 뒷받침함
  IS_A = 'IS_A',                      // 분류 관계: A가 B의 한 종류임
  
  // 추가 의미론적 관계
  CAUSES = 'CAUSES',                  // 인과 관계: A가 B를 야기함
  PRECEDES = 'PRECEDES',              // 시간적 선행: A가 B보다 먼저 일어남
  INCLUDES = 'INCLUDES',              // 포함 관계: A가 B를 포함함
  SIMILAR_TO = 'SIMILAR_TO',          // 유사 관계: A가 B와 유사함
  DIFFERENT_FROM = 'DIFFERENT_FROM',  // 차이 관계: A가 B와 다름
}

// 노드 타입 정의
export enum NodeType {
  KNOWLEDGE = 'Knowledge',    // 지식 노드
  CONCEPT = 'Concept',        // 개념 노드
  FACT = 'Fact',             // 사실 노드
  OPINION = 'Opinion',        // 의견 노드
  QUESTION = 'Question',      // 질문 노드
  ANSWER = 'Answer',          // 답변 노드
  DOCUMENT = 'Document',      // 문서 노드
  PERSON = 'Person',          // 인물 노드
  EVENT = 'Event',            // 사건 노드
  LOCATION = 'Location',      // 장소 노드
}

// 콘텐츠 타입 정의
export enum ContentType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  URL = 'url',
  CODE = 'code',
}

// 노드 인터페이스
export interface KnowledgeNode {
  id: string;
  title: string;
  content: string;
  contentType: ContentType;
  nodeType: NodeType;
  userId: string;
  metadata: Record<string, any>;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

// 관계 인터페이스
export interface SemanticRelation {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  relationType: SemanticRelationType;
  strength: number;          // 관계의 강도 (0-1)
  confidence: number;        // 관계의 확신도 (0-1)
  metadata: Record<string, any>;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// 검색 결과 인터페이스
export interface SearchResult {
  nodes: KnowledgeNode[];
  relations: SemanticRelation[];
  totalCount: number;
  searchTime: number;
}

// 그래프 통계 인터페이스
export interface GraphStats {
  totalNodes: number;
  totalRelations: number;
  nodesByType: Record<NodeType, number>;
  relationsByType: Record<SemanticRelationType, number>;
  avgConnectionsPerNode: number;
  mostConnectedNodes: Array<{
    nodeId: string;
    title: string;
    connectionCount: number;
  }>;
}

// 경로 탐색 결과
export interface PathResult {
  path: Array<{
    node: KnowledgeNode;
    relation?: SemanticRelation;
  }>;
  totalDistance: number;
  pathStrength: number;
}

// 클러스터 분석 결과
export interface ClusterResult {
  clusterId: string;
  nodes: KnowledgeNode[];
  centerNode: KnowledgeNode;
  cohesion: number; // 클러스터 응집도
  topics: string[]; // 주요 주제들
}