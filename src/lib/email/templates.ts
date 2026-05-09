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

// --- RIDER TEMPLATE ---
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

// --- KYC APPROVAL TEMPLATES ---
export interface AccountStatusEmailData {
  firstName: string;
  email: string;
  role: string;
}

export const getAccountApprovedEmail = (data: AccountStatusEmailData) => {
  const loginUrl = data.role === "RIDER" 
    ? "https://yusdaamautos.com/rider/login" 
    : "https://yusdaamautos.com/owner/login";
    
  const roleName = data.role === "RIDER" ? "Rider" : "Asset Owner";

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1a1a1a; max-width: 550px; margin: 0 auto; line-height: 1.6;">
      <div style="padding: 20px 0; border-bottom: 2px solid #f0f0f0; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 22px; color: #001232; letter-spacing: 1px;">
          YUSDAAM<span style="color: #FFB902;">.</span>
        </h1>
      </div>
      
      <div style="font-size: 15px;">
        <p>Hi ${data.firstName},</p>
        
        <div style="background-color: #f6fcf8; border-left: 4px solid #10B981; padding: 15px; margin: 25px 0;">
          <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #001232;">Account Approved</h3>
          <p style="margin: 0; font-size: 14px; color: #4a4a4a;">Congratulations! Your KYC documents have been successfully verified by our compliance team.</p>
        </div>

        <p>Your profile is now fully active as a verified <strong>${roleName}</strong>. You can now log into your portal to view your dashboard and proceed with the next steps of your deployment.</p>
        
        <div style="margin: 35px 0; text-align: center;">
          <a href="${loginUrl}" style="background-color: #001232; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; font-size: 15px; display: inline-block;">Access Your Portal</a>
        </div>
        
        <p style="margin-top: 35px; margin-bottom: 0;">
          Welcome to the Yusdaam Fleet,<br>
          <strong>The YUSDAAM Team</strong>
        </p>
      </div>

      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f0f0f0; font-size: 11px; color: #888888; text-align: center;">
        <p style="margin: 0 0 5px 0;"><strong>YUSDAAM AUTOS FLEET MANAGEMENT NIGERIA LIMITED (RC-9335611)</strong></p>
        <p style="margin: 0; line-height: 1.4;">This email was sent to ${data.email}.</p>
      </div>
    </div>
  `;
};

export const getAccountRejectedEmail = (data: AccountStatusEmailData) => {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1a1a1a; max-width: 550px; margin: 0 auto; line-height: 1.6;">
      <div style="padding: 20px 0; border-bottom: 2px solid #f0f0f0; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 22px; color: #001232; letter-spacing: 1px;">
          YUSDAAM<span style="color: #FFB902;">.</span>
        </h1>
      </div>
      
      <div style="font-size: 15px;">
        <p>Hi ${data.firstName},</p>
        
        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 25px 0;">
          <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #001232;">Account Verification Update</h3>
          <p style="margin: 0; font-size: 14px; color: #4a4a4a;">Unfortunately, we were unable to verify your profile based on the KYC documents and information provided.</p>
        </div>

        <p>This can happen for a few reasons, such as a mismatch in your National ID details, unverified guarantor information, or unclear document uploads.</p>
        
        <p>If you believe this was a mistake or you would like to provide updated documentation, please reply directly to this email or contact our support team.</p>
        
        <p style="margin-top: 35px; margin-bottom: 0;">
          Regards,<br>
          <strong>The YUSDAAM Compliance Team</strong>
        </p>
      </div>

      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f0f0f0; font-size: 11px; color: #888888; text-align: center;">
        <p style="margin: 0 0 5px 0;"><strong>YUSDAAM AUTOS FLEET MANAGEMENT NIGERIA LIMITED (RC-9335611)</strong></p>
        <p style="margin: 0; line-height: 1.4;">This email was sent to ${data.email}.</p>
      </div>
    </div>
  `;
};

