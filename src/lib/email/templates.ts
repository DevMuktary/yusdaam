export interface RegistrationEmailData {
  firstName: string;
  lastName: string;
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
  preferredAssetClass: string;
  intendedVolume: string;
  bankName: string;
}

export const getRegistrationReceivedEmail = (data: RegistrationEmailData) => {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1a1a1a; max-width: 550px; margin: 0 auto; line-height: 1.6;">
      <div style="padding: 20px 0; border-bottom: 2px solid #f0f0f0; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 22px; color: #001232; letter-spacing: 1px;">
          YUSDAAM<span style="color: #FFB902;">.</span>
        </h1>
      </div>
      
      <div style="font-size: 15px;">
        <p>Hi ${data.firstName},</p>
        <p>Thank you for registering with YUSDAAM Autos. We have successfully received your profile.</p>
        <p>Your account is currently pending a standard review by our administration team. We typically complete this process within 24 hours. Once your profile is approved, we will send you a follow-up email with your portal access.</p>
        
        <h3 style="margin-top: 35px; margin-bottom: 15px; font-size: 16px; color: #001232; border-bottom: 1px solid #f0f0f0; padding-bottom: 8px;">
          Your Profile Summary
        </h3>
        
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #4a4a4a; width: 40%;">Name:</td>
            <td style="padding: 8px 0; text-align: right;">${data.firstName} ${data.lastName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #4a4a4a;">Phone:</td>
            <td style="padding: 8px 0; text-align: right;">${data.phoneCountryCode} ${data.phoneNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #4a4a4a;">Preferred Asset:</td>
            <td style="padding: 8px 0; text-align: right;">${data.preferredAssetClass}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #4a4a4a;">Fleet Volume:</td>
            <td style="padding: 8px 0; text-align: right;">${data.intendedVolume}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #4a4a4a;">Bank Name:</td>
            <td style="padding: 8px 0; text-align: right;">${data.bankName}</td>
          </tr>
        </table>

        <p style="margin-top: 35px;">If you need to make any corrections, or if you did not initiate this registration, simply reply to this email.</p>
        
        <p style="margin-top: 30px; margin-bottom: 0;">
          Best regards,<br>
          <strong>The YUSDAAM Team</strong>
        </p>
      </div>

      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f0f0f0; font-size: 11px; color: #888888; text-align: center;">
        <p style="margin: 0 0 5px 0;"><strong>YUSDAAM AUTOS INVESTMENT MANAGEMENT NIG LTD (RC-9335611)</strong></p>
        <p style="margin: 0 0 15px 0;">84, Addo Road, Oke-Ira Kekere, Ajah, Lagos | 0906 500 0860</p>
        <p style="margin: 0; line-height: 1.4;">This email was sent to ${data.email}. If you received this in error, please disregard it.</p>
      </div>
    </div>
  `;
};
