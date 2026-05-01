type SendAuthOtpEmailInput = {
  email: string;
  otp: string;
  type: string;
};

export async function sendAuthOtpEmail({ email, otp, type }: SendAuthOtpEmailInput) {
  const apiUrl = process.env.ZEPTOMAIL_API_URL;
  const apiKey = process.env.ZEPTO_MAIL_API_KEY;
  const from = process.env.EMAIL_FROM;
  const fromName = process.env.EMAIL_FROM_NAME ?? "Family Photoshoot";

  if (!apiUrl || !apiKey || !from) {
    throw new Error(
      "Email OTP is not configured. Set ZEPTOMAIL_API_URL, ZEPTO_MAIL_API_KEY, and EMAIL_FROM.",
    );
  }

  const subject =
    type === "sign-in"
      ? "Your Family Photoshoot sign-in code"
      : "Your Family Photoshoot verification code";

  const text = [
    `Your code is ${otp}.`,
    "",
    "It expires in a few minutes. If you did not request this, you can ignore this email.",
  ].join("\n");

  const html = `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1f1a24; line-height: 1.5;">
      <p>Your Family Photoshoot code is:</p>
      <p style="font-size: 32px; letter-spacing: 0.18em; font-weight: 700; margin: 18px 0;">${otp}</p>
      <p style="color: #6b6474;">It expires in a few minutes. If you did not request this, you can ignore this email.</p>
    </div>
  `;

  const response = await fetch(`https://${apiUrl}v1.1/email`, {
    method: "POST",
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      from: {
        address: from,
        name: fromName,
      },
      to: [
        {
          email_address: {
            address: email,
          },
        },
      ],
      subject,
      htmlbody: html,
      textbody: text,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Failed to send OTP email (${response.status}): ${body.slice(0, 240)}`);
  }
}
