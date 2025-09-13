import { GraphService } from './graph.service';
import { CreateNodeDto } from './dto/create-node.dto';
import { CreateRelationDto } from './dto/create-relation.dto';
export declare class GraphController {
    private readonly graphService;
    constructor(graphService: GraphService);
    createNode(createNodeDto: CreateNodeDto, req: any): Promise<import("../types/semantic-types").KnowledgeNode>;
    getNode(id: string): Promise<import("../types/semantic-types").KnowledgeNode>;
    updateNode(id: string, updateNodeDto: Partial<CreateNodeDto>): Promise<import("../types/semantic-types").KnowledgeNode>;
    deleteNode(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    createRelation(createRelationDto: CreateRelationDto, req: any): Promise<import("../types/semantic-types").SemanticRelation>;
    updateRelation(id: string, updateRelationDto: Partial<CreateRelationDto>): Promise<import("../types/semantic-types").SemanticRelation>;
    deleteRelation(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    searchNodes(query: string, limit: number, offset: number, req: any): Promise<import("../types/semantic-types").SearchResult>;
    findPath(fromNodeId: string, toNodeId: string, maxDepth: number): Promise<import("../types/semantic-types").PathResult[]>;
    getGraphStats(req: any): Promise<import("../types/semantic-types").GraphStats>;
    getNodeNeighbors(nodeId: string, depth: number): Promise<{
        nodeId: string;
        neighbors: any[];
        depth: number;
        message: string;
    }>;
    getClusters(req: any): Promise<{
        userId: any;
        clusters: any[];
        message: string;
    }>;
    getRecommendations(nodeId: string): Promise<{
        nodeId: string;
        recommendations: any[];
        message: string;
    }>;
    getHealth(): Promise<{
        status: string;
        timestamp: string;
        message: string;
    }>;
    getNeo4jStatus(): Promise<{
        connected: boolean;
        serverInfo: any;
        timestamp: string;
    }>;
}
