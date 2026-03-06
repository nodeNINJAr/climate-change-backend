"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEntry = exports.updateEntry = exports.createEntry = exports.getEntryById = exports.getEntriesByDivision = exports.getAllEntries = void 0;
const entryModel_1 = __importDefault(require("../models/entryModel"));
const criteriaModel_1 = __importDefault(require("../models/criteriaModel"));
const getAllEntries = async (req, res) => {
    try {
        const entries = await entryModel_1.default.find().sort({ createdDate: -1 });
        res.json({ success: true, data: entries });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.getAllEntries = getAllEntries;
const getEntriesByDivision = async (req, res) => {
    try {
        const { division } = req.params;
        const entries = await entryModel_1.default.find({ division }).sort({ createdDate: -1 });
        res.json({ success: true, data: entries });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.getEntriesByDivision = getEntriesByDivision;
const getEntryById = async (req, res) => {
    try {
        const { id } = req.params;
        const entry = await entryModel_1.default.findById(id);
        if (!entry) {
            res.status(404).json({ success: false, message: 'Entry not found' });
            return;
        }
        const criteria = await criteriaModel_1.default.find({ entryId: id });
        res.json({ success: true, data: { entry, criteria } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.getEntryById = getEntryById;
const createEntry = async (req, res) => {
    try {
        const { division, climateHazardCategory } = req.body;
        const entry = new entryModel_1.default({ division, climateHazardCategory });
        await entry.save();
        res.status(201).json({ success: true, data: entry });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.createEntry = createEntry;
const updateEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const { division, climateHazardCategory } = req.body;
        const entry = await entryModel_1.default.findByIdAndUpdate(id, { division, climateHazardCategory, updatedDate: new Date() }, { new: true, runValidators: true });
        if (!entry) {
            res.status(404).json({ success: false, message: 'Entry not found' });
            return;
        }
        res.json({ success: true, data: entry });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.updateEntry = updateEntry;
const deleteEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const entry = await entryModel_1.default.findByIdAndDelete(id);
        if (!entry) {
            res.status(404).json({ success: false, message: 'Entry not found' });
            return;
        }
        await criteriaModel_1.default.deleteMany({ entryId: id });
        res.json({ success: true, message: 'Entry and associated criteria deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.deleteEntry = deleteEntry;
//# sourceMappingURL=entryController.js.map