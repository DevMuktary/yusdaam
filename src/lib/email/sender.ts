import { SendMailClient } from "zeptomail";

interface SendEmailParams {
  toEmail: string;
  toName: string;
  subject: string;
  htmlBody: string;
}

export const sendSystemEmail = async ({ toEmail, toName, subject, htmlBody }: SendEmailParams) => {
  const zeptoUrl = "api.zeptomail.com/";
  const zeptoToken = process.env.ZEPTO_MAIL_TOKEN;
  const senderEmail = process.env.ZEPTO_SENDER_EMAIL || "noreply@yusdaamautos.com";

  if (!zeptoToken) {
    console.warn("⚠️ ZEPTO_MAIL_TOKEN is missing. Email dispatch skipped in development.");
    return false;
  }

  const client = new SendMailClient({ url: zeptoUrl, token: zeptoToken });

  try {
    await client.sendMail({
      from: { 
        address: senderEmail, 
        name: "YUSDAAM AUTOS" 
      },
      to: [
        { 
          email_address: { 
            address: toEmail, 
            name: toName 
          } 
        }
      ],
      subject: subject,
      htmlbody: htmlBody,
    });
    
    return true;
  } catch (error) {
    console.error("❌ Failed to send email via ZeptoMail:", error);
    return false;
  }
};
