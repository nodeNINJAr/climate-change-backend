import dotenv from 'dotenv';
import Config from '../models/configModel';
import { DamageLevel } from '../type/index';

dotenv.config();

const configData = [
  { name: DamageLevel.SEVERELY_DAMAGE, value: 0 },
  { name: DamageLevel.MODERATELY_DAMAGE, value: 0.50 },
  { name: DamageLevel.SLIGHTLY_DAMAGE, value: 0.75 },
  { name: DamageLevel.NO_DAMAGE, value: 1.0 }
];

export const seedConfigs = async (): Promise<void> => {
  try {
    await Config.deleteMany({});
    await Config.insertMany(configData);

    console.log('Config data seeded successfully!');
    console.log('Seeded configs:', configData);

  } catch (error) {
    console.error('Error seeding config data:', error);
    throw error; // Let caller handle it
  }
};
