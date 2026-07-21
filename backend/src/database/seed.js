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
        const adminEmail = 'Skillbrix@admin.in';
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

        const superAdminEmail = 'superadmin@skillbrix.com';
        let superAdmin = await db_1.prisma.user.findUnique({ where: { email: superAdminEmail } });
        if (!superAdmin) {
            const superAdminHash = await bcryptjs_1.default.hash('SuperAdmin@123', 10);
            superAdmin = await db_1.prisma.user.create({
                data: {
                    email: superAdminEmail,
                    passwordHash: superAdminHash,
                    firstName: 'Global',
                    lastName: 'Super Admin',
                    role: 'SUPER_ADMIN',
                    status: 'ACTIVE',
                    departmentId: null
                }
            });
            logger_1.logger.info(`Seeded Super Admin User: ${superAdminEmail}`);
        }

        // Seed Default Core Academic Subjects if missing
        const defaultSubjects = [
            { name: 'Mathematics', code: 'MATH', description: 'Core Mathematics & Calculus' },
            { name: 'Physics', code: 'PHYS', description: 'Theoretical & Applied Physics' },
            { name: 'Chemistry', code: 'CHEM', description: 'Organic & Inorganic Chemistry' },
            { name: 'Computer Science', code: 'CS', description: 'Software Engineering & Data Structures' },
            { name: 'General Aptitude', code: 'APT', description: 'Logical Reasoning & Quantitative Aptitude' }
        ];

        for (const sub of defaultSubjects) {
            const existingSub = await db_1.prisma.subject.findUnique({ where: { code: sub.code } });
            if (!existingSub) {
                await db_1.prisma.subject.create({
                    data: {
                        name: sub.name,
                        code: sub.code,
                        description: sub.description
                    }
                });
                logger_1.logger.info(`Seeded Default Subject: ${sub.name} (${sub.code})`);
            }
        }

        logger_1.logger.info('Database Seeder: Done.');
    }
    catch (err) {
        logger_1.logger.error(`Database Seeder error: ${err.message}`);
    }
};
exports.seedDatabase = seedDatabase;
