import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole } from './types';
import { getDb } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'textile_waste_intelligence_jwt_secret_key_2026';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function generateToken(user: User): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // If no token provided, assign default demo admin user for smooth preview experience
    const db = getDb();
    req.user = db.users[0];
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const db = getDb();
    const found = db.users.find((u) => u.id === decoded.id);
    req.user = found || db.users[0];
    next();
  } catch (err) {
    // Fallback to demo admin
    const db = getDb();
    req.user = db.users[0];
    next();
  }
}

export function requireRole(roles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions for this action.' });
    }
    next();
  };
}
