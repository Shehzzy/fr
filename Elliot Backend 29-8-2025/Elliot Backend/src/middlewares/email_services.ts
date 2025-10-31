import path from "path";
import fs from 'fs';
import sendEmailNodemailer from "./nodemailerEmail"
import { captureRejectionSymbol } from "events";
import { config } from 'dotenv';
config();


const adminForgetPasswordMail = async (data: any) => {
    try {
        let { email, security_code, name } = data
        let subject = 'Forget Password';
        let file_path = path.join(__dirname, '../email_templates/admin_forgot_password.html');
        let html = await fs.readFileSync(file_path, { encoding: 'utf-8' })
        html = html.replace('%USER_NAME%', name)
        html = html.replace('%SECURITY_CODE%', security_code)
        await sendEmailNodemailer(email, subject, html)
    }
    catch (err) {
        throw err;
    }
}

const userForgetPasswordMail = async (data: any) => {
    try {
        let { email, security_code, full_name } = data
        let subject = 'Forget Password';
        let file_path = path.join(__dirname, '../email_templates/user_forgot_password.html');
        let html = await fs.readFileSync(file_path, { encoding: 'utf-8' })
        html = html.replace('%USER_NAME%', full_name)
        html = html.replace('%SECURITY_CODE%', security_code)
        await sendEmailNodemailer(email, subject, html)
    }
    catch (err) {
        throw err;
    }
}

const contactUsEmail = async (data: any) => {
    try {
        let { name, email, contact_no,message } = data
        let subject = 'User try to contact you';
        let file_path = path.join(__dirname, '../email_templates/contact_us_email.html');
        let html = await fs.readFileSync(file_path, { encoding: 'utf-8' })
        html = html.replace('%NAME%', name)
        html = html.replace('%EMAIL%', email)
        html = html.replace('%MESSAGE%', message)
        html = html.replace('%CONTACT_NO%', contact_no)
        html = html.replace('%CONTACT_NO%', process.env.ADMIN_EMAIL!)

        await sendEmailNodemailer(process.env.ADMIN_EMAIL!, subject, html)
    }
    catch (err) {
        throw err;
    }
}

const sendOTP = async (data: any) => {
    try {
        let { email, otp } = data
        let subject = 'Email Verification';
        let file_path = path.join(__dirname, '../email_templates/otp_temp.html');
        let html = await fs.readFileSync(file_path, { encoding: 'utf-8' })
        html = html.replace('%EMAIL%', email)
        html = html.replace('%FULL_NAME%', email)
        html = html.replace('%OTP%', otp)
        await sendEmailNodemailer(email, subject, html)
    }
    catch (err) {
        throw err;
    }
}

const welcomeMail = async (data: any) => {
    try {
        let { email, full_name } = data
        let subject = 'Start Smarter Sit Sharper ';
        let file_path = path.join(__dirname, '../email_templates/welcome_email.html');
        let html = await fs.readFileSync(file_path, { encoding: 'utf-8' })
        html = html.replace('%USER_NAME%', full_name ?? email)
        await sendEmailNodemailer(email, subject, html)
    }
    catch (err) {
        throw err;
    }
}


export {
    adminForgetPasswordMail,
    contactUsEmail,
    sendOTP,
    welcomeMail,
    userForgetPasswordMail
};