import mongoose from 'mongoose';
import { config } from '../config/config';
import Logging from '../library/Logging';
import Organizacion from '../models/Organizacion';
import Usuario from '../models/Usuario';

export async function setupDatabase(): Promise<void> {
    try {
        mongoose.set('strictQuery', true);
        await mongoose.connect(config.mongo.url, { retryWrites: true, w: 'majority' });
        Logging.info('Mongo connected successfully.');
    } catch (error) {
        Logging.error(error);
        throw error;
    }
}

export async function seedingDatabase(): Promise<void> {
    try {
        const existingOrgWithUsers = await Organizacion.countDocuments({ usuarios: { $exists: true, $not: { $size: 0 } } });

        if (existingOrgWithUsers > 0) {
            Logging.info('Seed skipped: already existing organizations with users.');
            return;
        }

        Logging.info('Seeding initial organizations and users...');

        const createdOrganizations = await Organizacion.insertMany([
            {
                name: 'Tech Nova',
                usuarios: []
            },
            {
                name: 'Green Foods',
                usuarios: []
            }
        ]);

        const createdUsers = await Usuario.insertMany([
            {
                name: 'Jairo Perez',
                email: 'jairo@seminario.local',
                password: 'secret123',
                organizacion: createdOrganizations[0]._id
            },
            {
                name: 'Marta Ruiz',
                email: 'marta@seminario.local',
                password: 'secret123',
                organizacion: createdOrganizations[0]._id
            },
            {
                name: 'Diego Martin',
                email: 'diego@seminario.local',
                password: 'secret123',
                organizacion: createdOrganizations[1]._id
            }
        ]);

        const techNovaUsers = createdUsers
            .filter((user) => user.organizacion.toString() === createdOrganizations[0]._id.toString())
            .map((user) => user._id);
        const greenFoodsUsers = createdUsers
            .filter((user) => user.organizacion.toString() === createdOrganizations[1]._id.toString())
            .map((user) => user._id);

        await Organizacion.findByIdAndUpdate(createdOrganizations[0]._id, { usuarios: techNovaUsers });
        await Organizacion.findByIdAndUpdate(createdOrganizations[1]._id, { usuarios: greenFoodsUsers });

        Logging.info(`Database ready: ${createdOrganizations.length} organizations and ${createdUsers.length} users created.`);
    } catch (error) {
        Logging.error(error);
        throw error;
    }
}

/** Ejecución directa si se llama al archivo */
if (require.main === module) {
    setupDatabase()
        .then(() => seedingDatabase())
        .then(() => {
            Logging.info('Seeding finished.');
            process.exit(0);
        })
        .catch((error) => {
            Logging.error('Seeding failed:');
            Logging.error(error);
            process.exit(1);
        });
}
