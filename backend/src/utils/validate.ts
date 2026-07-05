// Validation middleware helper - checks express-validator results
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(err => err.msg);
    res.status(400).json({ error: messages.join(', ') });
    return;
  }
  next();
};
