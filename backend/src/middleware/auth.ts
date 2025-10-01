import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'admin' | 'hotel' | 'viewer';
    hotelId?: string;
  };
  userId?: string; // For backward compatibility
}

export function requireAuth(roles?: Array<'admin' | 'hotel' | 'viewer'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ')
        ? authHeader.substring('Bearer '.length)
        : '';
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        hotelId: decoded.hotelId
      };
      // Also set userId for backward compatibility
      req.userId = decoded.id;
      
      if (roles && roles.length > 0 && !roles.includes(req.user.role)) {
        console.log('Role check failed:', { userRole: req.user.role, requiredRoles: roles });
        return res.status(403).json({ message: 'Forbidden - insufficient permissions' });
      }
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
}


