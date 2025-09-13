import { registerAs } from '@nestjs/config';
import { Driver } from 'neo4j-driver';

export interface Neo4jConfig {
  uri: string;
  username: string;
  password: string;
  database?: string;
}

export default registerAs('neo4j', (): Neo4jConfig => ({
  uri: process.env.NEO4J_URI || 'bolt://neo4j:7687',
  username: process.env.NEO4J_USER || 'neo4j',
  password: process.env.NEO4J_PASSWORD || 'synapse_password',
  database: process.env.NEO4J_DATABASE || 'neo4j',
}));