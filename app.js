require('dotenv').config();

// Access the environment variables
const port = process.env.PORT || 3000;

const AWS = require('aws-sdk');

// Configure AWS SDK with the environment variables
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

// Example: Use AWS SDK to list S3 buckets
const s3 = new AWS.S3();

s3.listBuckets((err, data) => {
    if (err) {
        console.error("Error", err);
    } else {
        console.log("Bucket List", data.Buckets);
    }
});

// Example: Start a server on the specified port
const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
