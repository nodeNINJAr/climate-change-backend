import { Request, Response } from 'express';
import Config from '../models/configModel';

export const getAllConfigs = async (req: Request, res: Response): Promise<void> => {
  try {
    const configs = await Config.find().sort({ value: 1 });
    res.json({ success: true, data: configs });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
  }
};