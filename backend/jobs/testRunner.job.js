import cron from 'node-cron';
import logger from '../src/utils/logger.js';
import { exec } from 'child_process';
import { ApiError } from '../src/utils/errorFormat.js';

if (process.env.NODE_ENV === 'test') {
    logger.info ('currently in test state')
    throw new ApiError({ message: "currently in test state", status: 500 })
}

cron.schedule('0 0 * * *', () => {
    logger.info('running required tests...');

    const testProcess = exec ("npm test", (error, stderr, stdout) => {
        if (error) {
            logger.error (`error: ${error.message}`);
            return;
        }

        if (stderr) {
            logger.error (`stderr: ${stderr}`);
            return;
        }

        logger.info (`stdout: ${stdout}`);
    })

    testProcess.stdout.on('data', (data) => {
        logger.info(`stdout: ${data}`);
    })
})