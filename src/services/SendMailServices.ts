import fs from 'fs';
import handlebars from 'handlebars';
import nodemailer, { Transporter } from "nodemailer";

class SendMailService {
  private client: Transporter

  constructor() {
    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
    });''
    this.client = transporter;
  };

  async execute(to: string, subject: string, variables: object, path: string) {
    const templateFileContent = fs.readFileSync(path).toString("utf-8");
    const mailTemplateParse = handlebars.compile(templateFileContent)
    const html = mailTemplateParse(variables)

    const message = await this.client.sendMail({
      to,
      subject,
      html,
      from: `${process.env.SMTP_USER}`
    });
  }
}

export default new SendMailService();

