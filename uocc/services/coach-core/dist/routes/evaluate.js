"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const schema_1 = require("../lib/schema");
const pythonRunner_1 = require("../lib/pythonRunner");
const router = (0, express_1.Router)();
router.post('/', async (req, res) => {
    const parsed = schema_1.EvaluateInSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    }
    const { source, lang, tests, timeoutSec } = parsed.data;
    try {
        const result = await (0, pythonRunner_1.runPythonTests)(source, tests, timeoutSec);
        const out = schema_1.EvaluateOutSchema.parse(result);
        return res.json(out);
    }
    catch (err) {
        return res.status(500).json({ error: err?.message || 'Evaluation error' });
    }
});
exports.default = router;
