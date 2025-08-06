class Logger {
    constructor(options = {}) {
        this.level = options.level || 'info';
        this.prefix = options.prefix || '';
        this.timestamp = options.timestamp !== false;
        
        this.levels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3
        };
    }

    formatMessage(level, message, data) {
        const parts = [];
        
        if (this.timestamp) {
            parts.push(`[${new Date().toISOString()}]`);
        }
        
        parts.push(`[${level.toUpperCase()}]`);
        
        if (this.prefix) {
            parts.push(`[${this.prefix}]`);
        }
        
        parts.push(message);
        
        if (data) {
            if (typeof data === 'object') {
                parts.push(JSON.stringify(data, null, 2));
            } else {
                parts.push(data);
            }
        }
        
        return parts.join(' ');
    }

    shouldLog(level) {
        return this.levels[level] <= this.levels[this.level];
    }

    log(level, message, data) {
        if (!this.shouldLog(level)) {
            return;
        }
        
        const formattedMessage = this.formatMessage(level, message, data);
        
        switch (level) {
            case 'error':
                console.error(formattedMessage);
                break;
            case 'warn':
                console.warn(formattedMessage);
                break;
            default:
                console.log(formattedMessage);
        }
    }

    error(message, data) {
        this.log('error', message, data);
    }

    warn(message, data) {
        this.log('warn', message, data);
    }

    info(message, data) {
        this.log('info', message, data);
    }

    debug(message, data) {
        this.log('debug', message, data);
    }

    createChild(prefix) {
        return new Logger({
            level: this.level,
            prefix: this.prefix ? `${this.prefix}:${prefix}` : prefix,
            timestamp: this.timestamp
        });
    }
}

const defaultLogger = new Logger();

module.exports = {
    Logger,
    defaultLogger
};