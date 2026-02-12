import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { DashboardService } from '../services/dashboard.service.js';
import { AppError } from '../utils/AppError.js';

export class DashboardController {
  private service = new DashboardService();

  getStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { start, end } = req.query;
      if (!start || !end) return next(new AppError('Date range required', 400));
      
      const stats = await this.service.getStats(
        req.user!.organization_id!, 
        String(start), 
        String(end)
      );
      res.json(stats);
    } catch (err) { next(err); }
  };

  getWidgets = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const widgets = await this.service.getWidgets(req.user!);
      res.json(widgets);
    } catch (err) { next(err); }
  };
}