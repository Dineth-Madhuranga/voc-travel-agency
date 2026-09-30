import nodemailer from 'nodemailer';
import { connectDB, Inquiry } from './utils/db.js';
import jwt from 'jsonwebtoken';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function verifyToken(req) {
  const auth = req.headers['authorization'] || '';
  const token = auth.replace('Bearer ', '');
  if (!token) throw new Error('No token');
  return jwt.verify(token, process.env.JWT_SECRET || 'changeme');
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function buildTeamEmail(inquiry) {
  const rows = [
    ['Name', inquiry.name],
    ['Email', inquiry.email],
    ['Phone', inquiry.phone || '—'],
    inquiry.kind === 'booking'
      ? ['Journey', inquiry.package_name || 'Not sure yet']
      : ['Type', 'Contact message'],
    ...(inquiry.kind === 'booking'
      ? [['Arrival date', inquiry.arrival_date || '—'], ['Travelers', String(inquiry.travelers || '—')]]
      : []),
  ];
  const detailsHtml = rows
    .map(([l, v]) => `<tr><td style="padding:6px 16px 6px 0;color:#5a6b60;font-weight:500;">${escapeHtml(l)}</td><td>${escapeHtml(v)}</td></tr>`)
    .join('');
  const msg = inquiry.message
    ? `<div style="margin-top:24px;padding:16px;background:#f6f1e6;border-radius:8px;">${escapeHtml(inquiry.message)}</div>`
    : '';
  return `<!doctype html><html><body style="margin:0;background:#14201a;font-family:Inter,Arial,sans-serif;">
<div style="max-width:560px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;">
  <div style="background:#1d2b22;padding:28px 32px;color:#f6f1e6;">
    <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#d9b585;font-weight:600;">Voice of Ceylon Travels</div>
    <div style="font-family:Georgia,serif;font-size:22px;margin-top:6px;">${inquiry.kind === 'booking' ? 'New Journey Enquiry' : 'New Contact Message'}</div>
  </div>
  <div style="padding:28px 32px;color:#1c1c1a;">
    <table style="border-collapse:collapse;font-size:14px;">${detailsHtml}</table>
    ${msg}
    <p style="margin-top:24px;font-size:13px;color:#5a6b60;">Reply to this email to contact the guest directly.</p>
  </div>
  <div style="padding:18px 32px;background:#f6f1e6;font-size:11px;color:#5a6b60;">© 2025 Voice of Ceylon Travels</div>
</div></body></html>`;
}

function buildGuestEmail(inquiry) {
  const firstName = inquiry.name.split(' ')[0] || 'there';
  return `<!doctype html><html><body style="margin:0;background:#14201a;font-family:Inter,Arial,sans-serif;">
<div style="max-width:560px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;">
  <div style="background:#1d2b22;padding:28px 32px;color:#f6f1e6;">
    <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#d9b585;font-weight:600;">Voice of Ceylon Travels</div>
    <div style="font-family:Georgia,serif;font-size:22px;margin-top:6px;">We've received your enquiry.</div>
  </div>
  <div style="padding:28px 32px;color:#1c1c1a;">
    <p>Hi ${escapeHtml(firstName)},</p>
    <p>Thank you for reaching out to Voice of Ceylon Travels! We have received your ${inquiry.kind === 'booking' ? 'journey enquiry' : 'message'} and our travel team will be in touch with you very soon.</p>
    ${inquiry.message ? `<div style="margin-top:16px;padding:16px;background:#f6f1e6;border-radius:8px;font-size:14px;color:#5a6b60;"><strong>Your message:</strong><br/>${escapeHtml(inquiry.message)}</div>` : ''}
    <p style="margin-top:24px;">With warm regards,<br/><strong>Voice of Ceylon Travels Team</strong></p>
    <p style="font-size:13px;color:#5a6b60;">📧 infovoceylontravels@gmail.com<br/>📞 0766724916</p>
  </div>
  <div style="padding:18px 32px;background:#f6f1e6;font-size:11px;color:#5a6b60;">© 2025 Voice of Ceylon Travels · 193/Katugastota, Kandy</div>
</div></body></html>`;
}

async function sendEmails(inquiry) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const teamEmail = process.env.TEAM_EMAIL || 'infovoceylontravels@gmail.com';
  const fromEmail = process.env.SMTP_USER;

  await Promise.all([
    transporter.sendMail({
      from: `"Voice of Ceylon Travels" <${fromEmail}>`,
      to: teamEmail,
      replyTo: inquiry.email,
      subject: inquiry.kind === 'booking'
        ? `New booking enquiry — ${inquiry.name}${inquiry.package_name ? ' · ' + inquiry.package_name : ''}`
        : `New contact message — ${inquiry.name}`,
      html: buildTeamEmail(inquiry),
    }),
    transporter.sendMail({
      from: `"Voice of Ceylon Travels" <${fromEmail}>`,
      to: inquiry.email,
      subject: 'We received your enquiry — Voice of Ceylon Travels',
      html: buildGuestEmail(inquiry),
    }),
  ]);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  await connectDB();

  // POST — save inquiry + send emails
  if (req.method === 'POST') {
    try {
      const { kind, name, email, phone, package_name, arrival_date, travelers, message } = req.body;
      if (!name || !email || !kind) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const inquiry = await Inquiry.create({ kind, name, email, phone, package_name, arrival_date, travelers, message });

      // Send emails (best-effort — don't fail the request if SMTP is not configured)
      try {
        await sendEmails(inquiry);
      } catch (emailErr) {
        console.error('Email sending failed:', emailErr.message);
      }

      return res.status(201).json({ ok: true, id: inquiry._id });
    } catch (err) {
      console.error('POST /api/inquiries error:', err);
      return res.status(500).json({ error: 'Could not save enquiry. Please try again.' });
    }
  }

  // GET — list all inquiries (protected)
  if (req.method === 'GET') {
    try {
      verifyToken(req);
    } catch {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const inquiries = await Inquiry.find().sort({ createdAt: -1 }).lean();
    // Normalize _id to id for frontend compatibility
    const data = inquiries.map(({ _id, createdAt, updatedAt, ...rest }) => ({
      id: _id.toString(),
      created_at: createdAt,
      ...rest,
    }));
    return res.status(200).json(data);
  }

  // PUT — update status (protected)
  if (req.method === 'PUT') {
    try {
      verifyToken(req);
    } catch {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { id, status } = req.body;
    if (!id || !status) return res.status(400).json({ error: 'id and status required' });
    await Inquiry.findByIdAndUpdate(id, { status });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
