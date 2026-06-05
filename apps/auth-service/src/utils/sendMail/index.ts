import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
import { authEnv } from '../auth.env';

const transporter = nodemailer.createTransport({
  host: authEnv.SMTP_HOST,
  port: authEnv.SMTP_PORT,
  service: authEnv.SMTP_SERVICE,
  secure: true,
  auth: {
    user: authEnv.SMTP_USER,
    pass: authEnv.SMTP_PASS,
  },
});

const renderEmailTemplate = async (templateName: string, data: Record<string, any>): Promise<string> => {
    const templatePath = path.join(
        process.cwd(),
        'apps',
        'auth-service',
        'src',
        'utils',
        'email-templates',
        `${templateName}.ejs`
    );
    return ejs.renderFile(templatePath, data);
}

export const sendEmail = async (to: string, subject: string, templateName: string, data: Record<string, any>) => {
  try {
    const html = await renderEmailTemplate(templateName, data);
    await transporter.sendMail({
      from: authEnv.SMTP_USER,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
