const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET;

// Configurable debug logging (disable in production if needed)
const ENABLE_DEBUG_LOGGING = process.env.NODE_ENV !== 'production';

async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  // Check if Authorization header is present and properly formatted
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ message: 'No token provided or incorrect format' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    if (ENABLE_DEBUG_LOGGING) {
      console.log('Decoded token:', decoded);
    }

    // Fetch user from database, including role
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        role: true, // Include role for role-based access control
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Attach user data to request object
    console.log("Helloooooooooooooooooooooooooooooooooooooooo", user.id)
    req.user = {
      userId: user.id,
      username: user.username,
      role: user.role || 'USER', // Default to 'USER' if role is undefined
    };

    if (ENABLE_DEBUG_LOGGING) {
      console.log('Authenticated user:', req.user);
    }

    next();
  } catch (err) {
    console.error('Token verification error:', err);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(401).json({ message: 'Authentication failed' });
  } finally {
    // Ensure Prisma client disconnects to avoid connection leaks
    await prisma.$disconnect();
  }
}

module.exports = verifyToken;