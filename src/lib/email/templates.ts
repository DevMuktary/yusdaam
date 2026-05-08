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
        <p style="margin: 0 0 5px 0;"><strong>YUSDAAM AUTOS FLEET MANAGEMENT NIGERIA LIMITED (RC-9335611)</strong></p>
        <p style="margin: 0 0 15px 0;">18, Alhaji Olakunle Close Selewu Teacher's Quater Igbogbo Ikorodu Lagos.</p>
        <p style="margin: 0; line-height: 1.4;">This email was sent to ${data.email}. If you received this in error, please disregard it.</p>
      </div>
    </div>
  `;
};

export interface AgreementSignedEmailData {
  firstName: string;
  email: string;
}

export const getAgreementSignedEmail = (data: AgreementSignedEmailData) => {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1a1a1a; max-width: 550px; margin: 0 auto; line-height: 1.6;">
      <div style="padding: 20px 0; border-bottom: 2px solid #f0f0f0; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 22px; color: #001232; letter-spacing: 1px;">
          YUSDAAM<span style="color: #FFB902;">.</span>
        </h1>
      </div>
      
      <div style="font-size: 15px;">
        <p>Hi ${data.firstName},</p>
        <p>Your digital signatures have been successfully applied to your <strong>Hire Purchase Administration Agreement</strong> and <strong>Specific Power of Attorney</strong>.</p>
        
        <div style="background-color: #f6fcf8; border-left: 4px solid #10B981; padding: 15px; margin: 25px 0;">
          <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #001232;">Your Asset is Active</h3>
          <p style="margin: 0; font-size: 14px; color: #4a4a4a;">Your dashboard is now fully unlocked. You can monitor your vehicle deployment and track your remittance history in real-time.</p>
        </div>

        <p>Finalized, countersigned PDF copies of both legal documents have been automatically emailed to you and are also available for download at any time within the "Vault & Legal" section of your portal.</p>
        
        <p style="margin-top: 35px; margin-bottom: 0;">
          Welcome to the Fleet,<br>
          <strong>The YUSDAAM Team</strong>
        </p>
      </div>

      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f0f0f0; font-size: 11px; color: #888888; text-align: center;">
        <p style="margin: 0 0 5px 0;"><strong>YUSDAAM AUTOS FLEET MANAGEMENT NIGERIA LIMITED (RC-9335611)</strong></p>
        <p style="margin: 0 0 15px 0;">18, Alhaji Olakunle Close Selewu Teacher's Quater Igbogbo Ikorodu Lagos.</p>
        <p style="margin: 0; line-height: 1.4;">This email was sent to ${data.email}.</p>
      </div>
    </div>
  `;
};

// --- NEW RIDER TEMPLATE ---
export const getRiderAgreementSignedEmail = (data: AgreementSignedEmailData) => {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1a1a1a; max-width: 550px; margin: 0 auto; line-height: 1.6;">
      <div style="padding: 20px 0; border-bottom: 2px solid #f0f0f0; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 22px; color: #001232; letter-spacing: 1px;">
          YUSDAAM<span style="color: #FFB902;">.</span>
        </h1>
      </div>
      
      <div style="font-size: 15px;">
        <p>Hi ${data.firstName},</p>
        <p>Your digital signature has been successfully applied to your <strong>Hire Purchase Agreement</strong> and <strong>Vehicle Handover Note</strong>.</p>
        
        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 25px 0;">
          <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #001232;">Your Dashboard is Unlocked</h3>
          <p style="margin: 0; font-size: 14px; color: #4a4a4a;">Your fleet assignment is now strictly active. You can monitor your vehicle requirements and track your weekly remittances directly from your Command Center.</p>
        </div>

        <p>A finalized, countersigned PDF copy of your legal document is attached to this email for your records. It is also permanently available in the Legal Vault section of your dashboard.</p>
        
        <p style="margin-top: 35px; margin-bottom: 0;">
          Drive safe,<br>
          <strong>The YUSDAAM Team</strong>
        </p>
      </div>

      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f0f0f0; font-size: 11px; color: #888888; text-align: center;">
        <p style="margin: 0 0 5px 0;"><strong>YUSDAAM AUTOS FLEET MANAGEMENT NIGERIA LIMITED (RC-9335611)</strong></p>
        <p style="margin: 0 0 15px 0;">18, Alhaji Olakunle Close Selewu Teacher's Quater Igbogbo Ikorodu Lagos.</p>
        <p style="margin: 0; line-height: 1.4;">This email was sent to ${data.email}.</p>
      </div>
    </div>
  `;
};
