"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const configSeeder_1 = require("./configSeeder/configSeeder");
dotenv_1.default.config();
let server;
const PORT = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI;
async function main() {
    if (!mongoUri) {
        throw new Error("MONGO_URI environment variable is not defined.");
    }
    await mongoose_1.default.connect(mongoUri);
    if (process.env.NODE_ENV === 'development') {
        await (0, configSeeder_1.seedConfigs)();
    }
    try {
        server = app_1.default.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV}`);
        });
    }
    catch (err) {
        console.log(err);
    }
}
main();
//# sourceMappingURL=server.js.map