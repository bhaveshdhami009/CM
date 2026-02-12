import { CaseService } from '../services/case.service.js';
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
    constructor() {
        this.caseService = new CaseService();
        this.create = async (req, res, next) => {
            try {
                // Validation handled by middleware
                const caseData = req.body;
                const newCase = await this.caseService.createCase(caseData, req.user);
                res.status(201).json(newCase);
            }
            catch (error) {
                next(error);
            }
        };
        this.getAll = async (req, res, next) => {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 20;
                const search = req.query.search;
                // Extract specific column filters from query
                const filters = {
                    file_no: req.query.file_no,
                    case_type: req.query.case_type,
                    court_name: req.query.court_name,
                    title: req.query.title // for parties
                };
                const result = await this.caseService.getAllCases(req.user, page, limit, search, filters);
                // Post-process data for UI status
                const processedData = result.data.map(c => processCaseData(c));
                res.json({ ...result, data: processedData });
            }
            catch (error) {
                next(error);
            }
        };
        this.getOne = async (req, res, next) => {
            try {
                const id = parseInt(req.params.id);
                if (isNaN(id))
                    return next(new AppError('Invalid Case ID', 400));
                const caseDetails = await this.caseService.getCaseById(id, req.user);
                if (!caseDetails) {
                    return next(new AppError('Case not found', 404));
                }
                // Inject dynamic data into the single result
                const response = processCaseData(caseDetails);
                res.json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.update = async (req, res, next) => {
            try {
                const id = parseInt(req.params.id);
                const caseData = req.body;
                const updated = await this.caseService.updateCase(id, caseData, req.user);
                res.json(updated);
            }
            catch (err) {
                next(err);
            }
        };
        this.delete = async (req, res, next) => {
            try {
                const id = parseInt(req.params.id);
                await this.caseService.deleteCase(id, req.user);
                res.json({ message: 'Case moved to trash' });
            }
            catch (err) {
                next(err);
            }
        };
    }
}
//# sourceMappingURL=case.controller.js.map