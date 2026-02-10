//require('dotenv').config();
const mongoose = require("mongoose");


const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            throw new Error('MongoDB URI is not defined in environment variables.');
        }

        console.log("uri:",mongoURI)

        console.log("Connecting to MongoDB...");
        const conn = await mongoose.connect(mongoURI, {
        });
        
        console.log(
            `MongoDB Connected at: ${conn.connection.db.s.namespace.db}`
        );
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1); // Exit with a non-zero status code to indicate an error
    }
};

module.exports = connectDB;


