"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const schema_1 = require("../lib/schema");
const llm_1 = require("../lib/llm");
const router = (0, express_1.Router)();
router.post('/', async (req, res) => {
    const parsed = schema_1.ChatInSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    }
    try {
        const result = await (0, llm_1.chatTutorJSON)(parsed.data);
        const out = schema_1.ChatOutSchema.parse(result);
        return res.json(out);
    }
    catch (err) {
        return res.status(500).json({ error: err?.message || 'Chat error' });
    }
});
exports.default = router;
