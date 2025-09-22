"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const analyze_1 = __importDefault(require("./routes/analyze"));
const evaluate_1 = __importDefault(require("./routes/evaluate"));
const speak_1 = __importDefault(require("./routes/speak"));
const chat_1 = __importDefault(require("./routes/chat"));
const metrics_1 = __importDefault(require("./routes/metrics"));
const stt_1 = __importDefault(require("./routes/stt"));
const s2s_1 = __importDefault(require("./routes/s2s"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '5mb' }));
app.get('/', (_req, res) => {
    res.json({ ok: true, name: 'uocc-coach-core' });
});
app.use('/analyze', analyze_1.default);
app.use('/evaluate', evaluate_1.default);
app.use('/speak', speak_1.default);
app.use('/chat', chat_1.default);
app.use('/metrics', metrics_1.default);
app.use('/stt', stt_1.default);
app.use('/s2s', s2s_1.default);
const port = Number(process.env.PORT || 4321);
if (require.main === module) {
    app.listen(port, () => {
        // eslint-disable-next-line no-console
        console.log(`[coach-core] listening on http://localhost:${port}`);
    });
}
exports.default = app;
