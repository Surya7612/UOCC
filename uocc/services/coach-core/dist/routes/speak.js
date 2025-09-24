"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const schema_1 = require("../lib/schema");
const eleven_1 = require("../lib/eleven");
const router = (0, express_1.Router)();
router.post("/", async (req, res) => {
    try {
        // Accept either a raw JSON string or an object { text: string }
        let text;
        if (typeof req.body === "string") {
            text = req.body;
        }
        else {
            const parsed = schema_1.SpeakInSchema.safeParse(req.body);
            if (!parsed.success) {
                return res
                    .status(400)
                    .json({ error: "Invalid request", details: parsed.error.flatten() });
            }
            text = parsed.data.text;
        }
        // Clamp to keep ElevenLabs fast/cheap
        text = String(text).slice(0, 200).trim();
        if (!text)
            return res.status(400).json({ error: "Empty text" });
        const audio = await (0, eleven_1.speak)(text);
        // Normalize output to schema: { audio: dataUrl }
        const out = schema_1.SpeakOutSchema.parse({ audio });
        return res.json(out);
    }
    catch (err) {
        const msg = err?.response?.data || err?.message || "Speak error";
        return res.status(500).json({ error: String(msg) });
    }
});
exports.default = router;
