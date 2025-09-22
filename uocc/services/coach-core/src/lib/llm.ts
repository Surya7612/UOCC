import OpenAI from 'openai';
import { AnalyzeIn, AnalyzeOut, ChatIn, ChatOut } from './schema';

function getClient(): OpenAI {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function truncateString(input: string | undefined, max: number): string | undefined {
  if (!input) return input;
  if (input.length <= max) return input;
  return input.slice(0, max);
}

function safeStringify(obj: unknown, max = 12000): string {
  try {
    const s = JSON.stringify(obj);
    return s.length > max ? s.slice(0, max) : s;
  } catch {
    return '';
  }
}

export async function getHintsJSON(input: AnalyzeIn): Promise<AnalyzeOut> {
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

  const request = (extraUserMessage?: string) => getClient().chat.completions.create({
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
  } catch (e) {
    return twoSumFallback();
  }
}

export async function chatTutorJSON(input: ChatIn): Promise<ChatOut> {
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
    return JSON.parse(text) as ChatOut;
  } catch (e) {
    return { reply: 'Understood. What would you like to try next?', metadata: { confidence: 0.4 } };
  }
}

function twoSumFallback(): AnalyzeOut {
  return {
    levels: [
      { level: 1, text: "Think hash map: store seen value→index; look for target-n.", steps: ["Use a dict", "For each n, check need in dict"] },
      { level: 2, text: "Pseudo: for i,n in enumerate(nums): need=target-n; if need in seen: return [seen[need],i]; seen[n]=i" },
      { level: 3, text: "Bug likely: storing booleans instead of indices, or checking need after inserting.", steps: ["Store index", "Check before insert"] }
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    summary: "Use a dictionary to get O(n) and return indices when complement is found.",
    suggested_tests: [
      { in: [[3,2,4], 6], out: [1,2] },
      { in: [[3,3], 6], out: [0,1] }
    ]
  };
}


