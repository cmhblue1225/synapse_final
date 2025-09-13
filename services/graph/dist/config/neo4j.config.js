"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('neo4j', () => ({
    uri: process.env.NEO4J_URI || 'bolt://neo4j:7687',
    username: process.env.NEO4J_USER || 'neo4j',
    password: process.env.NEO4J_PASSWORD || 'synapse_password',
    database: process.env.NEO4J_DATABASE || 'neo4j',
}));
//# sourceMappingURL=neo4j.config.js.map