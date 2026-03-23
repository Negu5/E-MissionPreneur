// ════════════════════════════════════════════
// emailTemplates.js
// HTML email templates for E-MissionPreneur
// ════════════════════════════════════════════

const BASE_STYLE = `
  font-family: 'Georgia', serif;
  max-width: 600px;
  margin: 0 auto;
  background: #ffffff;
`;

const HEADER = (subtitle = '') => `
  <div style="background: #0A2540; padding: 36px 40px; text-align: center; border-radius: 10px 10px 0 0;">
    <div style="font-size: 1.5rem; font-weight: 700; color: #ffffff; letter-spacing: -0.01em;">
      <span style="color: #D4AF37;">E-</span>MissionPreneur
    </div>
    ${subtitle ? `<div style="color: rgba(255,255,255,0.55); font-size: 0.85rem; margin-top: 6px; font-family: sans-serif;">${subtitle}</div>` : ''}
  </div>
`;

const FOOTER_HTML = `
  <div style="background: #0A2540; padding: 28px 40px; text-align: center; border-radius: 0 0 10px 10px; margin-top: 0;">
    <p style="color: rgba(255,255,255,0.35); font-size: 0.78rem; font-family: sans-serif; margin: 0 0 6px;">
      © 2026 E-MissionPreneur · Philippines
    </p>
    <p style="color: rgba(212,175,55,0.5); font-size: 0.8rem; font-style: italic; font-family: Georgia, serif; margin: 0;">
      "Whatever you do, work at it with all your heart." — Col. 3:23
    </p>
  </div>
`;

const DIVIDER = `<hr style="border: none; border-top: 1px solid #f0f0f0; margin: 24px 0;"/>`;

const BTN = (text, url) => `
  <div style="text-align: center; margin: 28px 0;">
    <a href="${url}"
      style="display: inline-block; background: #D4AF37; color: #0A2540;
             padding: 14px 32px; border-radius: 6px; font-weight: 700;
             font-size: 0.95rem; font-family: sans-serif; text-decoration: none;
             letter-spacing: 0.03em;">
      ${text}
    </a>
  </div>
`;

// ════════════════════════════════════════════
// 1. WELCOME EMAIL — sent after registration
// ════════════════════════════════════════════
function welcomeEmail(fname, tier) {
  const tierLabel = {
    forum:     'Forum Member',
    premium:   'A.C.E.S. Premium',
    partner:   'Impact Partner',
    exploring: 'Exploring'
  }[tier] || 'Member';

  return {
    subject: `Welcome to E-MissionPreneur, ${fname}! 🕊️`,
    html: `
    <div style="${BASE_STYLE}">
      ${HEADER('Kingdom Business · Philippines')}
      <div style="padding: 36px 40px; background: #ffffff;">
        <h2 style="color: #0A2540; font-size: 1.6rem; margin: 0 0 8px;">
          Welcome to the Movement, <em style="color: #D4AF37;">${fname}!</em>
        </h2>
        <p style="color: #5a6478; font-size: 0.95rem; line-height: 1.8; font-family: sans-serif;">
          We are so glad you're here. E-MissionPreneur is more than a business network — 
          it is a movement of Christ-following entrepreneurs building profitable companies 
          while caring for the least of these.
        </p>

        ${DIVIDER}

        <div style="background: #f8f9fb; border-radius: 10px; padding: 24px; margin: 20px 0;">
          <div style="font-size: 0.7rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #D4AF37; margin-bottom: 10px; font-family: sans-serif;">
            Your Membership
          </div>
          <div style="font-size: 1.3rem; font-weight: 700; color: #0A2540; font-family: sans-serif;">
            ${tierLabel}
          </div>
          <div style="font-size: 0.82rem; color: #9aa3b0; margin-top: 4px; font-family: sans-serif;">
            Member since 2026
          </div>
        </div>

        <p style="color: #5a6478; font-size: 0.9rem; line-height: 1.8; font-family: sans-serif;">
          Here's what to expect next:
        </p>
        <ul style="color: #5a6478; font-size: 0.9rem; line-height: 2; font-family: sans-serif; padding-left: 20px;">
          <li>📅 A member coordinator will reach out within <strong>2 business days</strong></li>
          <li>🤝 You'll be matched with a peer forum group</li>
          <li>✦ Access to your A.C.E.S. resource dashboard</li>
          <li>🕊️ Onboarding to the 10% Impact Pledge</li>
        </ul>

        ${BTN('Go to My Dashboard →', 'http://127.0.0.1:5500/NEW/dashboard.html')}

        ${DIVIDER}

        <div style="border-left: 3px solid #D4AF37; padding-left: 18px; margin: 20px 0;">
          <p style="font-style: italic; color: #0A2540; font-size: 1rem; line-height: 1.7; margin: 0;">
            "Religion that God our Father accepts as pure and faultless is this: 
            to look after orphans and widows in their distress."
          </p>
          <p style="color: #D4AF37; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em; 
                     text-transform: uppercase; font-family: sans-serif; margin: 8px 0 0;">
            James 1:27
          </p>
        </div>

        <p style="color: #9aa3b0; font-size: 0.82rem; font-family: sans-serif; margin-top: 24px;">
          Together, we build businesses that last for eternity. 🙏<br/>
          <strong style="color: #0A2540;">The E-MissionPreneur Team</strong>
        </p>
      </div>
      ${FOOTER_HTML}
    </div>`
  };
}

