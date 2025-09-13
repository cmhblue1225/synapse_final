"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var Neo4jService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Neo4jService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const neo4j_driver_1 = require("neo4j-driver");
let Neo4jService = Neo4jService_1 = class Neo4jService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(Neo4jService_1.name);
    }
    async onModuleInit() {
        const config = this.configService.get('neo4j');
        this.logger.log(`Connecting to Neo4j at ${config.uri}`);
        this.driver = neo4j_driver_1.default.driver(config.uri, neo4j_driver_1.default.auth.basic(config.username, config.password), {
            disableLosslessIntegers: true,
            logging: {
                level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
                logger: (level, message) => this.logger.log(`Neo4j ${level}: ${message}`),
            },
        });
        try {
            await this.driver.verifyConnectivity();
            this.logger.log('Neo4j connection established successfully');
        }
        catch (error) {
            this.logger.error('Failed to connect to Neo4j', error);
            throw error;
        }
        await this.createConstraints();
    }
    async onModuleDestroy() {
        if (this.driver) {
            this.logger.log('Closing Neo4j connection');
            await this.driver.close();
        }
    }
    getSession(database) {
        return this.driver.session({ database });
    }
    async runQuery(cypher, parameters = {}, database) {
        const session = this.getSession(database);
        try {
            return await session.run(cypher, parameters);
        }
        finally {
            await session.close();
        }
    }
    async runTransaction(work, database) {
        const session = this.getSession(database);
        try {
            return await session.executeWrite(work);
        }
        finally {
            await session.close();
        }
    }
    async runReadTransaction(work, database) {
        const session = this.getSession(database);
        try {
            return await session.executeRead(work);
        }
        finally {
            await session.close();
        }
    }
    async createConstraints() {
        const constraints = [
            'CREATE CONSTRAINT node_id_unique IF NOT EXISTS FOR (n:Node) REQUIRE n.id IS UNIQUE',
            'CREATE CONSTRAINT user_id_unique IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE',
            'CREATE CONSTRAINT knowledge_id_unique IF NOT EXISTS FOR (k:Knowledge) REQUIRE k.id IS UNIQUE',
            'CREATE INDEX node_title_index IF NOT EXISTS FOR (n:Node) ON (n.title)',
            'CREATE INDEX node_created_at_index IF NOT EXISTS FOR (n:Node) ON (n.createdAt)',
            'CREATE INDEX knowledge_content_index IF NOT EXISTS FOR (k:Knowledge) ON (k.content)',
            'CREATE FULLTEXT INDEX node_search_index IF NOT EXISTS FOR (n:Node) ON EACH [n.title, n.content]',
        ];
        for (const constraint of constraints) {
            try {
                await this.runQuery(constraint);
                this.logger.log(`Created constraint/index: ${constraint.split(' ')[1]}`);
            }
            catch (error) {
                this.logger.warn(`Failed to create constraint/index: ${error.message}`);
            }
        }
    }
    async checkConnection() {
        try {
            await this.driver.verifyConnectivity();
            return true;
        }
        catch (error) {
            this.logger.error('Neo4j connection check failed', error);
            return false;
        }
    }
    async getServerInfo() {
        const result = await this.runQuery('CALL dbms.components() YIELD name, versions, edition');
        return result.records.map(record => ({
            name: record.get('name'),
            versions: record.get('versions'),
            edition: record.get('edition'),
        }));
    }
};
exports.Neo4jService = Neo4jService;
exports.Neo4jService = Neo4jService = Neo4jService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], Neo4jService);
//# sourceMappingURL=neo4j.service.js.map