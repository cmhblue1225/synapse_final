export interface Neo4jConfig {
    uri: string;
    username: string;
    password: string;
    database?: string;
}
declare const _default: (() => Neo4jConfig) & import("@nestjs/config").ConfigFactoryKeyHost<Neo4jConfig>;
export default _default;
