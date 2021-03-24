import * as winston from 'winston';
import * as fs from "fs";

class LogHelper {

	private static logDirectory: string = 'logs';

	private static createLogFolderIfNotExists(): void {
		if (!fs.existsSync(this.logDirectory)) {
				fs.mkdirSync(this.logDirectory);
		}
	}

	static getLogger(): winston.LoggerInstance{
		this.createLogFolderIfNotExists();
		const logger: winston.LoggerInstance = new winston.Logger({
			transports: [
				new winston.transports.Console({ colorize: true, timestamp: true }),
				new winston.transports.File({ filename: 'logs/logs.log' })
			]
		});
		return logger;
	}
}

const log = LogHelper.getLogger();
export {log}