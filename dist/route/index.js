"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const entryController = __importStar(require("../controllers/entryController"));
const criteriaController = __importStar(require("../controllers/criteriaContoller"));
const configController = __importStar(require("../controllers/configController"));
const calculatorController = __importStar(require("../controllers/calculatorController"));
const router = express_1.default.Router();
router.get('/entries', entryController.getAllEntries);
router.get('/entries/division/:division', entryController.getEntriesByDivision);
router.get('/entries/:id', entryController.getEntryById);
router.post('/entries', entryController.createEntry);
router.put('/entries/:id', entryController.updateEntry);
router.delete('/entries/:id', entryController.deleteEntry);
router.get('/criteria/entry/:entryId', criteriaController.getCriteriaByEntry);
router.post('/criteria', criteriaController.createCriteria);
router.put('/criteria/:id', criteriaController.updateCriteria);
router.delete('/criteria/:id', criteriaController.deleteCriteria);
router.get('/configs', configController.getAllConfigs);
router.get('/calculate/division/:division', calculatorController.calculateDivisionHazard);
router.post('/generate-division-pdf', calculatorController.generateDivisionPDF);
router.get('/calculations', calculatorController.getCalculationHistory);
router.get('/calculations/:id', calculatorController.getCalculationById);
exports.default = router;
//# sourceMappingURL=index.js.map