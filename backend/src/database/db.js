"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../config/logger");
let dbUrl = process.env.DATABASE_URL || '';
if (dbUrl.includes(':6543')) {
  dbUrl = dbUrl.replace(':6543', ':5432').replace('?pgbouncer=true', '').replace('&pgbouncer=true', '');
}

const formattedUrl = dbUrl && !dbUrl.includes('connection_limit')
  ? (dbUrl.includes('?') ? `${dbUrl}&connection_limit=10&pool_timeout=30` : `${dbUrl}?connection_limit=10&pool_timeout=30`)
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
