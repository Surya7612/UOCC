"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const schema_1 = require("../lib/schema");
const llm_1 = require("../lib/llm");
const router = (0, express_1.Router)();
router.post('/', async (req, res) => {
    // Validate request
    const parsedIn = schema_1.ChatInSchema.safeParse(req.body);
    if (!parsedIn.success) {
        return res.status(400).json({ error: 'Invalid request', details: parsedIn.error.flatten() });
    }
    try {
        const ai = await (0, llm_1.chatTutorJSON)(parsedIn.data);
        // ---- sanitize partial unlock from the model (common in Answer mode) ----
        if (ai && typeof ai === 'object' && 'unlock' in ai && ai.unlock) {
            const u = ai.unlock;
            const badL2 = typeof u?.l2 !== 'boolean';
            const badL3 = typeof u?.l3 !== 'boolean';
            // if both missing, drop unlock; if one missing, drop the missing prop
            if (badL2 && badL3) {
                delete ai.unlock;
            }
            else {
                if (badL2)
                    delete ai.unlock.l2;
                if (badL3)
                    delete ai.unlock.l3;
            }
        }
        const out = schema_1.ChatOutSchema.parse(ai);
        return res.json(out);
    }
    catch (err) {
        return res.status(500).json({ error: err?.message || 'Chat error' });
    }
});
exports.default = router;
