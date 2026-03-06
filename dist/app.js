"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const index_1 = __importDefault(require("./route/index"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: process.env.FRONTEND_URL || 'http://localhost:3001', credentials: true }));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/pdfs', express_1.default.static(path_1.default.join(__dirname, '../public/pdfs')));
app.use('/api', index_1.default);
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Climate Hazard Calculator API is running' });
});
exports.default = app;
//# sourceMappingURL=app.js.map