"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllConfigs = void 0;
const configModel_1 = __importDefault(require("../models/configModel"));
const getAllConfigs = async (req, res) => {
    try {
        const configs = await configModel_1.default.find().sort({ value: 1 });
        res.json({ success: true, data: configs });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.getAllConfigs = getAllConfigs;
//# sourceMappingURL=configController.js.map