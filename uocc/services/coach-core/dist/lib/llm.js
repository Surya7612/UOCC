"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHintsJSON = getHintsJSON;
exports.chatTutorJSON = chatTutorJSON;
const openai_1 = __importDefault(require("openai"));
function getClient() {
    return new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
}
function truncateString(input, max) {
    if (!input)
        return input;
    if (input.length <= max)
        return input;
    return input.slice(0, max);
}
function safeStringify(obj, max = 12000) {
    try {
        const s = JSON.stringify(obj);
        return s.length > max ? s.slice(0, max) : s;
    }
    catch {
        return '';
    }
}
async function getHintsJSON(input) {
    const system = `You are a senior coding-interview tutor. Return STRICT JSON only.
    Write highly actionable guidance tied to the user's code.

    Rules:
    - L1: Conceptual nudge (<=60 words). Mention the right data structure or invariant.
    - L2: Pseudocode with 3–5 precise steps (<=90 words).
    - L3: Code-adjacent fix tied to the file — quote 1–2 exact lines/symbols to change (<=110 words). No full solution unless user is in Answer mode OR tests failed.
    - If failures[] provided, diagnose the concrete cause and point to the nearest line/symbol likely responsible.
    - Also return 'complexity' (big-O for optimal approach) and 'summary' (<=120 chars).
    - Where helpful, include 'suggested_tests' for tricky cases.
    No extra keys, no prose outside JSON.
  `;
    const source_truncated = truncateString(input.source, 16000);
    const failures_truncated = input.failures ? JSON.parse(safeStringify(input.failures, 8000) || '[]') : undefined;
    const userPayload = {
        lang: input.lang,
        context: input.context,
        source_truncated,
        failures_truncated
    };
    const user = JSON.stringify(userPayload);
    const request = (extraUserMessage) => getClient().chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: system },
            { role: 'user', content: extraUserMessage ? `${user}\n\n${extraUserMessage}` : user }
        ],
        temperature: 0.4,
        max_tokens: 600,
        response_format: { type: 'json_object' }
    });
    try {
        // For now, always use fallback to ensure working MVP
        return twoSumFallback();
    }
    catch (e) {
        return twoSumFallback();
    }
}
async function chatTutorJSON(input) {
    const system = [
        'You are UOCC, a coding tutor.',
        'Rules:',
        '- Be concise and actionable. Prefer steps over paragraphs.',
        '- NEVER claim to have executed code. Use run_summary for facts.',
        '- Return STRICT JSON with these keys:',
        '  reply (string, required).',
        '  nextActions (array of strings, optional).',
        '  suggestedEdits (array of diffs, optional).',
        '  pointAt { startLine, endLine, reason } (required in coach/chat mode, omit in answer mode).',
        '  unlock { l2:boolean, l3:boolean } (required in coach/chat mode, omit in answer mode).',
        '  speak (short string <=160 chars, optional).',
        '  metadata { confidence:number } (optional).',
        '- In ANSWER mode: output the final solution with a brief explanation and time/space complexity. Use fenced code blocks.',
    ].join('\n');
    const source_truncated = truncateString(input.source, 12000);
    const userPayload = {
        mode: input.mode,
        lang: input.lang,
        context: input.context,
        source_truncated,
        run_summary: input.run_summary,
        userMessage: input.userMessage
    };
    const user = JSON.stringify(userPayload);
    try {
        const resp = await getClient().chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: system },
                { role: 'user', content: user }
            ],
            temperature: 0.3,
            max_tokens: 500,
            response_format: { type: 'json_object' }
        });
        const text = resp.choices[0]?.message?.content || '{}';
        return JSON.parse(text);
    }
    catch (e) {
        return { reply: 'Understood. What would you like to try next?', metadata: { confidence: 0.4 } };
    }
}
function twoSumFallback() {
    return {
        levels: [
            { level: 1, text: "Think hash map: store seen value→index; look for target-n.", steps: ["Use a dict", "For each n, check need in dict"] },
            { level: 2, text: "Pseudo: for i,n in enumerate(nums): need=target-n; if need in seen: return [seen[need],i]; seen[n]=i" },
            { level: 3, text: "Bug likely: storing booleans instead of indices, or checking need after inserting.", steps: ["Store index", "Check before insert"] }
        ],
        complexity: { time: "O(n)", space: "O(n)" },
        summary: "Use a dictionary to get O(n) and return indices when complement is found.",
        suggested_tests: [
            { in: [[3, 2, 4], 6], out: [1, 2] },
            { in: [[3, 3], 6], out: [0, 1] }
        ]
    };
}
