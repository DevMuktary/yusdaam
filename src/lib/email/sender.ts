import { SendMailClient } from "zeptomail";

interface SendEmailParams {
  toEmail: string;
  toName: string;
  subject: string;
  htmlBody: string;
  attachments?: Array<{ content: string; mime_type: string; name: string }>;
}

export const sendSystemEmail = async ({ toEmail, toName, subject, htmlBody, attachments }: SendEmailParams) => {
  const zeptoUrl = "api.zeptomail.com/";
  const zeptoToken = process.env.ZEPTO_MAIL_TOKEN;
  const senderEmail = process.env.ZEPTO_SENDER_EMAIL || "noreply@yusdaamautos.com";
  
  const bounceEmail = process.env.ZEPTO_BOUNCE_EMAIL || senderEmail; 

  if (!zeptoToken) {
    console.warn("⚠️ ZEPTO_MAIL_TOKEN is missing. Email dispatch skipped in development.");
    return false;
  }

  const client = new SendMailClient({ url: zeptoUrl, token: zeptoToken });

  try {
    const payload: any = {
      bounce_address: bounceEmail, 
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
    };

    // Inject attachments if they exist
    if (attachments && attachments.length > 0) {
      payload.attachments = attachments;
    }

    await client.sendMail(payload);
    return true;
  } catch (error) {
    console.error("❌ Failed to send email via ZeptoMail:", error);
    return false;
  }
};
