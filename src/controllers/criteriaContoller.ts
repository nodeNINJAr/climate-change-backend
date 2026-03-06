import { Request, Response } from 'express';
import Criteria from '../models/criteriaModel';
import Entry from '../models/entryModel';

export const getCriteriaByEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { entryId } = req.params;
    const criteria = await Criteria.find({ entryId });
    res.json({ success: true, data: criteria });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const createCriteria = async (req: Request, res: Response): Promise<void> => {
  try {
    const { entryId, criteriaTitle, weight } = req.body;  // ← ADD weight here
    
    const entry = await Entry.findById(entryId);
    if (!entry) {
      res.status(404).json({ success: false, message: 'Entry not found' });
      return;
    }
    
    const criteria = new Criteria({ 
      entryId, 
      criteriaTitle,
      weight  // ← SAVE weight!
    });
    
    await criteria.save();
    res.status(201).json({ success: true, data: criteria });
  } catch (error) {
    res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const updateCriteria = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { criteriaTitle, weight } = req.body;  // ← ADD weight here
    
    const criteria = await Criteria.findByIdAndUpdate(
      id, 
      { criteriaTitle, weight },  // ← UPDATE weight!
      { new: true, runValidators: true }
    );
    
    if (!criteria) {
      res.status(404).json({ success: false, message: 'Criteria not found' });
      return;
    }
    
    res.json({ success: true, data: criteria });
  } catch (error) {
    res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const deleteCriteria = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const criteria = await Criteria.findByIdAndDelete(id);
    
    if (!criteria) {
      res.status(404).json({ success: false, message: 'Criteria not found' });
      return;
    }
    
    res.json({ success: true, message: 'Criteria deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
  }
};