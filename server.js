require('dotenv').config();
const express    = require('express');
const mongoose   = require('mongoose');
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const cors       = require('cors');
const nodemailer = require('nodemailer');
const User       = require('./models/User');
const {
  welcomeEmail,
  resetPasswordEmail,
  loginAlertEmail
} = require('./emailTemplates');

const app = express();
app.use(express.json());
app.use(cors({ origin: 'https://e-missionpreneur.netlify.app' }));

// ════════════════════════════
// CONNECT TO MONGODB
// ════════════════════════════
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => { console.error('❌ MongoDB error:', err.message); process.exit(1); });

// ════════════════════════════
// EMAIL TRANSPORTER (Gmail)
// ════════════════════════════
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,  // your Gmail address
    pass: process.env.EMAIL_PASS   // your 16-char App Password
  }
});

// Test email connection on startup
transporter.verify((err, success) => {
  if (err) {
    console.warn('⚠️  Email not configured:', err.message);
    console.warn('   Add EMAIL_USER and EMAIL_PASS to your .env file');
  } else {
    console.log('✅ Email service ready →', process.env.EMAIL_USER);
  }
});

// ── Helper: send email safely (won't crash server if email fails)
async function sendEmail(to, subject, html) {
  try {
    const info = await transporter.sendMail({
      from: `"E-MissionPreneur" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log(`📧 Email sent → ${to} (${subject})`);
    return true;
  } catch (err) {
    console.error(`❌ Email failed → ${to}:`, err.message);
    return false; // Don't crash the server — just log it
  }
}

// ════════════════════════════
// POST /api/register
// ════════════════════════════
app.post('/api/register', async (req, res) => {
  try {
    const { fname, lname, email, company, tier, password } = req.body;

    // Validation
    if (!fname || !lname || !email || !company || !password)
      return res.status(400).json({ message: 'All required fields must be filled.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ message: 'Invalid email address.' });
    if (password.length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing)
      return res.status(400).json({ message: 'This email is already registered. Please sign in.' });

    const hashed = await bcrypt.hash(password, 12);
    const user   = await User.create({
      fname: fname.trim(), lname: lname.trim(),
      email: email.toLowerCase().trim(),
      company: company.trim(),
      tier: tier || 'exploring',
      password: hashed
    });

    console.log(`✅ Registered: ${user.email}`);

    // ── Send welcome email (async — don't wait for it)
    const { subject, html } = welcomeEmail(user.fname, user.tier);
    sendEmail(user.email, subject, html);

    res.status(201).json({ message: 'Account created successfully!', userId: user._id });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// ════════════════════════════
// POST /api/login
// ════════════════════════════
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required.' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ message: 'Invalid email or password.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid email or password.' });

    const token = jwt.sign(
      { userId: user._id, email: user.email, fname: user.fname, tier: user.tier, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`✅ Login: ${user.email}`);

    // ── Send login alert email (async — don't wait for it)
    const { subject, html } = loginAlertEmail(user.fname, user.email);
    sendEmail(user.email, subject, html);

    res.json({
      token,
      fname:   user.fname,
      lname:   user.lname,
      email:   user.email,
      company: user.company,
      tier:    user.tier
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// ════════════════════════════
// POST /api/forgot-password
// ════════════════════════════
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always return success (security — don't reveal if email exists)
    if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' });

    // Generate reset token (1 hour)
    const resetToken = jwt.sign(
      { userId: user._id, email: user.email, purpose: 'reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Build reset link — change to your live URL when deployed
    const BASE_URL  = process.env.FRONTEND_URL || 'https://e-missionpreneur.netlify.app';

    const resetLink = `${BASE_URL}/reset-password.html?token=${resetToken}`;

    console.log(`\n🔑 Reset requested: ${user.email}`);
    console.log(`📧 Reset link: ${resetLink}\n`);

    // ── Send password reset email
    const { subject, html } = resetPasswordEmail(user.fname, resetLink);
    const sent = await sendEmail(user.email, subject, html);

    if (!sent) {
      // Email failed but still log the link so you can test
      console.log('⚠️  Email failed — use the link above to test manually');
    }

    res.json({ message: 'If that email exists, a reset link has been sent.' });

  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// ════════════════════════════
// POST /api/reset-password
// ════════════════════════════
app.post('/api/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password)
      return res.status(400).json({ message: 'Token and new password are required.' });
    if (password.length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError')
        return res.status(403).json({ message: 'Reset link has expired. Please request a new one.' });
      return res.status(403).json({ message: 'Invalid reset link.' });
    }

    if (decoded.purpose !== 'reset')
      return res.status(403).json({ message: 'Invalid reset token.' });

    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.password = await bcrypt.hash(password, 12);
    await user.save();

    console.log(`✅ Password reset: ${user.email}`);
    res.json({ message: 'Password reset successfully! You can now sign in.' });

  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// ════════════════════════════
// POST /api/contact
// ════════════════════════════
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, company, tier, message } = req.body;
    console.log(`📩 Inquiry — ${name} (${email}) · ${company}`);

    // Notify admin
    sendEmail(
      process.env.EMAIL_USER,
      `New Contact Inquiry — ${name}`,
      `<p><strong>Name:</strong> ${name}</p>
       <p><strong>Email:</strong> ${email}</p>
       <p><strong>Company:</strong> ${company}</p>
       <p><strong>Tier interest:</strong> ${tier}</p>
       <p><strong>Message:</strong> ${message || 'None'}</p>`
    );

    res.json({ message: 'Thank you! We will be in touch soon.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// ════════════════════════════
// GET /api/me (protected)
// ════════════════════════════
app.get('/api/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// ── JWT middleware
function verifyToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided.' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(403).json({ message: 'Invalid or expired token.' });
  }
}

// ════════════════════════════
// GET /api/admin/users (admin only)
// ════════════════════════════
app.get("/api/admin/users", verifyAdminToken, async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ users, total: users.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// PATCH /api/admin/users/:id/status
app.patch("/api/admin/users/:id/status", verifyAdminToken, async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    console.log(`✅ Status updated: ${user.email} → ${isActive ? "active" : "suspended"}`);
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// ── Admin JWT middleware (requires role: admin)
function verifyAdminToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided." });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Admin access required." });
    }
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ message: "Invalid or expired token." });
  }
}

// ── Health check
app.get('/', (req, res) => {
  res.json({ status: '✅ E-MissionPreneur API running', version: '1.0' });
});

// ── Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server → http://localhost:${PORT}`);
  console.log(`📋 Routes:`);
  console.log(`   POST /api/register`);
  console.log(`   POST /api/login`);
  console.log(`   POST /api/forgot-password`);
  console.log(`   POST /api/reset-password`);
  console.log(`   POST /api/contact`);
  console.log(`   GET  /api/me\n`);
});