"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const schema_1 = require("../lib/schema");
const eleven_1 = require("../lib/eleven");
const router = (0, express_1.Router)();
router.post('/', async (req, res) => {
    const parsed = schema_1.SpeakInSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    }
    try {
        const result = await (0, eleven_1.speak)(parsed.data.text);
        const out = schema_1.SpeakOutSchema.parse(result);
        return res.json(out);
    }
    catch (err) {
        return res.status(500).json({ error: err?.message || 'Speak error' });
    }
});
exports.default = router;
