import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD,
        },
    });

    async sendOtpEmail(email: string, otp: number) {
        await this.transporter.sendMail({
            from: process.env.MAIL_USER,
            to: email,
            subject: 'Your verification OTP',
            html: `
        <h2>Email Verification</h2>
        <p>Your OTP code is:</p>
        <h1>${otp}</h1>
        <p>This code expires in 5 minutes.</p>
      `,
        });
    }

    async sendResetPasswordOtp(email: string, otp: number) {
        await this.transporter.sendMail({
            from: process.env.MAIL_USER,
            to: email,
            subject: 'Reset password OTP',
            html: `
      <h2>Reset Password</h2>
      <p>Your reset password OTP is:</p>
      <h1>${otp}</h1>
      <p>This code expires in 5 minutes.</p>
    `,
        });
    }
}