// ════════════════════════════════════════════
// 2. PASSWORD RESET EMAIL
// ════════════════════════════════════════════
function resetPasswordEmail(fname, resetLink) {
  return {
    subject: `Reset Your E-MissionPreneur Password 🔐`,
    html: `
    <div style="${BASE_STYLE}">
      ${HEADER('Account Security')}
      <div style="padding: 36px 40px; background: #ffffff;">
        <h2 style="color: #0A2540; font-size: 1.5rem; margin: 0 0 8px;">
          Password Reset Request
        </h2>
        <p style="color: #5a6478; font-size: 0.95rem; line-height: 1.8; font-family: sans-serif;">
          Hi <strong>${fname}</strong>, we received a request to reset the password 
          for your E-MissionPreneur account.
        </p>

        ${DIVIDER}

        <div style="background: #fff8e8; border: 1px solid rgba(212,175,55,0.3); 
                     border-radius: 10px; padding: 20px 24px; margin: 20px 0;">
          <p style="color: #0A2540; font-size: 0.88rem; font-family: sans-serif; margin: 0;">
            ⏱ This reset link is valid for <strong>1 hour only</strong>. 
            After that you'll need to request a new one.
          </p>
        </div>

        ${BTN('Reset My Password →', resetLink)}

        <p style="color: #9aa3b0; font-size: 0.82rem; font-family: sans-serif; 
                   text-align: center; margin-top: -12px;">
          Or copy this link into your browser:<br/>
          <span style="color: #0A2540; word-break: break-all; font-size: 0.75rem;">${resetLink}</span>
        </p>

        ${DIVIDER}

        <div style="background: #f8f9fb; border-radius: 8px; padding: 16px 20px;">
          <p style="color: #9aa3b0; font-size: 0.82rem; font-family: sans-serif; margin: 0; line-height: 1.6;">
            🛡️ <strong style="color: #0A2540;">Didn't request this?</strong> 
            You can safely ignore this email. Your password will not be changed 
            unless you click the link above.
          </p>
        </div>

        <p style="color: #9aa3b0; font-size: 0.82rem; font-family: sans-serif; margin-top: 24px;">
          Stay secure,<br/>
          <strong style="color: #0A2540;">The E-MissionPreneur Team</strong>
        </p>
      </div>
      ${FOOTER_HTML}
    </div>`
  };
}

// ════════════════════════════════════════════
// 3. LOGIN ALERT EMAIL
// ════════════════════════════════════════════
function loginAlertEmail(fname, email) {
  const now      = new Date();
  const dateStr  = now.toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr  = now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });

  return {
    subject: `New Sign-In to Your E-MissionPreneur Account`,
    html: `
    <div style="${BASE_STYLE}">
      ${HEADER('Security Alert')}
      <div style="padding: 36px 40px; background: #ffffff;">
        <h2 style="color: #0A2540; font-size: 1.5rem; margin: 0 0 8px;">
          New Login Detected
        </h2>
        <p style="color: #5a6478; font-size: 0.95rem; line-height: 1.8; font-family: sans-serif;">
          Hi <strong>${fname}</strong>, we detected a new sign-in to your 
          E-MissionPreneur account.
        </p>

        ${DIVIDER}

        <div style="background: #f8f9fb; border-radius: 10px; padding: 24px; margin: 20px 0;">
          <table style="width: 100%; font-family: sans-serif; font-size: 0.88rem;">
            <tr>
              <td style="color: #9aa3b0; padding: 6px 0; width: 40%;">📧 Account</td>
              <td style="color: #0A2540; font-weight: 600;">${email}</td>
            </tr>
            <tr>
              <td style="color: #9aa3b0; padding: 6px 0;">📅 Date</td>
              <td style="color: #0A2540; font-weight: 600;">${dateStr}</td>
            </tr>
            <tr>
              <td style="color: #9aa3b0; padding: 6px 0;">🕐 Time</td>
              <td style="color: #0A2540; font-weight: 600;">${timeStr}</td>
            </tr>
          </table>
        </div>

        <div style="background: #f0faf5; border: 1px solid rgba(46,125,94,0.2); 
                     border-radius: 10px; padding: 18px 22px; margin: 20px 0;">
          <p style="color: #2E7D5E; font-size: 0.88rem; font-family: sans-serif; margin: 0;">
            ✅ <strong>This was you?</strong> No action needed — you're all set!
          </p>
        </div>

        <div style="background: #fff8f8; border: 1px solid rgba(224,82,82,0.2); 
                     border-radius: 10px; padding: 18px 22px; margin: 20px 0;">
          <p style="color: #e05252; font-size: 0.88rem; font-family: sans-serif; margin: 0 0 10px;">
            ⚠️ <strong>Wasn't you?</strong> Reset your password immediately:
          </p>
          ${BTN('Reset My Password Now →', 'http://127.0.0.1:5500/NEW/forgot-password.html')}
        </div>

        <p style="color: #9aa3b0; font-size: 0.82rem; font-family: sans-serif; margin-top: 24px;">
          Keeping your account safe,<br/>
          <strong style="color: #0A2540;">The E-MissionPreneur Team</strong>
        </p>
      </div>
      ${FOOTER_HTML}
    </div>`
  };
}

module.exports = { welcomeEmail, resetPasswordEmail, loginAlertEmail };