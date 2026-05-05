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
    type === "sign-in" ? "Your FamilyShoot sign-in code" : "Your FamilyShoot verification code";

  const text = [
    "FamilyShoot",
    "",
    type === "sign-in"
      ? "Use this code to enter your private studio:"
      : "Use this code to verify your email:",
    "",
    otp,
    "",
    "This code expires in a few minutes.",
    "If you did not request it, you can safely ignore this email.",
  ].join("\n");

  const html = renderOtpEmail({ otp, type });

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

function renderOtpEmail({ otp, type }: { otp: string; type: string }) {
  const intro =
    type === "sign-in"
      ? "Use this code to enter your private studio."
      : "Use this code to verify your email.";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>Your FamilyShoot code</title>
  </head>
  <body style="margin:0; padding:0; background:#f7efe8;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">
      Your FamilyShoot code is ${escapeHtml(otp)}. It expires in a few minutes.
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7efe8; border-collapse:collapse;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; border-collapse:collapse;">
            <tr>
              <td style="padding:0 0 14px 0;">
                <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                  <tr>
                    <td style="width:40px; height:40px; border-radius:999px; background:#f26b4a; color:#ffffff; font-family:Arial, Helvetica, sans-serif; font-size:12px; font-weight:700; letter-spacing:2px; text-align:center; vertical-align:middle;">
                      FS
                    </td>
                    <td style="padding-left:12px; font-family:Georgia, 'Times New Roman', serif; font-size:22px; line-height:1; color:#1f1a24;">
                      FamilyShoot
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="background:#fffdf9; border:1px solid #eadfd5; border-radius:24px; overflow:hidden; box-shadow:0 18px 44px rgba(61, 43, 35, 0.12);">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                  <tr>
                    <td style="background:#1f1a24; padding:26px 28px;">
                      <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#ffd27a;">
                        Private studio access
                      </p>
                      <h1 style="margin:10px 0 0 0; font-family:Georgia, 'Times New Roman', serif; font-size:32px; line-height:1.08; font-weight:400; color:#fffdf9;">
                        Your sign-in code is ready.
                      </h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:28px;">
                      <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:16px; line-height:1.55; color:#4f4858;">
                        ${intro}
                      </p>

                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0; border-collapse:collapse;">
                        <tr>
                          <td align="center" style="background:#fbf5ef; border:1px solid #f1d8ca; border-radius:18px; padding:24px 18px;">
                            <div style="font-family:Arial, Helvetica, sans-serif; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#8d5860;">
                              One-time code
                            </div>
                            <div style="margin-top:10px; font-family:Arial, Helvetica, sans-serif; font-size:40px; line-height:1; font-weight:800; letter-spacing:10px; color:#1f1a24;">
                              ${escapeHtml(otp)}
                            </div>
                          </td>
                        </tr>
                      </table>

                      <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:14px; line-height:1.55; color:#6b6474;">
                        This code expires in a few minutes. If you did not request it, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:18px 28px; background:#fbf8f3; border-top:1px solid #eadfd5;">
                      <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:12px; line-height:1.5; color:#8a8291;">
                        FamilyShoot keeps your studio private with email codes instead of passwords.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
