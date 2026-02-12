// src/database/seed.ts
import 'dotenv/config';
import 'reflect-metadata';
import { AppDataSource } from '../data-source.js';
//import { seedCaseTypes } from './seeds/case-types.seeder.js';
import { seedLocations } from './seeds/locations.seeder.js';
import { seedUsers } from './seeds/users.seeder.js';
import { seedEstablishments } from './seeds/establishments.seeder.js';
import { seedSettings } from './seeds/settings.seeder.js'; // <-- Import
const runSeed = async () => {
    try {
        console.log('🌱 Starting Database Reset & Seed...');
        // 1. IMPORTANT: Override the default config.
        // We disable 'synchronize' here to prevent the connection from crashing
        // due to the Foreign Key violation before we have a chance to drop the tables.
        AppDataSource.setOptions({ synchronize: false });
        // 2. Initialize Connection
        await AppDataSource.initialize();
        // 3. Drop All Tables (The "Drop" step)
        // In TypeORM with Postgres, this drops the public schema content.
        console.log('💥 Dropping existing database schema...');
        await AppDataSource.dropDatabase();
        // 4. Rebuild Schema (The "Remake" step)
        // This creates the tables fresh from your Entities
        console.log('🏗️  Recreating database tables...');
        await AppDataSource.synchronize();
        // 5. Run Seeders (The "Reseed" step)
        console.log('------------------------------------------------');
        //await seedCaseTypes(AppDataSource);
        await seedLocations(AppDataSource);
        await seedEstablishments(AppDataSource);
        await seedUsers(AppDataSource);
        await seedSettings(AppDataSource);
        console.log('------------------------------------------------');
        console.log('🌳 Database Freshly Seeded Successfully!');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Seeding Failed:', error);
        process.exit(1);
    }
};
runSeed();
//# sourceMappingURL=seed.js.map