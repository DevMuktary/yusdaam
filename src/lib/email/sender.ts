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
  
  // ZeptoMail requires a bounce address. We will fallback to the sender email if a specific bounce email isn't set in your .env
  const bounceEmail = process.env.ZEPTO_BOUNCE_EMAIL || senderEmail; 

  if (!zeptoToken) {
    console.warn("⚠️ ZEPTO_MAIL_TOKEN is missing. Email dispatch skipped in development.");
    return false;
  }

  const client = new SendMailClient({ url: zeptoUrl, token: zeptoToken });

  try {
    await client.sendMail({
      bounce_address: bounceEmail, // <-- THIS IS THE FIX
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
