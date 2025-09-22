"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const eleven_1 = require("../lib/eleven");
const router = (0, express_1.Router)();
router.post('/', async (req, res) => {
    try {
        const { audio, targetVoiceId } = req.body || {};
        if (!audio)
            return res.status(400).json({ error: 'audio required' });
        const out = await (0, eleven_1.voiceConvert)(String(audio), targetVoiceId ? String(targetVoiceId) : undefined);
        res.json({ audio: out });
    }
    catch (e) {
        res.status(500).json({ error: e?.message || 's2s error' });
    }
});
exports.default = router;
