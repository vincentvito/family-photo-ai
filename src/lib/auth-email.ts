type SendAuthOtpEmailInput = {
  email: string;
  otp: string;
  type: string;
};

type SendWelcomeEmailInput = {
  email: string;
  name?: string | null;
};

export async function sendAuthOtpEmail({ email, otp, type }: SendAuthOtpEmailInput) {
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

  await sendZeptoEmail({
    to: email,
    subject,
    html: renderOtpEmail({ otp, type }),
    text,
  });
}

export async function sendWelcomeEmail({ email, name }: SendWelcomeEmailInput) {
  const appUrl = getAppUrl();
  const studioUrl = `${appUrl.replace(/\/$/, "")}/studio/roster`;
  const greeting = name?.trim() ? `Hi ${name.trim().split(/\s+/)[0]},` : "Hi there,";

  await sendZeptoEmail({
    to: email,
    subject: "Welcome to FamilyShoot - a note from Matteo and Vlad",
    html: renderWelcomeEmail({ greeting, studioUrl }),
    text: [
      "Welcome to FamilyShoot",
      "",
      greeting,
      "",
      "Welcome, and thank you for signing up. We are Matteo and Vlad, the founders of FamilyShoot, and we are so glad you are here.",
      "",
      "Your private studio is ready whenever you want to gather the people you love, choose a look, and turn everyday photos into something worth framing.",
      "",
      "A gentle place to start:",
      "- Add one clear photo of each person, ideally down to at least shoulder level so the AI can better understand proportions",
      "- Pick a vibe that feels like your family",
      "- Keep, share, or print the portraits you love",
      "",
      `Open your studio: ${studioUrl}`,
      "",
      "You can reach out to us anytime by using the feedback bubble on the right side of the app. We would love to hear what you like, what you didn't like, and what would make FamilyShoot better for you.",
      "",
      "Your photos stay private to your account, and you can come back at your own pace.",
      "",
      "Warmly,",
      "FamilyShoot",
    ].join("\n"),
  });
}

async function sendZeptoEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const apiUrl = process.env.ZEPTOMAIL_API_URL;
  const apiKey = process.env.ZEPTO_MAIL_API_KEY;
  const from = process.env.EMAIL_FROM;
  const fromName = process.env.EMAIL_FROM_NAME ?? "Family Photoshoot";

  if (!apiUrl || !apiKey || !from) {
    throw new Error(
      "Email is not configured. Set ZEPTOMAIL_API_URL, ZEPTO_MAIL_API_KEY, and EMAIL_FROM.",
    );
  }

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
            address: to,
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
    throw new Error(`Failed to send email (${response.status}): ${body.slice(0, 240)}`);
  }
}

function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://familyshoot.com"
  );
}

function renderBrandHeader() {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                  <tr>
                    <td style="width:40px; height:40px; border-radius:999px; background:#f26b4a; color:#ffffff; font-family:Arial, Helvetica, sans-serif; font-size:12px; font-weight:700; letter-spacing:2px; text-align:center; vertical-align:middle;">
                      FS
                    </td>
                    <td style="padding-left:12px; font-family:Georgia, 'Times New Roman', serif; font-size:22px; line-height:1; color:#1f1a24;">
                      FamilyShoot
                    </td>
                  </tr>
                </table>`;
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
                ${renderBrandHeader()}
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

function renderWelcomeEmail({ greeting, studioUrl }: { greeting: string; studioUrl: string }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>Welcome to FamilyShoot</title>
  </head>
  <body style="margin:0; padding:0; background:#f7efe8;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">
      A welcome note from Matteo and Vlad.
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7efe8; border-collapse:collapse;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; border-collapse:collapse;">
            <tr>
              <td style="padding:0 0 14px 0;">
                ${renderBrandHeader()}
              </td>
            </tr>
            <tr>
              <td style="background:#fffdf9; border:1px solid #eadfd5; border-radius:24px; overflow:hidden; box-shadow:0 18px 44px rgba(61, 43, 35, 0.12);">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                  <tr>
                    <td style="background:#1f1a24; padding:30px 30px 32px 30px;">
                      <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#ffd27a;">
                        Your private studio
                      </p>
                      <h1 style="margin:12px 0 0 0; font-family:Georgia, 'Times New Roman', serif; font-size:34px; line-height:1.08; font-weight:400; color:#fffdf9;">
                        Welcome to the studio.
                      </h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:30px;">
                      <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:16px; line-height:1.6; color:#4f4858;">
                        ${escapeHtml(greeting)}
                      </p>
                      <p style="margin:16px 0 0 0; font-family:Arial, Helvetica, sans-serif; font-size:16px; line-height:1.6; color:#4f4858;">
                        Welcome, and thank you for signing up. We are Matteo and Vlad, the founders of FamilyShoot, and we are so glad you are here.
                      </p>
                      <p style="margin:16px 0 0 0; font-family:Arial, Helvetica, sans-serif; font-size:16px; line-height:1.6; color:#4f4858;">
                        Your private studio is ready whenever you want to gather the people you love, choose a look, and turn everyday photos into something worth framing.
                      </p>

                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0; border-collapse:collapse;">
                        <tr>
                          <td style="background:#fbf5ef; border:1px solid #f1d8ca; border-radius:18px; padding:22px;">
                            <p style="margin:0 0 12px 0; font-family:Arial, Helvetica, sans-serif; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#8d5860;">
                              A gentle place to start
                            </p>
                            <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:15px; line-height:1.65; color:#4f4858;">
                              Add one clear photo of each person, ideally down to at least shoulder level so the AI can better understand proportions. Then pick a vibe that feels like your family.
                            </p>
                          </td>
                        </tr>
                      </table>

                      <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                        <tr>
                          <td style="background:#f26b4a; border-radius:999px;">
                            <a href="${escapeHtml(studioUrl)}" style="display:inline-block; padding:14px 22px; font-family:Arial, Helvetica, sans-serif; font-size:15px; font-weight:700; color:#ffffff; text-decoration:none;">
                              Open your studio
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin:24px 0 0 0; font-family:Arial, Helvetica, sans-serif; font-size:14px; line-height:1.55; color:#6b6474;">
                        You can reach out to us anytime by using the feedback bubble on the right side of the app. We would love to hear what you like, what you didn't like, and what would make FamilyShoot better for you.
                      </p>

                      <p style="margin:16px 0 0 0; font-family:Arial, Helvetica, sans-serif; font-size:14px; line-height:1.55; color:#6b6474;">
                        Your photos stay private to your account, and you can come back at your own pace.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:18px 30px; background:#fbf8f3; border-top:1px solid #eadfd5;">
                      <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:12px; line-height:1.5; color:#8a8291;">
                        Warmly,<br />
                        FamilyShoot
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
