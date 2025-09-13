"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentType = exports.NodeType = exports.SemanticRelationType = void 0;
var SemanticRelationType;
(function (SemanticRelationType) {
    SemanticRelationType["REFERENCES"] = "REFERENCES";
    SemanticRelationType["EXPANDS_ON"] = "EXPANDS_ON";
    SemanticRelationType["CONTRADICTS"] = "CONTRADICTS";
    SemanticRelationType["SUPPORTS"] = "SUPPORTS";
    SemanticRelationType["IS_A"] = "IS_A";
    SemanticRelationType["CAUSES"] = "CAUSES";
    SemanticRelationType["PRECEDES"] = "PRECEDES";
    SemanticRelationType["INCLUDES"] = "INCLUDES";
    SemanticRelationType["SIMILAR_TO"] = "SIMILAR_TO";
    SemanticRelationType["DIFFERENT_FROM"] = "DIFFERENT_FROM";
})(SemanticRelationType || (exports.SemanticRelationType = SemanticRelationType = {}));
var NodeType;
(function (NodeType) {
    NodeType["KNOWLEDGE"] = "Knowledge";
    NodeType["CONCEPT"] = "Concept";
    NodeType["FACT"] = "Fact";
    NodeType["OPINION"] = "Opinion";
    NodeType["QUESTION"] = "Question";
    NodeType["ANSWER"] = "Answer";
    NodeType["DOCUMENT"] = "Document";
    NodeType["PERSON"] = "Person";
    NodeType["EVENT"] = "Event";
    NodeType["LOCATION"] = "Location";
})(NodeType || (exports.NodeType = NodeType = {}));
var ContentType;
(function (ContentType) {
    ContentType["TEXT"] = "text";
    ContentType["IMAGE"] = "image";
    ContentType["VIDEO"] = "video";
    ContentType["AUDIO"] = "audio";
    ContentType["DOCUMENT"] = "document";
    ContentType["URL"] = "url";
    ContentType["CODE"] = "code";
})(ContentType || (exports.ContentType = ContentType = {}));
//# sourceMappingURL=semantic-types.js.map