import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@voiceofindigenous.com';
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  if (email !== adminEmail) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  let valid = false;
  if (adminPasswordHash) {
    // Compare against hashed password stored in env
    valid = await bcrypt.compare(password, adminPasswordHash);
  } else {
    // Fallback for initial setup: compare plain text ADMIN_PASSWORD
    const adminPassword = process.env.ADMIN_PASSWORD || 'changeme123';
    valid = password === adminPassword;
  }

  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { email: adminEmail, role: 'admin' },
    process.env.JWT_SECRET || 'changeme',
    { expiresIn: '8h' }
  );

  return res.status(200).json({ token, email: adminEmail });
}
