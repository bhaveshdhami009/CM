import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { HearingService } from '../services/hearing.service.js';
import { AppError } from '../utils/AppError.js';
import { CreateHearingDto } from '../dto/hearing.dto.js'; // Corrected Import Path

export class HearingController {
  private service = new HearingService();

  getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const caseId = parseInt(req.params.caseId);
      if (isNaN(caseId)) return next(new AppError('Invalid Case ID', 400));

      const hearings = await this.service.getHearings(caseId, req.user!);
      res.json(hearings);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const caseId = parseInt(req.params.caseId);
      if (isNaN(caseId)) return next(new AppError('Invalid Case ID', 400));
      
      // Middleware handles validation
      const hearingData = req.body as CreateHearingDto;

      const hearing = await this.service.addHearing(caseId, hearingData, req.user!);
      res.status(201).json(hearing);
    } catch (err) {
      next(err);
    }
  };
  
  update = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const hearingData = req.body as CreateHearingDto;
      
      const updated = await this.service.updateHearing(id, hearingData, req.user!);
      res.json(updated);
    } catch (err) { next(err); }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      await this.service.deleteHearing(id, req.user!);
      res.json({ message: 'Hearing deleted' });
    } catch (err) { next(err); }
  };
}