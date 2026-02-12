import { Response, NextFunction } from 'express';
import { CaseService } from '../services/case.service.js';
import { CreateCaseDto } from '../dto/case.dto.js'; // Updated import path
import { AuthRequest } from '../middleware/auth.middleware.js';
import { AppError } from '../utils/AppError.js';
import { processCaseData } from '../utils/case.utils.js';

/*
// Helper to determine status and derived fields dynamically
const processCaseData = (c: any) => {
  const now = new Date();
  
  // --- 1. Analyze Hearings ---
  let nextHearingDate: Date | null = null;
  let stage = 'New Case';

  if (c.hearings && c.hearings.length > 0) {
    // Sort: Oldest to Newest
    const sortedHearings = c.hearings.sort((a: any, b: any) => 
      new Date(a.hearing_date).getTime() - new Date(b.hearing_date).getTime()
    );
    
    // Find first future hearing
    const next = sortedHearings.find((h: any) => new Date(h.hearing_date) > now);
    
    if (next) {
      nextHearingDate = next.hearing_date;
      stage = next.purpose;
    } else {
      // If no future hearing, stage is the purpose of the LAST hearing
      const last = sortedHearings[sortedHearings.length - 1];
      stage = last.purpose;
    }
  }

  // --- 2. Analyze Logs ---
  const pendingLogs = c.logs?.filter((l: any) => l.is_pending);
  
  // Completed logs (Sorted Newest First)
  const completedLogs = c.logs?.filter((l: any) => !l.is_pending)
    .sort((a: any, b: any) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime());

  // --- 3. Determine Display Status (Priority Order) ---
  let statusDisplay = stage;
  
  if (pendingLogs && pendingLogs.length > 0) {
    statusDisplay = `Pending: ${pendingLogs[0].purpose}`;
  } 
  else if (nextHearingDate) {
    statusDisplay = `Next: ${new Date(nextHearingDate).toLocaleDateString()}`;
  } 
  else if (completedLogs && completedLogs.length > 0) {
    statusDisplay = `Done: ${completedLogs[0].purpose}`;
  }

  return {
    ...c,
    next_hearing_date: nextHearingDate, 
    stage: stage,
    status: statusDisplay
  };
};

*/

export class CaseController {
  private caseService = new CaseService();

  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Validation handled by middleware
      const caseData = req.body as CreateCaseDto;
      
      const newCase = await this.caseService.createCase(caseData, req.user!);
      
      res.status(201).json(newCase);
    } catch (error: any) {
      next(error); 
    }
  };

  getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string | undefined;

      // Extract specific column filters from query
      const filters = {
        file_no: req.query.file_no as string,
        case_type: req.query.case_type as string,
        court_name: req.query.court_name as string,
        title: req.query.title as string // for parties
      };

      const result = await this.caseService.getAllCases(req.user!, page, limit, search, filters);
      
      // Post-process data for UI status
      const processedData = result.data.map(c => processCaseData(c));

      res.json({ ...result, data: processedData });
    } catch (error) {
      next(error);
    }
  };

  getOne = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return next(new AppError('Invalid Case ID', 400));

      const caseDetails = await this.caseService.getCaseById(id, req.user!);

      if (!caseDetails) {
        return next(new AppError('Case not found', 404));
      }

      // Inject dynamic data into the single result
      const response = processCaseData(caseDetails);

      res.json(response);
    } catch (error) {
      next(error);
    }
  };
  
  update = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const caseData = req.body as CreateCaseDto; 
      
      const updated = await this.caseService.updateCase(id, caseData, req.user!);
      res.json(updated);
    } catch (err) { next(err); }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      await this.caseService.deleteCase(id, req.user!);
      res.json({ message: 'Case moved to trash' });
    } catch (err) { next(err); }
  };
}