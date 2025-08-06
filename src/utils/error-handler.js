const { defaultLogger } = require('./logger');

class AppError extends Error {
    constructor(message, code = 'UNKNOWN_ERROR', statusCode = 500, details = null) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.timestamp = new Date().toISOString();
        
        Error.captureStackTrace(this, this.constructor);
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            statusCode: this.statusCode,
            details: this.details,
            timestamp: this.timestamp
        };
    }
}

class ValidationError extends AppError {
    constructor(message, details = null) {
        super(message, 'VALIDATION_ERROR', 400, details);
        this.name = 'ValidationError';
    }
}

class ApiError extends AppError {
    constructor(message, statusCode = 500, details = null) {
        super(message, 'API_ERROR', statusCode, details);
        this.name = 'ApiError';
    }
}

class ConfigError extends AppError {
    constructor(message, details = null) {
        super(message, 'CONFIG_ERROR', 500, details);
        this.name = 'ConfigError';
    }
}

class CryptoError extends AppError {
    constructor(message, details = null) {
        super(message, 'CRYPTO_ERROR', 500, details);
        this.name = 'CryptoError';
    }
}

class ErrorHandler {
    constructor(logger = defaultLogger) {
        this.logger = logger;
    }

    handle(error) {
        if (error instanceof AppError) {
            this.logger.error(`${error.name}: ${error.message}`, {
                code: error.code,
                statusCode: error.statusCode,
                details: error.details
            });
            
            return {
                success: false,
                error: error.toJSON()
            };
        }
        
        this.logger.error('Unexpected error occurred', {
            message: error.message,
            stack: error.stack
        });
        
        return {
            success: false,
            error: {
                message: 'An unexpected error occurred',
                code: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString()
            }
        };
    }

    async handleAsync(fn, context = {}) {
        try {
            return await fn();
        } catch (error) {
            this.logger.error(`Error in ${context.operation || 'operation'}:`, {
                context,
                error: error.message
            });
            
            return this.handle(error);
        }
    }

    wrap(fn) {
        return async (...args) => {
            try {
                return await fn(...args);
            } catch (error) {
                return this.handle(error);
            }
        };
    }
}

module.exports = {
    AppError,
    ValidationError,
    ApiError,
    ConfigError,
    CryptoError,
    ErrorHandler
};