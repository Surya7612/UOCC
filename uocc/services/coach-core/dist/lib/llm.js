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
    const system = [
        'You are a senior coding interview tutor. Output STRICT JSON.',
        '- L1: conceptual nudge (<=80 words)',
        '- L2: approach/pseudocode (<=100 words)',
        '- L3: code-adjacent guidance (<=120 words) — no full solution unless tests are failing.',
        '- Include complexity: time/space Big-O.',
        '- If failures provided, tie L3 to specific failure causes.',
        '- Keys only: levels[], complexity{time,space}, summary (<=120 chars), suggested_tests[].',
        '- No extra text.'
    ].join('\n');
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
        let resp = await request();
        let text = resp.choices[0]?.message?.content || '{}';
        try {
            return JSON.parse(text);
        }
        catch {
            // retry once
            resp = await request('Return valid JSON only.');
            text = resp.choices[0]?.message?.content || '{}';
            return JSON.parse(text);
        }
    }
    catch (_) {
        return twoSumFallback();
    }
}
async function chatTutorJSON(input) {
    const system = [
        'You are UOCC, a coding tutor.',
        'Rules:',
        '- Be concise and actionable. Prefer steps over paragraphs.',
        '- NEVER claim to have executed code. Use run_summary for facts.',
        '- Coach mode: escalate L1->L2->L3; only give code-adjacent if tests fail or user insists.',
        '- Return STRICT JSON with keys:',
        '  reply, nextActions[], suggestedEdits[], pointAt{startLine,endLine,reason}, unlock{l2,l3}, speak (<=160 chars), metadata{confidence}.',
        '- No extra text.'
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
            { level: 1, text: 'Think about using a hash map to track complements.' },
            { level: 2, text: 'Iterate once; for each number x at i, check if target-x was seen.', steps: ['Initialize map', 'For each i, if (target-x) in map, return [map[target-x], i]'] },
            { level: 3, text: 'Use O(n) time, O(n) space with a dictionary storing value->index.' }
        ],
        complexity: { time: 'O(n)', space: 'O(n)' },
        summary: 'Single pass hashmap approach returns indices that sum to target.',
        suggested_tests: [{ in: [[2, 7, 11, 15], 9], out: [0, 1] }]
    };
}
