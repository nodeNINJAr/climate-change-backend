import { Server } from 'http';
import app from './app';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { seedConfigs } from './configSeeder/configSeeder';

dotenv.config();


// 
let server:Server;

const PORT = process.env.PORT || 5000;

const mongoUri = process.env.MONGO_URI;

// 
async function main() {
    if (!mongoUri) {
        throw new Error("MONGO_URI environment variable is not defined.");
    }
    await mongoose.connect(mongoUri);
    if (process.env.NODE_ENV === 'development') {
        await seedConfigs();
    }
    // 
    try{
        server =  app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV}`);
            });
    }
    catch(err){
        console.log(err);
    }
}
main();