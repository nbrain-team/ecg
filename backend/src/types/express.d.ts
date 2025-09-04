import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      hotelId?: string;
      file?: Express.Multer.File;
      files?: Express.Multer.File[];
    }
  }
}

export interface AuthenticatedRequest extends Request {
  userId?: string;
  hotelId?: string;
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}
