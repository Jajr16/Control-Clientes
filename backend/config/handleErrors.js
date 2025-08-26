import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

const logPath = path.resolve('logs');
if (!fs.existsSync(logPath)) fs.mkdirSync(logPath);

function logErrorToFile(error) {
    const logFile = path.join(logPath, `errors.txt`);
    const logMessage = `[${new Date().toISOString()}] ${error.stack || error}\n\n`;
    fs.appendFileSync(logFile, logMessage);
}

async function sendErrorEmail(error) {
    // Configura tu cuenta de Gmail (usa App Password)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    });

    await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: process.env.GMAIL_USER,
        subject: 'Error en el sistema de Finatech',
        text: error.stack || error.toString()
    });
}

// Captura errores no manejados
process.on('uncaughtException', async (err) => {
    console.error('Uncaught Exception:', err);
    logErrorToFile(err);
    // await sendErrorEmail(err);
    process.exit(1); // reiniciar el servidor
});

process.on('unhandledRejection', async (reason) => {
    console.error('Unhandled Rejection:', reason);
    logErrorToFile(reason);
    // await sendErrorEmail(reason);
    process.exit(1); // reiniciar el servidor
});

export const handleError = async (error) => {
    logErrorToFile(error);
    // await sendErrorEmail(error);
};