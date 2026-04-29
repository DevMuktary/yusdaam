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
    <div style="font-family: Arial, sans-serif; color: #001232; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #001232; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 2px;">YUSDAAM<span style="color: #FFB902;">.</span></h1>
      </div>
      <div style="padding: 32px; background-color: #ffffff; line-height: 1.6;">
        <h2 style="font-size: 18px; color: #001232; margin-top: 0;">Registration Received</h2>
        <p>Dear ${data.firstName} ${data.lastName},</p>
        <p>Thank you for submitting your onboarding profile for the YUSDAAM Autos Asset Administration Portal. We have successfully received your details and operational routing preferences.</p>
        <p>To maintain strict security and compliance, your account is currently <strong style="color: #FFB902; background-color: #001232; padding: 2px 6px; border-radius: 4px;">UNDER REVIEW</strong>. Our administration team is presently conducting mandatory Know Your Customer (KYC) verification on the details you submitted.</p>
        <p>Please allow up to 24 hours for this verification process. Once your identity is confirmed and your profile is approved, you will receive a secondary email containing the secure link to access your live management portal.</p>
        
        <h3 style="color: #001232; margin-top: 32px; border-bottom: 1px solid #e0e0e0; padding-bottom: 8px;">Your Registration Summary</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr style="border-bottom: 1px solid #f0f0f0;">
            <td style="padding: 12px 0; font-weight: bold; color: #001232;">Account Name:</td>
            <td style="padding: 12px 0; text-align: right;">${data.firstName} ${data.lastName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f0f0f0;">
            <td style="padding: 12px 0; font-weight: bold; color: #001232;">Email Address:</td>
            <td style="padding: 12px 0; text-align: right;">${data.email}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f0f0f0;">
            <td style="padding: 12px 0; font-weight: bold; color: #001232;">Contact Number:</td>
            <td style="padding: 12px 0; text-align: right;">${data.phoneCountryCode} ${data.phoneNumber}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f0f0f0;">
            <td style="padding: 12px 0; font-weight: bold; color: #001232;">Target Asset Class:</td>
            <td style="padding: 12px 0; text-align: right;">${data.preferredAssetClass}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f0f0f0;">
            <td style="padding: 12px 0; font-weight: bold; color: #001232;">Intended Volume:</td>
            <td style="padding: 12px 0; text-align: right;">${data.intendedVolume}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; font-weight: bold; color: #001232;">Remittance Bank:</td>
            <td style="padding: 12px 0; text-align: right;">${data.bankName}</td>
          </tr>
        </table>
        
        <p style="font-size: 12px; color: #666666; margin-top: 24px; font-style: italic;">
          (Note: For your security, sensitive data such as your password, full NIN, and complete account number have been strictly omitted from this transmission).
        </p>
        <p>If any of the information above is incorrect, or if you did not initiate this registration, please contact our administration desk immediately.</p>
        <p style="margin-bottom: 0;">Regards,<br><strong>The Administration Team</strong></p>
      </div>
      <div style="background-color: #f8f9fa; padding: 24px; text-align: center; font-size: 11px; color: #666666; border-top: 1px solid #e0e0e0;">
        <p style="margin: 0 0 8px 0; font-weight: bold; color: #001232;">YUSDAAM AUTOS INVESTMENT MANAGEMENT NIG LTD</p>
        <p style="margin: 0 0 16px 0;">RC-9335611 | 84, Addo Road, Oke-Ira Kekere, Ajah, Lagos.<br>Call/WhatsApp: 0906 500 0860 | Email: info@yusdaamautos.com</p>
        <p style="margin: 0; line-height: 1.4; text-align: justify;">
          Legal Disclaimer: YUSDAAM AUTOS is a vehicle asset management company. We provide vehicle procurement, logistics, and enforcement services to individual asset owners. We do not operate a collective investment scheme, solicit public deposits, or offer securities. We are not a SEC-licensed Fund Manager.
        </p>
      </div>
    </div>
  `;
};
