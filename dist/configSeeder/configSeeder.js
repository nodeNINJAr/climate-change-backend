"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedConfigs = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const configModel_1 = __importDefault(require("../models/configModel"));
const index_1 = require("../type/index");
dotenv_1.default.config();
const configData = [
    { name: index_1.DamageLevel.SEVERELY_DAMAGE, value: 0 },
    { name: index_1.DamageLevel.MODERATELY_DAMAGE, value: 0.50 },
    { name: index_1.DamageLevel.SLIGHTLY_DAMAGE, value: 0.75 },
    { name: index_1.DamageLevel.NO_DAMAGE, value: 1.0 }
];
const seedConfigs = async () => {
    try {
        await configModel_1.default.deleteMany({});
        await configModel_1.default.insertMany(configData);
        console.log('Config data seeded successfully!');
        console.log('Seeded configs:', configData);
    }
    catch (error) {
        console.error('Error seeding config data:', error);
        throw error;
    }
};
exports.seedConfigs = seedConfigs;
//# sourceMappingURL=configSeeder.js.map