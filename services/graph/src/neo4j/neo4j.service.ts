import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import neo4j, { Driver, Session, ManagedTransaction, Result } from 'neo4j-driver';
import { Neo4jConfig } from '../config/neo4j.config';

@Injectable()
export class Neo4jService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(Neo4jService.name);
  private driver: Driver;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const config = this.configService.get<Neo4jConfig>('neo4j');
    
    this.logger.log(`Connecting to Neo4j at ${config.uri}`);
    
    this.driver = neo4j.driver(
      config.uri,
      neo4j.auth.basic(config.username, config.password),
      {
        disableLosslessIntegers: true,
        logging: {
          level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
          logger: (level, message) => this.logger.log(`Neo4j ${level}: ${message}`),
        },
      }
    );

    // 연결 테스트
    try {
      await this.driver.verifyConnectivity();
      this.logger.log('Neo4j connection established successfully');
    } catch (error) {
      this.logger.error('Failed to connect to Neo4j', error);
      throw error;
    }

    // 기본 제약 조건 및 인덱스 생성
    await this.createConstraints();
  }

  async onModuleDestroy() {
    if (this.driver) {
      this.logger.log('Closing Neo4j connection');
      await this.driver.close();
    }
  }

  getSession(database?: string): Session {
    return this.driver.session({ database });
  }

  async runQuery<T = any>(
    cypher: string, 
    parameters: Record<string, any> = {},
    database?: string
  ): Promise<Result<T>> {
    const session = this.getSession(database);
    try {
      return await session.run(cypher, parameters);
    } finally {
      await session.close();
    }
  }

  async runTransaction<T>(
    work: (tx: ManagedTransaction) => Promise<T>,
    database?: string
  ): Promise<T> {
    const session = this.getSession(database);
    try {
      return await session.executeWrite(work);
    } finally {
      await session.close();
    }
  }

  async runReadTransaction<T>(
    work: (tx: ManagedTransaction) => Promise<T>,
    database?: string
  ): Promise<T> {
    const session = this.getSession(database);
    try {
      return await session.executeRead(work);
    } finally {
      await session.close();
    }
  }

  private async createConstraints() {
    const constraints = [
      // Node 고유 제약 조건
      'CREATE CONSTRAINT node_id_unique IF NOT EXISTS FOR (n:Node) REQUIRE n.id IS UNIQUE',
      
      // User 고유 제약 조건
      'CREATE CONSTRAINT user_id_unique IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE',
      
      // Knowledge 고유 제약 조건  
      'CREATE CONSTRAINT knowledge_id_unique IF NOT EXISTS FOR (k:Knowledge) REQUIRE k.id IS UNIQUE',
      
      // 인덱스 생성
      'CREATE INDEX node_title_index IF NOT EXISTS FOR (n:Node) ON (n.title)',
      'CREATE INDEX node_created_at_index IF NOT EXISTS FOR (n:Node) ON (n.createdAt)',
      'CREATE INDEX knowledge_content_index IF NOT EXISTS FOR (k:Knowledge) ON (k.content)',
      'CREATE FULLTEXT INDEX node_search_index IF NOT EXISTS FOR (n:Node) ON EACH [n.title, n.content]',
    ];

    for (const constraint of constraints) {
      try {
        await this.runQuery(constraint);
        this.logger.log(`Created constraint/index: ${constraint.split(' ')[1]}`);
      } catch (error) {
        this.logger.warn(`Failed to create constraint/index: ${error.message}`);
      }
    }
  }

  async checkConnection(): Promise<boolean> {
    try {
      await this.driver.verifyConnectivity();
      return true;
    } catch (error) {
      this.logger.error('Neo4j connection check failed', error);
      return false;
    }
  }

  async getServerInfo(): Promise<any> {
    const result = await this.runQuery('CALL dbms.components() YIELD name, versions, edition');
    return result.records.map(record => ({
      name: record.get('name'),
      versions: record.get('versions'),
      edition: record.get('edition'),
    }));
  }
}