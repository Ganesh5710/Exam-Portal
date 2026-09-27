"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = require("../config/logger");
const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    const isDbConnError = 
        err.code === 'P1001' || 
        err.code === 'P1002' || 
        err.code === 'P2024' || 
        (err.message && (err.message.includes("Can't reach database") || err.message.includes("Closed connection") || err.message.includes("Timed out")));

    if (isDbConnError) {
        statusCode = 503;
        message = 'Database is reconnecting after pause. Please try again in a few seconds.';
    }

    logger_1.logger.error({
        message: err.message,
        stack: err.stack,
        method: req.method,
        url: req.url,
        body: req.body,
    });
    return res.status(statusCode).json({
        success: false,
        message: message,
    });
};
exports.errorHandler = errorHandler;
