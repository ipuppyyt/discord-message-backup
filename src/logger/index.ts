import 'colors';
import moment from 'moment';

const logger = {
    info: (message: string) => {
        console.info(`[${moment().format('DD-MM-YYYY HH:mm:ss')}]`.grey, `[INFO] `.yellow, message);
    },
    warn: (message: string) => {
        console.warn(`[${moment().format('DD-MM-YYYY HH:mm:ss')}]`.grey, `[WARN] `.magenta, message);
    },
    error: (message: string) => {
        console.error(`[${moment().format('DD-MM-YYYY HH:mm:ss')}]`.grey, `[ERROR] `.red, message);
    },
    debug: (message: string) => {
        console.log(`[${moment().format('DD-MM-YYYY HH:mm:ss')}]`.grey, `[DEBUG] `.grey, message);
    },
    log: (message: string) => {
        console.log(`[${moment().format('DD-MM-YYYY HH:mm:ss')}]`.grey, `[LOG] `.grey, message);
    },
    event: (event: string, message: string) => {
        console.log(`[${moment().format('DD-MM-YYYY HH:mm:ss')}]`.grey,`[${event}] `.cyan, message);
    },
    success: (from: string, message: string) => {
        console.log(`[${moment().format('DD-MM-YYYY HH:mm:ss')}]`.grey, `[${from}] `.green, message);
    },
    fail: (from: string, message: string) => {
        console.log(`[${moment().format('DD-MM-YYYY HH:mm:ss')}]`.grey, `[${from}] `.red, message);
    },
    warning: (from: string, message: string) => {
        console.log(`[${moment().format('DD-MM-YYYY HH:mm:ss')}]`.grey, `[${from}] `.yellow, message);
    },
    clear: () => {
        console.clear();
    }
};

export default logger;