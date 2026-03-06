"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCriteria = exports.updateCriteria = exports.createCriteria = exports.getCriteriaByEntry = void 0;
const criteriaModel_1 = __importDefault(require("../models/criteriaModel"));
const entryModel_1 = __importDefault(require("../models/entryModel"));
const getCriteriaByEntry = async (req, res) => {
    try {
        const { entryId } = req.params;
        const criteria = await criteriaModel_1.default.find({ entryId });
        res.json({ success: true, data: criteria });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.getCriteriaByEntry = getCriteriaByEntry;
const createCriteria = async (req, res) => {
    try {
        const { entryId, criteriaTitle, weight } = req.body;
        const entry = await entryModel_1.default.findById(entryId);
        if (!entry) {
            res.status(404).json({ success: false, message: 'Entry not found' });
            return;
        }
        const criteria = new criteriaModel_1.default({
            entryId,
            criteriaTitle,
            weight
        });
        await criteria.save();
        res.status(201).json({ success: true, data: criteria });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.createCriteria = createCriteria;
const updateCriteria = async (req, res) => {
    try {
        const { id } = req.params;
        const { criteriaTitle, weight } = req.body;
        const criteria = await criteriaModel_1.default.findByIdAndUpdate(id, { criteriaTitle, weight }, { new: true, runValidators: true });
        if (!criteria) {
            res.status(404).json({ success: false, message: 'Criteria not found' });
            return;
        }
        res.json({ success: true, data: criteria });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.updateCriteria = updateCriteria;
const deleteCriteria = async (req, res) => {
    try {
        const { id } = req.params;
        const criteria = await criteriaModel_1.default.findByIdAndDelete(id);
        if (!criteria) {
            res.status(404).json({ success: false, message: 'Criteria not found' });
            return;
        }
        res.json({ success: true, message: 'Criteria deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.deleteCriteria = deleteCriteria;
//# sourceMappingURL=criteriaContoller.js.map