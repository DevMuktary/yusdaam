// src/lib/sms/termii.ts

interface SendSmsParams {
  to: string;
  message: string;
}

export async function sendSms({ to, message }: SendSmsParams) {
  const API_KEY = process.env.TERMII_API_KEY;
  const SENDER_ID = process.env.TERMII_SENDER_ID;
  const BASE_URL = process.env.TERMII_BASE_URL || "https://api.ng.termii.com";

  if (!API_KEY || !SENDER_ID) {
    console.error("Termii configuration is missing in environment variables.");
    return { success: false, error: "Missing SMS configuration" };
  }

  // Termii requires numbers in international format without the '+'
  // Example: '08012345678' or '+2348012345678' should become '2348012345678'
  let formattedNumber = to.replace(/\D/g, ""); 
  if (formattedNumber.startsWith("0")) {
    formattedNumber = "234" + formattedNumber.substring(1);
  } else if (!formattedNumber.startsWith("234")) {
     // Fallback if someone enters an unusual format, though your DB standardizes it
     formattedNumber = "234" + formattedNumber;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/sms/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: formattedNumber,
        from: SENDER_ID,
        sms: message,
        type: "plain",
        channel: "generic", // 'generic' is usually best for transactional routing in Nigeria
        api_key: API_KEY,
      }),
    });

    const data = await response.json();

    if (!response.ok || data.code !== "ok") {
      console.error("Termii SMS Error:", data);
      return { success: false, error: data.message || "Failed to send SMS" };
    }

    return { success: true, messageId: data.message_id };
  } catch (error: any) {
    console.error("Termii Request Failed:", error);
    return { success: false, error: error.message };
  }
}
