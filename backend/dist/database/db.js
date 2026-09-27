"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPrismaConnection = exports.prisma = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../config/logger");

const rawDbUrl = process.env.DATABASE_URL || '';

const getFormattedUrl = (url) => {
    if (!url) return url;
    let u = url;

    // Remove forced 6543 replacement to keep PgBouncer / Supavisor pooler intact if configured
    if (!u.includes('connection_limit')) {
        const sep = u.includes('?') ? '&' : '?';
        u = `${u}${sep}connection_limit=15&pool_timeout=20&connect_timeout=15`;
    }
    return u;
};

const createPrismaClient = () => {
    const formattedUrl = getFormattedUrl(rawDbUrl);
    return new client_1.PrismaClient({
        datasources: rawDbUrl ? { db: { url: formattedUrl } } : undefined,
        log: [
            { level: 'warn', emit: 'stdout' },
            { level: 'error', emit: 'stdout' },
        ],
    });
};

let prisma = createPrismaClient();
exports.prisma = prisma;

/**
 * Forcefully disconnects and reconnects the Prisma database client
 * to flush dead socket connections after Supabase database pauses/resumes.
 */
const resetPrismaConnection = async () => {
    try {
        logger_1.logger.warn("Flushing dead database connections and reconnecting to Supabase...");
        await prisma.$disconnect().catch(() => {});
        await new Promise(r => setTimeout(r, 1000));
        await prisma.$connect().catch(e => logger_1.logger.error(`Reconnection error: ${e.message}`));
        logger_1.logger.info("Prisma database connection successfully refreshed.");
    } catch (err) {
        logger_1.logger.error(`Failed to reset Prisma database connection: ${err.message}`);
    }
};
exports.resetPrismaConnection = resetPrismaConnection;

// Attach automatic self-healing reconnect loop every 30 seconds
setInterval(async () => {
    try {
        await prisma.$queryRaw`SELECT 1`;
    } catch (err) {
        logger_1.logger.warn(`Database health check failed (${err.message}). Triggering connection auto-heal...`);
        await resetPrismaConnection();
    }
}, 30000);

exports.default = prisma;
