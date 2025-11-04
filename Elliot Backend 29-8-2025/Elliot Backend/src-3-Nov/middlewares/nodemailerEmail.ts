import nodemailer from 'nodemailer';
import { config } from 'dotenv';

config();
const nodemailer_email = process.env.NODEMAILER_MAIL
const nodemailer_password = process.env.NODEMAILER_PASSWORD

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: nodemailer_email,
        pass: nodemailer_password,
    },
});

const sendEmailNodemailer = async (to: string, subject: string, body: any) => {
    try {
        let mailOptions = {
            from: `"START SIT EM" <${nodemailer_email}>`,
            to: to,
            subject: subject,
            html: body,
        };

        transporter.sendMail(mailOptions, (error: any, info: any) => {
            if (error) { console.log(error) }
            else { console.log('Email sent: ' + info.response) }
        });

    }
    catch (err) {
        throw err;
    }
}


export default sendEmailNodemailer