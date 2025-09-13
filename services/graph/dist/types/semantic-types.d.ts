export declare enum SemanticRelationType {
    REFERENCES = "REFERENCES",
    EXPANDS_ON = "EXPANDS_ON",
    CONTRADICTS = "CONTRADICTS",
    SUPPORTS = "SUPPORTS",
    IS_A = "IS_A",
    CAUSES = "CAUSES",
    PRECEDES = "PRECEDES",
    INCLUDES = "INCLUDES",
    SIMILAR_TO = "SIMILAR_TO",
    DIFFERENT_FROM = "DIFFERENT_FROM"
}
export declare enum NodeType {
    KNOWLEDGE = "Knowledge",
    CONCEPT = "Concept",
    FACT = "Fact",
    OPINION = "Opinion",
    QUESTION = "Question",
    ANSWER = "Answer",
    DOCUMENT = "Document",
    PERSON = "Person",
    EVENT = "Event",
    LOCATION = "Location"
}
export declare enum ContentType {
    TEXT = "text",
    IMAGE = "image",
    VIDEO = "video",
    AUDIO = "audio",
    DOCUMENT = "document",
    URL = "url",
    CODE = "code"
}
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
export interface SemanticRelation {
    id: string;
    fromNodeId: string;
    toNodeId: string;
    relationType: SemanticRelationType;
    strength: number;
    confidence: number;
    metadata: Record<string, any>;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface SearchResult {
    nodes: KnowledgeNode[];
    relations: SemanticRelation[];
    totalCount: number;
    searchTime: number;
}
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
export interface PathResult {
    path: Array<{
        node: KnowledgeNode;
        relation?: SemanticRelation;
    }>;
    totalDistance: number;
    pathStrength: number;
}
export interface ClusterResult {
    clusterId: string;
    nodes: KnowledgeNode[];
    centerNode: KnowledgeNode;
    cohesion: number;
    topics: string[];
}
