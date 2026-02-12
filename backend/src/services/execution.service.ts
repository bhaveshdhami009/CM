import { ExecutionRepository } from '../repositories/execution.repository.js';
import { CaseRepository } from '../repositories/case.repository.js';
import { LogService } from './log.service.js'; 
import { Execution } from '../entities/Execution.js';
import { User } from '../entities/User.js';
import { AppError } from '../utils/AppError.js';
import { StartExecutionDto, UpdateExecutionDto } from '../dto/execution.dto.js'; // Import DTO

export class ExecutionService {
  private execRepo = new ExecutionRepository();
  private caseRepo = new CaseRepository();
  private logService = new LogService();

  // 1. Start Execution Cycle
  async startExecution(caseId: number, data: StartExecutionDto, user: User) {
    // A. Security: Ensure Case Exists & Belongs to User's Org
    // (We must check this because if no execution exists yet, execRepo won't catch the org mismatch)
    const caseData = await this.caseRepo.findById(caseId, user.organization_id!);
    if (!caseData) throw new AppError('Case not found', 404);

    // B. Check for Existing Execution Record
    let exec = await this.execRepo.findByCaseId(caseId, user.organization_id!);

    // If active, prevent duplicate start
    if (exec && exec.is_active) {
      throw new AppError('Execution is already active for this case', 400);
    }

    // Initialize if new
    if (!exec) {
      exec = new Execution();
      exec.case_id = caseId;
    }

    // C. Update Fields
    exec.is_active = true;
    exec.amount = data.amount;
    
    // Ensure date is stored consistently (YYYY-MM-DD part of ISO string)
    // DTO validates input is an ISO string.
    exec.start_date = data.start_date;
    exec.next_due_date = data.next_due_date; 
    exec.remarks = data.remarks;

    // D. Log the Event
    await this.logService.addLog(caseId, {
      log_date: new Date().toISOString(),
      purpose: 'Execution Started',
      remarks: `Amount: ${exec.amount}. Started execution cycle.`
    }, user);

    return this.execRepo.save(exec);
  }

  // 2. Mark Cycle Complete
  async markCycleComplete(caseId: number, user: User, remarks?: string) {
    const exec = await this.execRepo.findByCaseId(caseId, user.organization_id!);
    if (!exec || !exec.is_active) throw new AppError('No active execution found', 404);

    // A. Log Payment
    await this.logService.addLog(caseId, {
      log_date: new Date().toISOString(),
      purpose: 'Execution Payment',
      remarks: `Cycle Completed. ${remarks || ''}`
    }, user);

    // B. Calculate Next Date (+1 Year)
    // Ensure we parse the string from DB into a Date object safely
    const currentDate = new Date(exec.next_due_date); 
    if (isNaN(currentDate.getTime())) {
        // Fallback if DB data is somehow invalid
        throw new AppError('Invalid existing due date', 500);
    }

    currentDate.setFullYear(currentDate.getFullYear() + 1);
    
    // Store back as ISO string (or YYYY-MM-DD depending on DB column type)
    exec.next_due_date = currentDate.toISOString();
    
    return this.execRepo.save(exec);
  }

  // 3. Stop Execution
  async stopExecution(caseId: number, user: User) {
    const exec = await this.execRepo.findByCaseId(caseId, user.organization_id!);
    
    if (!exec || !exec.is_active) throw new AppError('Execution is not active', 400);

    // Soft Stop (Flag only)
    exec.is_active = false;
    await this.execRepo.save(exec);

    await this.logService.addLog(caseId, {
      log_date: new Date().toISOString(),
      purpose: 'Execution Stopped',
      remarks: 'Execution cycle terminated by user.'
    }, user);
    
    return { success: true };
  }
  
  async updateExecution(caseId: number, data: UpdateExecutionDto, user: User) {
    const exec = await this.execRepo.findByCaseId(caseId, user.organization_id!);
    if (!exec) throw new AppError('Execution record not found', 404);

    if (data.amount !== undefined) exec.amount = data.amount;
    if (data.remarks !== undefined) exec.remarks = data.remarks;
    if (data.start_date) exec.start_date = data.start_date;
    if (data.next_due_date) exec.next_due_date = data.next_due_date;

    return this.execRepo.save(exec);
  }

  // NEW: Hard Delete
  async deleteExecution(caseId: number, user: User) {
    const exec = await this.execRepo.findByCaseId(caseId, user.organization_id!);
    if (!exec) throw new AppError('Execution record not found', 404);

    // Hard delete the record
    await this.execRepo.delete(caseId);

    // Log the deletion
    await this.logService.addLog(caseId, {
        log_date: new Date().toISOString(),
        purpose: 'Execution Deleted',
        remarks: 'Execution record removed permanently.'
    }, user);
  }
}