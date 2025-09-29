### Project brief

PROJECT: UOCC (Universal Overlay Coding Coach) — VS Code MVP (Python-first)

GOAL
A visible, local-first coding coach inside VS Code:
- Analyze code open in your editor + problem text
- Give Level 1/L2/L3 hints (escalating)
- Run real tests (Python subprocess) to give you L2
- Optional voice (ElevenLabs)
- Modes: Coach (default) / Answer (fast solution) / Chat (Q&A)

<a href="https://x.com/NSURYA10/status/1970719039124365495">Demo</a>

SURFACES
- VS Code extension (webview panel + editor decorations)
- Backend "coach-core" HTTP service
- Python evaluator subprocess for truth loop

LANG
- Coaching supports any language textually, but MVP evaluation runs PYTHON ONLY.

SECURITY/UX
- Visible and user-triggered (no stealth)
- Timeouts on eval; no FS/network access in user code
- Clamp LLM output; strict JSON
- L3 unlocks only after a failed run (Coach mode)

DELIVERABLES (MVP)
- evaluate (Python runner): pass/fail with failures[]
- analyze (LLM → L1/L2/L3 + complexity)
- speak (ElevenLabs TTS, short lines)
- chat (optional; conversational tutor JSON)
- VS Code command "uocc.coachFile" → webview with Mode toggle + buttons
- Decorations: highlight range on L3 and show hover message

# UOCC
UOCC (Universal Overlay Coding Coach)

### Acceptance (MVP)

- [ ] evaluate returns 0/3 fail on intentionally wrong Python solution
- [ ] evaluate returns 3/3 pass on correct Python solution
- [ ] analyze (stub) returns L1/L2/L3 + complexity + summary
- [ ] Webview: Analyze shows L1; Reveal shows L2; L3 locked
- [ ] Run checks failure unlocks L3 and applies decoration on range
- [ ] Speak plays audio (≤200 chars)
- [ ] Toggle Answer mode: Run checks hidden; Answer returns solution+complexity
- [ ] Basic metrics sent to /metrics/event

### Voice features (MVP)
- [ ] Mic button records 4s, /stt returns transcript
- [ ] /chat reply renders; if Voice ON, TTS plays
- [ ] Coach flow still works; Answer mode unaffected
- [ ] (Optional) /s2s endpoint returns converted audio for a sample clip
