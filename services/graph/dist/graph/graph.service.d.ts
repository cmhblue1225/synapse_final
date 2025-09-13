import { Repository } from 'typeorm';
import { Neo4jService } from '../neo4j/neo4j.service';
import { KnowledgeNodeEntity } from '../entities/knowledge-node.entity';
import { SemanticRelationEntity } from '../entities/semantic-relation.entity';
import { KnowledgeNode, SemanticRelation, SearchResult, GraphStats, PathResult } from '../types/semantic-types';
export declare class GraphService {
    private readonly nodeRepository;
    private readonly relationRepository;
    private readonly neo4jService;
    private readonly logger;
    constructor(nodeRepository: Repository<KnowledgeNodeEntity>, relationRepository: Repository<SemanticRelationEntity>, neo4jService: Neo4jService);
    createNode(nodeData: Partial<KnowledgeNode>): Promise<KnowledgeNode>;
    updateNode(id: string, updateData: Partial<KnowledgeNode>): Promise<KnowledgeNode>;
    deleteNode(id: string): Promise<void>;
    getNode(id: string): Promise<KnowledgeNode>;
    createRelation(relationData: Partial<SemanticRelation>): Promise<SemanticRelation>;
    updateRelation(id: string, updateData: Partial<SemanticRelation>): Promise<SemanticRelation>;
    deleteRelation(id: string): Promise<void>;
    searchNodes(query: string, userId: string, limit?: number, offset?: number): Promise<SearchResult>;
    findPath(fromNodeId: string, toNodeId: string, maxDepth?: number): Promise<PathResult[]>;
    getGraphStats(userId: string): Promise<GraphStats>;
    private syncNodeToNeo4j;
    private syncRelationToNeo4j;
    private entityToNode;
    private entityToRelation;
}
