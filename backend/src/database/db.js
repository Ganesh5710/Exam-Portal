"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../config/logger");
const dbUrl = process.env.DATABASE_URL || '';
const formattedUrl = dbUrl && !dbUrl.includes('connection_limit')
  ? (dbUrl.includes('?') ? `${dbUrl}&connection_limit=5&pool_timeout=15` : `${dbUrl}?connection_limit=5&pool_timeout=15`)
  : dbUrl;

const prisma = new client_1.PrismaClient({
    datasources: dbUrl ? { db: { url: formattedUrl } } : undefined,
    log: [
        { level: 'warn', emit: 'stdout' },
        { level: 'error', emit: 'stdout' },
    ],
});
exports.prisma = prisma;
// Bind queries to logger in development
if (process.env.NODE_ENV !== 'production') {
    prisma.$on('query', (e) => {
        logger_1.logger.debug(`Prisma Query: ${e.query} | Params: ${e.params} | Duration: ${e.duration}ms`);
    });
}
exports.default = prisma;
