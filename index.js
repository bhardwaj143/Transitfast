import dotenv from "dotenv";
dotenv.config();
import express from 'express';
import { appLoader, databaseLoader } from './loaders/index.js';
import { router } from './routers/index.js';

process.on('uncaughtException', err => {
	console.log(' UNCAUGHT EXCEPTION ');
	console.log('[Inside \'uncaughtException\' event] ' + err.stack || err.message);
});

process.on('unhandledRejection',
	(reason, promise) => {
		console.log(' UNHANDLED REJECTION ');
		console.log('Unhandled Rejection at: ', promise, 'REASON: ', reason);
	});

const app = express();

databaseLoader()
	.then(() => appLoader(app, router))
	.catch(error => {
		console.log(error);
		process.exit(1);
	});
