"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngestionModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const platform_express_1 = require("@nestjs/platform-express");
const ingestion_service_1 = require("./ingestion.service");
const ingestion_controller_1 = require("./ingestion.controller");
const knowledge_node_entity_1 = require("../entities/knowledge-node.entity");
let IngestionModule = class IngestionModule {
};
exports.IngestionModule = IngestionModule;
exports.IngestionModule = IngestionModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([knowledge_node_entity_1.KnowledgeNodeEntity]),
            platform_express_1.MulterModule.register({
                dest: './uploads',
                limits: {
                    fileSize: 10 * 1024 * 1024,
                    files: 1,
                },
                fileFilter: (req, file, cb) => {
                    const allowedTypes = [
                        'text/plain',
                        'text/markdown',
                        'application/pdf',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    ];
                    if (allowedTypes.includes(file.mimetype)) {
                        cb(null, true);
                    }
                    else {
                        cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
                    }
                },
            }),
        ],
        controllers: [ingestion_controller_1.IngestionController],
        providers: [ingestion_service_1.IngestionService],
        exports: [ingestion_service_1.IngestionService],
    })
], IngestionModule);
//# sourceMappingURL=ingestion.module.js.map