import { Request, Response } from 'express';
import Entry from '../models/entryModel';
import Criteria from '../models/criteriaModel';

export const getAllEntries = async (req: Request, res: Response): Promise<void> => {
  try {
    const entries = await Entry.find().sort({ createdDate: -1 });
    res.json({ success: true, data: entries });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const getEntriesByDivision = async (req: Request, res: Response): Promise<void> => {
  try {
    const { division } = req.params;
    const entries = await Entry.find({ division }).sort({ createdDate: -1 });
    res.json({ success: true, data: entries });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const getEntryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const entry = await Entry.findById(id);
    if (!entry) {
      res.status(404).json({ success: false, message: 'Entry not found' });
      return;
    }
    const criteria = await Criteria.find({ entryId: id });
    res.json({ success: true, data: { entry, criteria } });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const createEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { division, climateHazardCategory } = req.body;
    const entry = new Entry({ division, climateHazardCategory });
    await entry.save();
    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const updateEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { division, climateHazardCategory } = req.body;
    const entry = await Entry.findByIdAndUpdate(id, { division, climateHazardCategory, updatedDate: new Date() }, { new: true, runValidators: true });
    if (!entry) {
      res.status(404).json({ success: false, message: 'Entry not found' });
      return;
    }
    res.json({ success: true, data: entry });
  } catch (error) {
    res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const deleteEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const entry = await Entry.findByIdAndDelete(id);
    if (!entry) {
      res.status(404).json({ success: false, message: 'Entry not found' });
      return;
    }
    await Criteria.deleteMany({ entryId: id });
    res.json({ success: true, message: 'Entry and associated criteria deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
  }
};