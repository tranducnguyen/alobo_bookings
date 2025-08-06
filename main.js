const Application = require('./src');
const { defaultLogger } = require('./src/utils/logger');
const { ErrorHandler } = require('./src/utils/error-handler');

const logger = defaultLogger;
const errorHandler = new ErrorHandler(logger);

async function main() {
    const app = new Application();
    
    try {
        logger.info('Starting yard booking application...');
        
        const result = await app.run('output.txt');
        
        logger.info('Application completed successfully', result);
        
        process.exit(0);
    } catch (error) {
        const errorResult = errorHandler.handle(error);
        logger.error('Application failed', errorResult);
        process.exit(1);
    }
}

if (require.main === module) {
    main().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = { main };