import { Router } from "express";
import { SpeakInSchema, SpeakOutSchema } from "../lib/schema";
import { speak as elevenSpeak } from "../lib/eleven";

const router = Router();

router.post("/", async (req, res) => {
  try {
    // Accept either a raw JSON string or an object { text: string }
    let text: string;
    if (typeof req.body === "string") {
      text = req.body;
    } else {
      const parsed = SpeakInSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ error: "Invalid request", details: parsed.error.flatten() });
      }
      text = parsed.data.text;
    }

    // Clamp to keep ElevenLabs fast/cheap
    text = String(text).slice(0, 200).trim();
    if (!text) return res.status(400).json({ error: "Empty text" });

    const audio = await elevenSpeak(text);

    // Normalize output to schema: { audio: dataUrl }
    const out = SpeakOutSchema.parse({ audio });
    return res.json(out);
  } catch (err: any) {
    const msg = err?.response?.data || err?.message || "Speak error";
    return res.status(500).json({ error: String(msg) });
  }
});

export default router;
