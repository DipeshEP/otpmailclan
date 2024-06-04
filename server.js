

const express = require('express');
const { Client } = require('pg');
const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// PostgreSQL connection setup
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'mailotpverification',
    password: 'DIPESHEP11',
    port: 5432,
});

client.connect(err => {
    if (err) {
        console.error('PostgreSQL connection error:', err.stack);
    } else {
        console.log('Connected to PostgreSQL');
    }
});

// Create OTP table if not exists
client.query(`
    CREATE TABLE IF NOT EXISTS otps (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
    )
`, (err, res) => {
    if (err) {
        console.error('Error creating table:', err.stack);
    } else {
        console.log('Table "otps" is ready');
    }
});

// Generate OTP and send email
app.post('/generate-otp', async (req, res) => {
    const { email } = req.body;

    const otp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });

    try {
        await client.query('INSERT INTO otps (email, otp) VALUES ($1, $2)', [email, otp]);

        // Send OTP via email
        const transporter = nodemailer.createTransport({
            // service: 'email',
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: 'epdipesh@gmail.com',
                pass: 'vnot jbpz pxup kjwu'
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        await transporter.sendMail({
            from: 'epdipesh@gmail.com',
            to: email,
            subject: 'OTP Verification',
            text: `Your OTP for verification is: ${otp}`
        });

        res.status(200).send('OTP sent successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error sending OTP');
    }
});

// Verify OTP
app.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    try {
        const result = await client.query('SELECT * FROM otps WHERE email = $1 AND otp = $2 AND created_at > NOW() - INTERVAL \'5 minutes\'', [email, otp]);

        if (result.rows.length > 0) {
            res.status(200).send('OTP verified successfully');
        } else {
            res.status(400).send('Invalid OTP');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error verifying OTP');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
