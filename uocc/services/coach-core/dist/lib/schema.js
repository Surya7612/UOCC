"use strict";
// import { z } from "zod";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatOutSchema = exports.ChatInSchema = exports.SpeakOutSchema = exports.SpeakInSchema = exports.AnalyzeOutSchema = exports.AnalyzeInSchema = exports.EvaluateOutSchema = exports.EvaluateInSchema = void 0;
// export const SpeakInSchema = z.object({
//   text: z.string().min(1).max(200),
// });
// export type SpeakIn = z.infer<typeof SpeakInSchema>;
// export const SpeakOutSchema = z.object({
//   audio: z.string().startsWith("data:audio/"),
// });
// export type SpeakOut = z.infer<typeof SpeakOutSchema>;
// export const EvaluateInSchema = z.object({
//   source: z.string().min(1),
//   lang: z.literal('python'),
//   tests: z.array(TestCaseSchema).min(1),
//   timeoutSec: z.number().int().positive().max(60).optional(),
// }).strict();
// export const EvaluateOutSchema = z.object({
//   passCount: z.number().int().nonnegative(),
//   failCount: z.number().int().nonnegative(),
//   failures: z.array(
//     z.object({
//       index: z.number().int().nonnegative(),
//       input: z.array(z.any()),
//       expected: z.any(),
//       got: z.any().optional(),
//       error: z.string().optional(),
//     }).strict()
//   ),
// }).strict();
// export const AnalyzeInSchema = z.object({
//   source: z.string().optional(),
//   lang: z.string().optional(),
//   context: z
//     .object({
//       platform: z.string().optional(),
//       filename: z.string().optional(),
//       problemTitle: z.string().optional(),
//       problemText: z.string().optional(),
//     }).strict()
//     .optional(),
//   failures: z.array(z.any()).optional(),
// }).strict();
// export const AnalyzeOutSchema = z.object({
//   levels: z
//     .array(
//       z.object({
//         level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
//         text: z.string(),
//         steps: z.array(z.string()).optional(),
//       }).strict()
//     )
//     .length(3),
//   complexity: z.object({ time: z.string(), space: z.string() }).strict(),
//   summary: z.string(),
//   suggested_tests: z.array(TestCaseSchema).optional(),
// }).strict();
// export const SpeakInSchema = z.object({ text: z.string().min(1) }).strict();
// export const SpeakOutSchema = z.object({ audio: z.string().min(1) }).strict();
// export const ChatInSchema = z.object({
//   mode: z.union([z.literal('coach'), z.literal('chat'), z.literal('answer')]),
//   lang: z.string(),
//   source: z.string().optional(),
//   context: z
//     .object({
//       platform: z.string().optional(),
//       filename: z.string().optional(),
//       problemTitle: z.string().optional(),
//       problemText: z.string().optional(),
//     }).strict()
//     .optional(),
//   run_summary: z.any().optional(),
//   userMessage: z.string(),
//   history: z
//     .array(
//       z.object({
//         role: z.union([z.literal('user'), z.literal('assistant')]),
//         content: z.string(),
//       }).strict()
//     )
//     .optional(),
//   preferences: z
//     .object({
//       verbosity: z.union([z.literal('short'), z.literal('normal'), z.literal('detailed')]).optional(),
//       voice: z.boolean().optional(),
//     }).strict()
//     .optional(),
// }).strict();
// export const ChatOutSchema = z.object({
//   reply: z.string(),
//   nextActions: z.array(z.string()).optional(),
//   suggestedEdits: z
//     .array(
//       z.object({
//         type: z.literal('diff'),
//         language: z.string(),
//         patch: z.string(),
//       }).strict()
//     )
//     .optional(),
//   pointAt: z.object({ startLine: z.number().int(), endLine: z.number().int(), reason: z.string() }).optional(),
//   unlock: z.object({ l2: z.boolean(), l3: z.boolean() }).optional(),
//   speak: z.string().optional(),
//   metadata: z.object({ confidence: z.number().min(0).max(1) }).optional(),
// }).strict();
// export type EvaluateIn = z.infer<typeof EvaluateInSchema>;
// export type EvaluateOut = z.infer<typeof EvaluateOutSchema>;
// export type AnalyzeIn = z.infer<typeof AnalyzeInSchema>;
// export type AnalyzeOut = z.infer<typeof AnalyzeOutSchema>;
// export type SpeakIn = z.infer<typeof SpeakInSchema>;
// export type SpeakOut = z.infer<typeof SpeakOutSchema>;
// export type ChatIn = z.infer<typeof ChatInSchema>;
// export type ChatOut = z.infer<typeof ChatOutSchema>;
// export function parseEvaluateIn(body: unknown): EvaluateIn {
//   return EvaluateInSchema.strict().parse(body);
// }
// export function parseAnalyzeIn(body: unknown): AnalyzeIn {
//   return AnalyzeInSchema.strict().parse(body);
// }
// export function parseSpeakIn(body: unknown): SpeakIn {
//   return SpeakInSchema.strict().parse(body);
// }
// export function parseChatIn(body: unknown): ChatIn {
//   return ChatInSchema.strict().parse(body);
// }
// import { z } from "zod";
// /* ------------------------------ shared shapes ------------------------------ */
// export const TestCaseSchema = z.object({
//   in: z.array(z.any()),   // arguments to pass to solve(*args)
//   out: z.any(),           // expected result
// }).strict();
// /* --------------------------------- speak ---------------------------------- */
// export const SpeakInSchema = z.object({
//   text: z.string().min(1).max(200),
// }).strict();
// export type SpeakIn = z.infer<typeof SpeakInSchema>;
// export const SpeakOutSchema = z.object({
//   // data URL returned by TTS (e.g., data:audio/mpeg;base64,...)
//   audio: z.string().startsWith("data:audio/"),
// }).strict();
// export type SpeakOut = z.infer<typeof SpeakOutSchema>;
// /* -------------------------------- evaluate -------------------------------- */
// export const EvaluateInSchema = z.object({
//   source: z.string().min(1),
//   lang: z.literal("python"),
//   tests: z.array(TestCaseSchema).min(1),
//   timeoutSec: z.number().int().positive().max(60).optional(),
// }).strict();
// export type EvaluateIn = z.infer<typeof EvaluateInSchema>;
// export const EvaluateOutSchema = z.object({
//   passCount: z.number().int().nonnegative(),
//   failCount: z.number().int().nonnegative(),
//   failures: z.array(
//     z.object({
//       index: z.number().int().nonnegative(),
//       input: z.array(z.any()),
//       expected: z.any(),
//       got: z.any().optional(),
//       error: z.string().optional(),
//     }).strict()
//   ),
// }).strict();
// export type EvaluateOut = z.infer<typeof EvaluateOutSchema>;
// /* -------------------------------- analyze --------------------------------- */
// export const AnalyzeInSchema = z.object({
//   source: z.string().optional(),
//   lang: z.string().optional(),
//   context: z
//     .object({
//       platform: z.string().optional(),
//       filename: z.string().optional(),
//       problemTitle: z.string().optional(),
//       problemText: z.string().optional(),
//     })
//     .strict()
//     .optional(),
//   failures: z.array(z.any()).optional(),
// }).strict();
// export type AnalyzeIn = z.infer<typeof AnalyzeInSchema>;
// export const AnalyzeOutSchema = z.object({
//   levels: z
//     .array(
//       z.object({
//         level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
//         text: z.string(),
//         steps: z.array(z.string()).optional(),
//       }).strict()
//     )
//     .length(3),
//   complexity: z.object({ time: z.string(), space: z.string() }).strict(),
//   summary: z.string(),
//   suggested_tests: z.array(TestCaseSchema).optional(),
// }).strict();
// export type AnalyzeOut = z.infer<typeof AnalyzeOutSchema>;
// /* ---------------------------------- chat ---------------------------------- */
// export const ChatInSchema = z.object({
//   mode: z.union([z.literal("coach"), z.literal("chat"), z.literal("answer")]),
//   lang: z.string(),
//   source: z.string().optional(),
//   context: z
//     .object({
//       platform: z.string().optional(),
//       filename: z.string().optional(),
//       problemTitle: z.string().optional(),
//       problemText: z.string().optional(),
//     })
//     .strict()
//     .optional(),
//   run_summary: z.any().optional(),
//   userMessage: z.string(),
//   history: z
//     .array(
//       z.object({
//         role: z.union([z.literal("user"), z.literal("assistant")]),
//         content: z.string(),
//       }).strict()
//     )
//     .optional(),
//   preferences: z
//     .object({
//       verbosity: z.union([z.literal("short"), z.literal("normal"), z.literal("detailed")]).optional(),
//       voice: z.boolean().optional(),
//     })
//     .strict()
//     .optional(),
// }).strict();
// export type ChatIn = z.infer<typeof ChatInSchema>;
// export const ChatOutSchema = z.object({
//   reply: z.string(),
//   nextActions: z.array(z.string()).optional(),
//   suggestedEdits: z
//     .array(
//       z.object({
//         type: z.literal("diff"),
//         language: z.string(),
//         patch: z.string(),
//       }).strict()
//     )
//     .optional(),
//   pointAt: z.object({ startLine: z.number().int(), endLine: z.number().int(), reason: z.string() }).optional(),
//   unlock: z.object({ l2: z.boolean().optional(), l3: z.boolean().optional() }).optional(),
//   speak: z.string().optional(),
//   metadata: z.object({ confidence: z.number().min(0).max(1) }).optional(),
// }).strict();
// export type ChatOut = z.infer<typeof ChatOutSchema>;
// /* ------------------------------ parse helpers ----------------------------- */
// export function parseEvaluateIn(body: unknown): EvaluateIn {
//   return EvaluateInSchema.parse(body);
// }
// export function parseAnalyzeIn(body: unknown): AnalyzeIn {
//   return AnalyzeInSchema.parse(body);
// }
// export function parseSpeakIn(body: unknown): SpeakIn {
//   return SpeakInSchema.parse(body);
// }
// export function parseChatIn(body: unknown): ChatIn {
//   return ChatInSchema.parse(body);
// }
const zod_1 = require("zod");
const TestCaseSchema = zod_1.z.object({
    in: zod_1.z.array(zod_1.z.any()),
    out: zod_1.z.any(),
}).strict();
exports.EvaluateInSchema = zod_1.z.object({
    source: zod_1.z.string().min(1),
    lang: zod_1.z.literal('python'),
    tests: zod_1.z.array(TestCaseSchema).min(1),
    timeoutSec: zod_1.z.number().int().positive().max(60).optional(),
}).strict();
exports.EvaluateOutSchema = zod_1.z.object({
    passCount: zod_1.z.number().int().nonnegative(),
    failCount: zod_1.z.number().int().nonnegative(),
    failures: zod_1.z.array(zod_1.z.object({
        index: zod_1.z.number().int().nonnegative(),
        input: zod_1.z.array(zod_1.z.any()).optional().default([]),
        expected: zod_1.z.any().optional(),
        got: zod_1.z.any().optional(),
        error: zod_1.z.string().optional(),
    }).strict()),
}).strict();
exports.AnalyzeInSchema = zod_1.z.object({
    source: zod_1.z.string().optional(),
    lang: zod_1.z.string().optional(),
    context: zod_1.z.object({
        platform: zod_1.z.string().optional(),
        filename: zod_1.z.string().optional(),
        problemTitle: zod_1.z.string().optional(),
        problemText: zod_1.z.string().optional(),
    }).strict().optional(),
    failures: zod_1.z.array(zod_1.z.any()).optional(),
}).strict();
exports.AnalyzeOutSchema = zod_1.z.object({
    levels: zod_1.z.array(zod_1.z.object({
        level: zod_1.z.union([zod_1.z.literal(1), zod_1.z.literal(2), zod_1.z.literal(3)]),
        text: zod_1.z.string(),
        steps: zod_1.z.array(zod_1.z.string()).optional(),
    }).strict()).length(3),
    complexity: zod_1.z.object({ time: zod_1.z.string(), space: zod_1.z.string() }).strict(),
    summary: zod_1.z.string(),
    suggested_tests: zod_1.z.array(TestCaseSchema).optional(),
}).strict();
exports.SpeakInSchema = zod_1.z.object({ text: zod_1.z.string().min(1).max(200) }).strict();
exports.SpeakOutSchema = zod_1.z.object({ audio: zod_1.z.string().startsWith("data:audio/") }).strict();
exports.ChatInSchema = zod_1.z.object({
    mode: zod_1.z.union([zod_1.z.literal('coach'), zod_1.z.literal('chat'), zod_1.z.literal('answer')]),
    lang: zod_1.z.string(),
    source: zod_1.z.string().optional(),
    context: zod_1.z.object({
        platform: zod_1.z.string().optional(),
        filename: zod_1.z.string().optional(),
        problemTitle: zod_1.z.string().optional(),
        problemText: zod_1.z.string().optional(),
    }).strict().optional(),
    run_summary: zod_1.z.any().optional(),
    userMessage: zod_1.z.string(),
    history: zod_1.z.array(zod_1.z.object({
        role: zod_1.z.union([zod_1.z.literal('user'), zod_1.z.literal('assistant')]),
        content: zod_1.z.string(),
    }).strict()).optional(),
    preferences: zod_1.z.object({
        verbosity: zod_1.z.union([zod_1.z.literal('short'), zod_1.z.literal('normal'), zod_1.z.literal('detailed')]).optional(),
        voice: zod_1.z.boolean().optional(),
    }).strict().optional(),
}).strict();
exports.ChatOutSchema = zod_1.z.object({
    reply: zod_1.z.string(),
    nextActions: zod_1.z.array(zod_1.z.string()).optional(),
    suggestedEdits: zod_1.z.array(zod_1.z.object({
        type: zod_1.z.literal('diff'),
        language: zod_1.z.string(),
        patch: zod_1.z.string(),
    }).strict()).optional(),
    pointAt: zod_1.z.object({
        startLine: zod_1.z.number().int(),
        endLine: zod_1.z.number().int(),
        reason: zod_1.z.string()
    }).optional(), // OMIT in answer mode
    unlock: zod_1.z.object({
        l2: zod_1.z.boolean(),
        l3: zod_1.z.boolean()
    }).optional(), // OMIT in answer mode
    speak: zod_1.z.string().optional(),
    metadata: zod_1.z.object({ confidence: zod_1.z.number().min(0).max(1) }).optional(),
}).strict();