// --- AWAITING SIGNATURE TEMPLATES ---
export interface AwaitingSignatureEmailData {
  firstName: string;
  email: string;
  vehicleDetails: string;
}

export const getOwnerAwaitingSignatureEmail = (data: AwaitingSignatureEmailData) => {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1a1a1a; max-width: 550px; margin: 0 auto; line-height: 1.6;">
      <div style="padding: 20px 0; border-bottom: 2px solid #f0f0f0; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 22px; color: #001232; letter-spacing: 1px;">
          YUSDAAM<span style="color: #FFB902;">.</span>
        </h1>
      </div>
      
      <div style="font-size: 15px;">
        <p>Hi ${data.firstName},</p>
        
        <div style="background-color: #f6fcf8; border-left: 4px solid #10B981; padding: 15px; margin: 25px 0;">
          <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #001232;">Asset Match Successful</h3>
          <p style="margin: 0; font-size: 14px; color: #4a4a4a;">Your fleet portfolio has been successfully updated. We have assigned a verified rider to your asset: <strong>${data.vehicleDetails}</strong>.</p>
        </div>

        <p>To finalize this deployment and activate your weekly remittance payouts, your digital signature is required on the <strong>Specific Power of Attorney</strong> document.</p>
        
        <div style="margin: 35px 0; text-align: center;">
          <a href="https://yusdaamautos.com/owner/login" style="background-color: #001232; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; font-size: 15px; display: inline-block;">Log in to Sign Document</a>
        </div>
        
        <p style="margin-top: 35px; margin-bottom: 0;">
          Regards,<br>
          <strong>The YUSDAAM Fleet Operations Team</strong>
        </p>
      </div>

      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f0f0f0; font-size: 11px; color: #888888; text-align: center;">
        <p style="margin: 0 0 5px 0;"><strong>YUSDAAM AUTOS FLEET MANAGEMENT NIGERIA LIMITED</strong></p>
        <p style="margin: 0; line-height: 1.4;">This email was sent to ${data.email}.</p>
      </div>
    </div>
  `;
};

export const getRiderAwaitingSignatureEmail = (data: AwaitingSignatureEmailData) => {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1a1a1a; max-width: 550px; margin: 0 auto; line-height: 1.6;">
      <div style="padding: 20px 0; border-bottom: 2px solid #f0f0f0; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 22px; color: #001232; letter-spacing: 1px;">
          YUSDAAM<span style="color: #FFB902;">.</span>
        </h1>
      </div>
      
      <div style="font-size: 15px;">
        <p>Hi ${data.firstName},</p>
        
        <div style="background-color: #f6fcf8; border-left: 4px solid #10B981; padding: 15px; margin: 25px 0;">
          <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #001232;">Vehicle Assigned!</h3>
          <p style="margin: 0; font-size: 14px; color: #4a4a4a;">Congratulations! You have been officially assigned to a <strong>${data.vehicleDetails}</strong>.</p>
        </div>

        <p>Before you can collect the keys and hit the road, you must log into your dashboard to review and digitally sign your <strong>Hire Purchase Agreement</strong> and <strong>Vehicle Handover Note</strong>.</p>
        
        <div style="margin: 35px 0; text-align: center;">
          <a href="https://yusdaamautos.com/rider/login" style="background-color: #10B981; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; font-size: 15px; display: inline-block;">Log in to Sign Agreement</a>
        </div>
        
        <p style="margin-top: 35px; margin-bottom: 0;">
          Drive safe,<br>
          <strong>The YUSDAAM Operations Team</strong>
        </p>
      </div>

      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f0f0f0; font-size: 11px; color: #888888; text-align: center;">
        <p style="margin: 0 0 5px 0;"><strong>YUSDAAM AUTOS FLEET MANAGEMENT NIGERIA LIMITED</strong></p>
        <p style="margin: 0; line-height: 1.4;">This email was sent to ${data.email}.</p>
      </div>
    </div>
  `;
};
