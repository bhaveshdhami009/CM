import { LogRepository } from '../repositories/log.repository.js';
import { CaseRepository } from '../repositories/case.repository.js';
import { HearingRepository } from '../repositories/hearing.repository.js';
import { ExecutionRepository } from '../repositories/execution.repository.js';
import { AppError } from '../utils/AppError.js';
import path from 'path';
import fs from 'fs';
export class LogService {
    constructor() {
        this.logRepo = new LogRepository();
        this.caseRepo = new CaseRepository();
        this.hearingRepo = new HearingRepository();
        this.execRepo = new ExecutionRepository();
    }
    async getLogs(caseId, user) {
        const caseExists = await this.caseRepo.findById(caseId, user.organization_id);
        if (!caseExists)
            throw new AppError('Case not found', 404);
        return this.logRepo.findByCaseId(caseId, user.organization_id);
    }
    async addLog(caseId, data, user) {
        const caseExists = await this.caseRepo.findById(caseId, user.organization_id);
        if (!caseExists)
            throw new AppError('Case not found', 404);
        // Create Partial<CaseLog> to satisfy TypeORM
        const logData = {
            case_id: caseId,
            created_by_id: user.id,
            log_date: new Date(data.log_date),
            purpose: data.purpose,
            remarks: data.remarks,
            // Default to true if undefined, otherwise convert boolean
            is_pending: data.is_pending !== undefined ? data.is_pending : true,
            file_path: data.file_path,
            file_extension: data.file_extension
        };
        return this.logRepo.create(logData);
    }
    async updateLog(id, data, user) {
        // 1. Fetch Log ensuring it belongs to user's Org
        const log = await this.logRepo.findById(id, user.organization_id);
        if (!log)
            throw new AppError('Log not found', 404);
        // 2. Handle File Replacement
        if (data.file_path && log.file_path) {
            this.deleteFileFromDisk(log.file_path);
        }
        // 3. Update fields
        if (data.log_date)
            log.log_date = new Date(data.log_date);
        if (data.purpose)
            log.purpose = data.purpose;
        if (data.remarks !== undefined)
            log.remarks = data.remarks;
        if (data.is_pending !== undefined)
            log.is_pending = Boolean(data.is_pending);
        // Update file info if a new one was uploaded
        if (data.file_path) {
            log.file_path = data.file_path;
            log.file_extension = data.file_extension;
        }
        return this.logRepo.save(log);
    }
    async deleteLog(id, user) {
        // 1. Verify ownership
        const log = await this.logRepo.findById(id, user.organization_id);
        if (!log)
            throw new AppError('Log not found', 404);
        // 2. Delete file from disk if it exists
        if (log.file_path) {
            this.deleteFileFromDisk(log.file_path);
        }
        // 3. Delete record from DB
        // FIX: Call public method on Repo, do NOT access .repo directly
        return this.logRepo.delete(id);
    }
    // --- Helper to safely delete files ---
    deleteFileFromDisk(relativePath) {
        try {
            const absolutePath = path.resolve(relativePath);
            // Security: Prevent Directory Traversal
            if (!absolutePath.includes('uploads'))
                return;
            if (fs.existsSync(absolutePath)) {
                fs.unlinkSync(absolutePath);
            }
        }
        catch (error) {
            console.error(`Failed to delete file at ${relativePath}:`, error);
        }
    }
    async getLogFile(caseId, logId, user) {
        const caseExists = await this.caseRepo.findById(caseId, user.organization_id);
        if (!caseExists)
            throw new AppError('Case not found or access denied', 404);
        const log = await this.logRepo.findById(logId, user.organization_id);
        if (!log || log.case_id !== caseId)
            throw new AppError('Log not found', 404);
        if (!log.file_path)
            throw new AppError('No file attached', 404);
        const absolutePath = path.resolve(log.file_path);
        if (!absolutePath.includes('uploads'))
            throw new AppError('Invalid file path', 400);
        if (!fs.existsSync(absolutePath))
            throw new AppError('File missing on server', 404);
        return {
            path: absolutePath,
            filename: `Document-${log.id}.${log.file_extension || 'pdf'}`
        };
    }
    async getCalendarEvents(user, start, end) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()))
            throw new AppError('Invalid date', 400);
        endDate.setHours(23, 59, 59, 999);
        const logs = await this.logRepo.findBetweenDates(user.organization_id, startDate, endDate);
        const hearings = await this.hearingRepo.findBetweenDates(user.organization_id, startDate, endDate);
        const executions = await this.execRepo.findByDueDate(user.organization_id, startDate, endDate);
        const cases = await this.caseRepo.findForCalendar(user.organization_id, startDate, endDate);
        const combinedEvents = [];
        // 2. Map Logs
        logs.forEach(l => combinedEvents.push({
            id: l.id,
            type: 'log',
            event_date: l.log_date,
            title: l.purpose,
            remarks: l.remarks,
            case: l.case,
            is_pending: l.is_pending
        }));
        // 3. Map Hearings
        hearings.forEach(h => combinedEvents.push({
            id: h.id,
            type: 'hearing',
            event_date: h.hearing_date,
            title: h.purpose,
            remarks: h.remarks,
            outcome: h.outcome,
            case: h.case,
            court_room: h.court_room
        }));
        // 4. Map Executions
        executions.forEach(e => combinedEvents.push({
            id: e.case_id,
            type: 'execution',
            event_date: e.next_due_date,
            title: 'Execution Due',
            remarks: `Amount: ${e.amount}`,
            case: e.case
        }));
        // 5. Map Cases
        cases.forEach(c => {
            if (c.filing_date) {
                const fDate = new Date(c.filing_date);
                if (fDate >= startDate && fDate <= endDate) {
                    combinedEvents.push({
                        id: c.id,
                        type: 'case_filed',
                        event_date: c.filing_date,
                        title: 'Case Filed',
                        remarks: c.file_no ? `File No: ${c.file_no}` : '',
                        case: c
                    });
                }
            }
            if (c.received_date) {
                const rDate = new Date(c.received_date);
                if (rDate >= startDate && rDate <= endDate) {
                    combinedEvents.push({
                        id: c.id,
                        type: 'case_received',
                        event_date: c.received_date,
                        title: 'Case Received',
                        remarks: c.case_no ? `Case No: ${c.case_no}` : '',
                        case: c
                    });
                }
            }
        });
        return combinedEvents.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
    }
    async togglePendingStatus(logId, user) {
        const log = await this.logRepo.findById(logId, user.organization_id);
        if (!log)
            throw new AppError('Log not found', 404);
        if (log.is_pending) {
            log.is_pending = false;
            log.completed_by_id = user.id;
            log.completed_at = new Date();
        }
        else {
            log.is_pending = true;
            log.completed_by_id = undefined;
            log.completed_at = undefined;
        }
        return this.logRepo.save(log);
    }
}
//# sourceMappingURL=log.service.js.map