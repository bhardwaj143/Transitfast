import mongoose from "mongoose";
import { privateKey } from '../../config/privateKeys.js'

mongoose.connect(privateKey.DB_STRING_DEV,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
);

const connection = mongoose.connection;

// DB Loader
const databaseLoader = async () => new Promise((resolve, reject) => {
    connection.once('open', () => {
        console.log('Database connection established');
        resolve();
    });
    connection.on('error', (err) => {
        console.log('Error', err)
        reject();
    });
});

export { databaseLoader };
