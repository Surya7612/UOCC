// import { z } from "zod";

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

import { z } from "zod";

const TestCaseSchema = z.object({
  in: z.array(z.any()),
  out: z.any(),
}).strict();

export const EvaluateInSchema = z.object({
  source: z.string().min(1),
  lang: z.literal('python'),
  tests: z.array(TestCaseSchema).min(1),
  timeoutSec: z.number().int().positive().max(60).optional(),
}).strict();

export const EvaluateOutSchema = z.object({
  passCount: z.number().int().nonnegative(),
  failCount: z.number().int().nonnegative(),
  failures: z.array(z.object({
    index: z.number().int().nonnegative(),
    input: z.array(z.any()).optional().default([]),
    expected: z.any().optional(),
    got: z.any().optional(),
    error: z.string().optional(),
  }).strict()),
}).strict();

export const AnalyzeInSchema = z.object({
  source: z.string().optional(),
  lang: z.string().optional(),
  context: z.object({
    platform: z.string().optional(),
    filename: z.string().optional(),
    problemTitle: z.string().optional(),
    problemText: z.string().optional(),
  }).strict().optional(),
  failures: z.array(z.any()).optional(),
}).strict();

export const AnalyzeOutSchema = z.object({
  levels: z.array(z.object({
    level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    text: z.string(),
    steps: z.array(z.string()).optional(),
  }).strict()).length(3),
  complexity: z.object({ time: z.string(), space: z.string() }).strict(),
  summary: z.string(),
  suggested_tests: z.array(TestCaseSchema).optional(),
}).strict();

export const SpeakInSchema = z.object({ text: z.string().min(1).max(200) }).strict();
export const SpeakOutSchema = z.object({ audio: z.string().startsWith("data:audio/") }).strict();

export const ChatInSchema = z.object({
  mode: z.union([z.literal('coach'), z.literal('chat'), z.literal('answer')]),
  lang: z.string(),
  source: z.string().optional(),
  context: z.object({
    platform: z.string().optional(),
    filename: z.string().optional(),
    problemTitle: z.string().optional(),
    problemText: z.string().optional(),
  }).strict().optional(),
  run_summary: z.any().optional(),
  userMessage: z.string(),
  history: z.array(z.object({
    role: z.union([z.literal('user'), z.literal('assistant')]),
    content: z.string(),
  }).strict()).optional(),
  preferences: z.object({
    verbosity: z.union([z.literal('short'), z.literal('normal'), z.literal('detailed')]).optional(),
    voice: z.boolean().optional(),
  }).strict().optional(),
}).strict();

export const ChatOutSchema = z.object({
  reply: z.string(),
  nextActions: z.array(z.string()).optional(),
  suggestedEdits: z.array(z.object({
    type: z.literal('diff'),
    language: z.string(),
    patch: z.string(),
  }).strict()).optional(),
  pointAt: z.object({
    startLine: z.number().int(),
    endLine: z.number().int(),
    reason: z.string()
  }).optional(),              // OMIT in answer mode
  unlock: z.object({
    l2: z.boolean(),
    l3: z.boolean()
  }).optional(),              // OMIT in answer mode
  speak: z.string().optional(),
  metadata: z.object({ confidence: z.number().min(0).max(1) }).optional(),
}).strict();

export type EvaluateIn = z.infer<typeof EvaluateInSchema>;
export type EvaluateOut = z.infer<typeof EvaluateOutSchema>;
export type AnalyzeIn = z.infer<typeof AnalyzeInSchema>;
export type AnalyzeOut = z.infer<typeof AnalyzeOutSchema>;
export type SpeakIn = z.infer<typeof SpeakInSchema>;
export type SpeakOut = z.infer<typeof SpeakOutSchema>;
export type ChatIn = z.infer<typeof ChatInSchema>;
export type ChatOut = z.infer<typeof ChatOutSchema>;
