import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { ExecutionService } from '../services/execution.service.js';
import { StartExecutionDto, UpdateExecutionDto, MarkCycleCompleteDto } from '../dto/execution.dto.js'; // Import DTOs

export class ExecutionController {
  private service = new ExecutionService();

  start = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const caseId = parseInt(req.params.caseId);
      // Validated body from middleware
      const data = req.body as StartExecutionDto;
      
      const result = await this.service.startExecution(caseId, data, req.user!);
      res.json(result);
    } catch (err) { next(err); }
  };
  
  // NEW: Update
  update = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const caseId = parseInt(req.params.caseId);
      const data = req.body as UpdateExecutionDto;
      const result = await this.service.updateExecution(caseId, data, req.user!);
      res.json(result);
    } catch (err) { next(err); }
  };

  // NEW: Hard Delete
  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const caseId = parseInt(req.params.caseId);
      await this.service.deleteExecution(caseId, req.user!);
      res.json({ message: 'Execution record deleted' });
    } catch (err) { next(err); }
  };


  completeCycle = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const caseId = parseInt(req.params.caseId);
      // Optional remarks
      const { remarks } = req.body as MarkCycleCompleteDto;
      
      const result = await this.service.markCycleComplete(caseId, req.user!, remarks);
      res.json(result);
    } catch (err) { next(err); }
  };

  stop = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const caseId = parseInt(req.params.caseId);
      await this.service.stopExecution(caseId, req.user!);
      res.json({ message: 'Execution stopped' });
    } catch (err) { next(err); }
  };
}