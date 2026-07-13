"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = void 0;
/**
 * seed.ts
 * Database seeder that runs at application startup.
 * Creates default department, subject, admin user, and student user
 * if they do not already exist in the database.
 */
const db_1 = require("./db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const logger_1 = require("../config/logger");
const seedDatabase = async () => {
    try {
        logger_1.logger.info('Database Seeder: Initializing Admin user check...');
        const adminEmail = 'admin@admin.in';
        let admin = await db_1.prisma.user.findUnique({ where: { email: adminEmail } });
        if (!admin) {
            const adminHash = await bcryptjs_1.default.hash('Admin@123', 10);
            admin = await db_1.prisma.user.create({
                data: {
                    email: adminEmail,
                    passwordHash: adminHash,
                    firstName: 'System',
                    lastName: 'Administrator',
                    role: 'ADMIN',
                    status: 'ACTIVE',
                    departmentId: null
                }
            });
            logger_1.logger.info(`Seeded Admin User: ${adminEmail}`);
        }
        logger_1.logger.info('Database Seeder: Done.');
    }
    catch (err) {
        logger_1.logger.error(`Database Seeder error: ${err.message}`);
    }
};
exports.seedDatabase = seedDatabase;
