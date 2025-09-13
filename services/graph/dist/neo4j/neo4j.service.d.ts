import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Session, ManagedTransaction, Result } from 'neo4j-driver';
export declare class Neo4jService implements OnModuleInit, OnModuleDestroy {
    private readonly configService;
    private readonly logger;
    private driver;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    getSession(database?: string): Session;
    runQuery<T = any>(cypher: string, parameters?: Record<string, any>, database?: string): Promise<Result<T>>;
    runTransaction<T>(work: (tx: ManagedTransaction) => Promise<T>, database?: string): Promise<T>;
    runReadTransaction<T>(work: (tx: ManagedTransaction) => Promise<T>, database?: string): Promise<T>;
    private createConstraints;
    checkConnection(): Promise<boolean>;
    getServerInfo(): Promise<any>;
}
