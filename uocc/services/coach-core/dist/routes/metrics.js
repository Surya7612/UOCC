"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fs_1 = __importDefault(require("fs"));
const router = (0, express_1.Router)();
router.post('/event', async (req, res) => {
    const line = JSON.stringify({ ts: Date.now(), ...req.body }) + '\n';
    fs_1.default.appendFileSync('events.ndjson', line);
    res.json({ ok: true });
});
exports.default = router;
