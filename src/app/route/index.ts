import express, {Router} from 'express';
import * as entryController from '../controllers/entryController';
import * as criteriaController from '../controllers/criteriaContoller';
import * as configController from '../controllers/configController';
import * as calculatorController from '../controllers/calculatorController';

const router:Router = express.Router();

// Entry routes
router.get('/entries', entryController.getAllEntries);
router.get('/entries/division/:division', entryController.getEntriesByDivision);
router.get('/entries/:id', entryController.getEntryById);
router.post('/entries', entryController.createEntry);
router.put('/entries/:id', entryController.updateEntry);
router.delete('/entries/:id', entryController.deleteEntry);

// Criteria routes
router.get('/criteria/entry/:entryId', criteriaController.getCriteriaByEntry);
router.post('/criteria', criteriaController.createCriteria);
router.put('/criteria/:id', criteriaController.updateCriteria);
router.delete('/criteria/:id', criteriaController.deleteCriteria);

// Config routes
router.get('/configs', configController.getAllConfigs);

// Calculator routes
router.get('/calculate/division/:division', calculatorController.calculateDivisionHazard); // ← CHANGED TO GET
router.post('/generate-division-pdf', calculatorController.generateDivisionPDF);
router.get('/calculations', calculatorController.getCalculationHistory);
router.get('/calculations/:id', calculatorController.getCalculationById);

export default router;