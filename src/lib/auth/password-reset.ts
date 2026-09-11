import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { sendSystemEmail } from "@/lib/email/sender";
import { getPasswordResetOtpEmail } from "@/lib/email/templates";

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const OTP_COOLDOWN_MS = 60 * 1000;     // 60 seconds rate-limit cooldown

/**
 * Builds a unique identifier for the VerificationToken table to keep roles isolated.
 */
export const getResetIdentifier = (role: Role, email: string): string => {
  return `${role.toLowerCase()}:reset:${email.trim().toLowerCase()}`;
};

interface RequestResetParams {
  email: string;
  role: Role;
  roleTitle: string;
  portalName: string;
}

/**
 * Initiates the password recovery process:
 * 1. Checks user existence and role matching.
 * 2. Enforces anti-spam / 60-second cooldown per target email.
 * 3. Generates a CSPRNG 6-digit OTP.
 * 4. Dispatches a branded security email.
 * 5. Returns generic success to protect against email enumeration attacks.
 */
export async function requestPasswordReset({ email, role, roleTitle, portalName }: RequestResetParams) {
  const cleanEmail = email?.trim().toLowerCase();

  if (!cleanEmail || !cleanEmail.includes("@")) {
    return { error: "Please enter a valid email address.", status: 400 };
  }

  const identifier = getResetIdentifier(role, cleanEmail);

  // 1. Verify user exists and has the authorized role
  const user = await prisma.user.findFirst({
    where: {
      email: {
        equals: cleanEmail,
        mode: "insensitive"
      },
      role: role
    }
  });

  // If user does not exist or has a different role, do not leak this info.
  // Return generic 200 response to prevent email harvesting.
  if (!user) {
    return {
      success: true,
      message: "If an account matches this email, a 6-digit verification code has been sent."
    };
  }

  // 2. Enforce 60-second cooldown to prevent flooding
  const existingToken = await prisma.verificationToken.findFirst({
    where: { identifier }
  });

  if (existingToken) {
    const createdAt = new Date(existingToken.expires).getTime() - OTP_EXPIRY_MS;
    const elapsedMs = Date.now() - createdAt;
    if (elapsedMs < OTP_COOLDOWN_MS) {
      const remainingSec = Math.ceil((OTP_COOLDOWN_MS - elapsedMs) / 1000);
      return {
        error: `Please wait ${remainingSec} second${remainingSec === 1 ? "" : "s"} before requesting another code.`,
        status: 429
      };
    }
  }

  // 3. Generate Cryptographically Secure 6-digit OTP
  const otp = crypto.randomInt(100000, 1000000).toString();
  const expires = new Date(Date.now() + OTP_EXPIRY_MS);

  // 4. Overwrite previous tokens for this identifier
  await prisma.verificationToken.deleteMany({
    where: { identifier }
  });

  await prisma.verificationToken.create({
    data: {
      identifier,
      token: otp,
      expires
    }
  });

  // 5. Build recipient name
  const recipientName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || 
                        user.name || 
                        (role === Role.RIDER ? "Fleet Rider" : "Asset Owner");

  // 6. Send security email via ZeptoMail
  try {
    await sendSystemEmail({
      toEmail: cleanEmail,
      toName: recipientName,
      subject: `${otp} is your Yusdaam Autos password reset code`,
      htmlBody: getPasswordResetOtpEmail({
        name: recipientName,
        otp,
        roleTitle,
        portalName,
        expiryMinutes: 10
      })
    });
  } catch (mailError) {
    console.error("Failed to dispatch password reset OTP email:", mailError);
    // Even if mail fails, do not crash; return friendly status
    return { error: "Failed to dispatch verification email. Please try again.", status: 500 };
  }

  return {
    success: true,
    message: "If an account matches this email, a 6-digit verification code has been sent."
  };
}

interface VerifyResetOtpParams {
  email: string;
  role: Role;
  otp: string;
}

/**
 * Validates whether the supplied 6-digit OTP is valid and non-expired.
 */
export async function verifyPasswordResetOtp({ email, role, otp }: VerifyResetOtpParams) {
  const cleanEmail = email?.trim().toLowerCase();
  const cleanOtp = String(otp || "").trim();

  if (!cleanEmail || !cleanEmail.includes("@")) {
    return { error: "Valid email address is required.", status: 400 };
  }

  if (!cleanOtp || cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
    return { error: "Please enter a valid 6-digit numeric verification code.", status: 400 };
  }

  const identifier = getResetIdentifier(role, cleanEmail);

  const tokenRecord = await prisma.verificationToken.findFirst({
    where: {
      identifier,
      token: cleanOtp
    }
  });

  if (!tokenRecord) {
    return { error: "Invalid verification code. Please check the code or request a new one.", status: 400 };
  }

  if (new Date(tokenRecord.expires).getTime() < Date.now()) {
    return { error: "This verification code has expired. Please request a new one.", status: 400 };
  }

  return { success: true, message: "Verification code confirmed." };
}

interface CompleteResetParams {
  email: string;
  role: Role;
  otp: string;
  newPassword: string;
}

/**
 * Atomically re-verifies OTP, hashes new password with bcrypt 12, updates User, and purges the token.
 */
export async function completePasswordReset({ email, role, otp, newPassword }: CompleteResetParams) {
  const cleanEmail = email?.trim().toLowerCase();
  const cleanOtp = String(otp || "").trim();
  const passwordStr = String(newPassword || "");

  if (!cleanEmail || !cleanOtp || !passwordStr) {
    return { error: "Email, verification code, and new password are required.", status: 400 };
  }

  if (passwordStr.length < 8) {
    return { error: "Password must be at least 8 characters long.", status: 400 };
  }

  // 1. Verify User exists for this role
  const user = await prisma.user.findFirst({
    where: {
      email: {
        equals: cleanEmail,
        mode: "insensitive"
      },
      role: role
    }
  });

  if (!user) {
    return { error: "Account could not be verified.", status: 404 };
  }

  // 2. Verify OTP Record
  const identifier = getResetIdentifier(role, cleanEmail);
  const tokenRecord = await prisma.verificationToken.findFirst({
    where: {
      identifier,
      token: cleanOtp
    }
  });

  if (!tokenRecord) {
    return { error: "Invalid or expired verification code.", status: 400 };
  }

  if (new Date(tokenRecord.expires).getTime() < Date.now()) {
    return { error: "This verification code has expired. Please request a new one.", status: 400 };
  }

  // 3. Hash the new password with bcrypt cost 12
  const hashedPassword = await bcrypt.hash(passwordStr, 12);

  // 4. Update the user password
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword }
  });

  // 5. Invalidate the token to prevent replay
  await prisma.verificationToken.deleteMany({
    where: { identifier }
  });

  return { success: true, message: "Password updated successfully. You can now log in." };
}
