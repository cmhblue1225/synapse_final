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
export declare class KnowledgeNodeEntity {
    id: string;
    title: string;
    content: string;
    contentType: ContentType;
    nodeType: NodeType;
    userId: string;
    metadata: Record<string, any>;
    tags: string[];
    version: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    searchVector?: string;
}
