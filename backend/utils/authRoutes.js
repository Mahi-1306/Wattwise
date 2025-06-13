const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {sendOTPEmail,  verifyOTP} = require('./mail')
const verifyToken = require('../middleware/verifyToken')
const { PrismaClient } = require('@prisma/client');


const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = 'qwertyuiop@1234';

// 👉 Register Route
// Backend: routes/auth.js
router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  // Validate role if provided
  const validRoles = ["ADMIN", "USER", "GUEST"];
  if (role && !validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: role || "USER", // Default to USER if role is not provided
      },
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 👉 Login Route

// ratelimiter --> window time , count
/*router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Incorrect password' });
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
        user.token = token
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});*/

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    const token = jwt.sign({ userId: user.id, username: user.username,role:user.role ||"USER"}, JWT_SECRET, { expiresIn: '1h' });
    const payload = jwt.verify(token, JWT_SECRET);
   console.log('Payload:', payload);
    res.json({ token, payload });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/me', verifyToken, (req, res) => {
  res.json({ payload: req.user });
});

const verifiedOTPs = new Map();

router.post('/send-otp', async (req, res) => {
  const { username, email } = req.body;

  if (!username || !email) {
    return res.status(400).json({ error: 'Username and email are required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Send OTP with embedded username
    const token = await sendOTPEmail(email, user.username); // pass email for OTP delivery

    return res.status(200).json({ message: 'OTP sent successfully', token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
});


router.post('/verify-otp', (req, res) => {
  const { token, otp } = req.body;

  if (!token || !otp) {
    return res.status(400).json({ error: 'Token and OTP are required' });
  }

  const isValid = verifyOTP(token, otp);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid or expired OTP' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Store username for use during password reset
    verifiedOTPs.set(token, decoded.username);

    return res.status(200).json({ message: 'OTP verified successfully' });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
});


router.put('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required' });
  }

  const username = verifiedOTPs.get(token);
  if (!username) {
    return res.status(403).json({ error: 'OTP not verified or expired' });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { username },
      data: { password: hashedPassword },
    });

    verifiedOTPs.delete(token); // Invalidate the OTP after use

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update password' });
  }
});


router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        username: true,
        role: true
      }
    });

    // Add serial number (sno)
    const usersWithSno = users.map((user, index) => ({
      sno: index + 1,
      username: user.username,
      role: user.role
    }));

    res.status(200).json(usersWithSno);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
