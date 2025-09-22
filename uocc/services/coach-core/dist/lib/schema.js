"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatOutSchema = exports.ChatInSchema = exports.SpeakOutSchema = exports.SpeakInSchema = exports.AnalyzeOutSchema = exports.AnalyzeInSchema = exports.EvaluateOutSchema = exports.EvaluateInSchema = exports.TestCaseSchema = void 0;
exports.parseEvaluateIn = parseEvaluateIn;
exports.parseAnalyzeIn = parseAnalyzeIn;
exports.parseSpeakIn = parseSpeakIn;
exports.parseChatIn = parseChatIn;
const zod_1 = require("zod");
exports.TestCaseSchema = zod_1.z.object({
    in: zod_1.z.array(zod_1.z.any()),
    out: zod_1.z.any(),
}).strict();
exports.EvaluateInSchema = zod_1.z.object({
    source: zod_1.z.string().min(1),
    lang: zod_1.z.literal('python'),
    tests: zod_1.z.array(exports.TestCaseSchema).min(1),
    timeoutSec: zod_1.z.number().int().positive().max(60).optional(),
}).strict();
exports.EvaluateOutSchema = zod_1.z.object({
    passCount: zod_1.z.number().int().nonnegative(),
    failCount: zod_1.z.number().int().nonnegative(),
    failures: zod_1.z.array(zod_1.z.object({
        index: zod_1.z.number().int().nonnegative(),
        input: zod_1.z.array(zod_1.z.any()),
        expected: zod_1.z.any(),
        got: zod_1.z.any().optional(),
        error: zod_1.z.string().optional(),
    }).strict()),
}).strict();
exports.AnalyzeInSchema = zod_1.z.object({
    source: zod_1.z.string().optional(),
    lang: zod_1.z.string().optional(),
    context: zod_1.z
        .object({
        platform: zod_1.z.string().optional(),
        filename: zod_1.z.string().optional(),
        problemTitle: zod_1.z.string().optional(),
        problemText: zod_1.z.string().optional(),
    }).strict()
        .optional(),
    failures: zod_1.z.array(zod_1.z.any()).optional(),
}).strict();
exports.AnalyzeOutSchema = zod_1.z.object({
    levels: zod_1.z
        .array(zod_1.z.object({
        level: zod_1.z.union([zod_1.z.literal(1), zod_1.z.literal(2), zod_1.z.literal(3)]),
        text: zod_1.z.string(),
        steps: zod_1.z.array(zod_1.z.string()).optional(),
    }).strict())
        .length(3),
    complexity: zod_1.z.object({ time: zod_1.z.string(), space: zod_1.z.string() }).strict(),
    summary: zod_1.z.string(),
    suggested_tests: zod_1.z.array(exports.TestCaseSchema).optional(),
}).strict();
exports.SpeakInSchema = zod_1.z.object({ text: zod_1.z.string().min(1) }).strict();
exports.SpeakOutSchema = zod_1.z.object({ audio: zod_1.z.string().min(1) }).strict();
exports.ChatInSchema = zod_1.z.object({
    mode: zod_1.z.union([zod_1.z.literal('coach'), zod_1.z.literal('chat'), zod_1.z.literal('answer')]),
    lang: zod_1.z.string(),
    source: zod_1.z.string().optional(),
    context: zod_1.z
        .object({
        platform: zod_1.z.string().optional(),
        filename: zod_1.z.string().optional(),
        problemTitle: zod_1.z.string().optional(),
        problemText: zod_1.z.string().optional(),
    }).strict()
        .optional(),
    run_summary: zod_1.z.any().optional(),
    userMessage: zod_1.z.string(),
    history: zod_1.z
        .array(zod_1.z.object({
        role: zod_1.z.union([zod_1.z.literal('user'), zod_1.z.literal('assistant')]),
        content: zod_1.z.string(),
    }).strict())
        .optional(),
    preferences: zod_1.z
        .object({
        verbosity: zod_1.z.union([zod_1.z.literal('short'), zod_1.z.literal('normal'), zod_1.z.literal('detailed')]).optional(),
        voice: zod_1.z.boolean().optional(),
    }).strict()
        .optional(),
}).strict();
exports.ChatOutSchema = zod_1.z.object({
    reply: zod_1.z.string(),
    nextActions: zod_1.z.array(zod_1.z.string()).optional(),
    suggestedEdits: zod_1.z
        .array(zod_1.z.object({
        type: zod_1.z.literal('diff'),
        language: zod_1.z.string(),
        patch: zod_1.z.string(),
    }).strict())
        .optional(),
    pointAt: zod_1.z.object({ startLine: zod_1.z.number().int(), endLine: zod_1.z.number().int(), reason: zod_1.z.string() }).optional(),
    unlock: zod_1.z.object({ l2: zod_1.z.boolean(), l3: zod_1.z.boolean() }).optional(),
    speak: zod_1.z.string().optional(),
    metadata: zod_1.z.object({ confidence: zod_1.z.number().min(0).max(1) }).optional(),
}).strict();
function parseEvaluateIn(body) {
    return exports.EvaluateInSchema.strict().parse(body);
}
function parseAnalyzeIn(body) {
    return exports.AnalyzeInSchema.strict().parse(body);
}
function parseSpeakIn(body) {
    return exports.SpeakInSchema.strict().parse(body);
}
function parseChatIn(body) {
    return exports.ChatInSchema.strict().parse(body);
}
