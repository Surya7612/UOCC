"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const eleven_1 = require("../lib/eleven");
const router = (0, express_1.Router)();
router.post('/', async (req, res) => {
    try {
        const { audio, mime } = req.body || {};
        if (!audio)
            return res.status(400).json({ error: 'audio required' });
        const text = await (0, eleven_1.transcribe)(String(audio), String(mime || 'audio/webm'));
        res.json({ text });
    }
    catch (e) {
        res.status(500).json({ error: e?.message || 'stt error' });
    }
});
exports.default = router;
