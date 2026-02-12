import { AppDataSource } from '../data-source.js';
import { HearingRepository } from '../repositories/hearing.repository.js';
import { CaseRepository } from '../repositories/case.repository.js';
import { AppError } from '../utils/AppError.js';
import { Hearing } from '../entities/Hearing.js';
export class HearingService {
    constructor() {
        this.hearingRepo = new HearingRepository();
        this.caseRepo = new CaseRepository();
    }
    // --- OPTIMIZED CHAIN REBUILDER ---
    async rebuildHearingChain(caseId, manager) {
        // 1. Fetch all hearings sorted by date
        const hearings = await manager.find(Hearing, {
            where: { case_id: caseId },
            order: { hearing_date: 'ASC' },
            relations: { next_hearing: true } // Important: Load existing relation to compare
        });
        if (hearings.length === 0)
            return;
        const toSave = [];
        // 2. Loop and Stitch
        for (let i = 0; i < hearings.length; i++) {
            const current = hearings[i];
            const next = hearings[i + 1] || null; // Next item or null if end of chain
            // OPTIMIZATION: Only add to save list if the link is different
            const currentNextId = current.next_hearing ? current.next_hearing.id : null;
            const newNextId = next ? next.id : null;
            if (currentNextId !== newNextId) {
                current.next_hearing = next;
                toSave.push(current);
            }
        }
        // 3. Save only modified records
        if (toSave.length > 0) {
            await manager.save(toSave);
        }
    }
    // --- PUBLIC METHODS ---
    async addHearing(caseId, data, user) {
        const caseExists = await this.caseRepo.findById(caseId, user.organization_id);
        if (!caseExists)
            throw new AppError('Case not found', 404);
        const hearingDate = new Date(data.hearing_date);
        if (isNaN(hearingDate.getTime()))
            throw new AppError('Invalid Hearing Date', 400);
        return AppDataSource.manager.transaction(async (manager) => {
            // 1. Create the single hearing
            const hearing = new Hearing();
            hearing.case_id = caseId;
            hearing.hearing_date = hearingDate;
            hearing.purpose = data.purpose;
            hearing.court_room = data.court_room;
            hearing.judge_id = data.judge_id || undefined; // Handle optional
            hearing.remarks = data.remarks;
            hearing.outcome = data.outcome;
            const savedHearing = await manager.save(hearing);
            // 2. Auto-Stitch
            await this.rebuildHearingChain(caseId, manager);
            return savedHearing;
        });
    }
    async updateHearing(id, data, user) {
        // Check ownership via Repo
        const hearing = await this.hearingRepo.findById(id, user.organization_id);
        if (!hearing)
            throw new AppError('Hearing not found', 404);
        return AppDataSource.manager.transaction(async (manager) => {
            // 1. Update fields
            if (data.hearing_date)
                hearing.hearing_date = new Date(data.hearing_date);
            if (data.purpose)
                hearing.purpose = data.purpose;
            // Handle optionals: explicitly allow null/undefined updates if passed
            if (data.court_room !== undefined)
                hearing.court_room = data.court_room;
            if (data.judge_id !== undefined)
                hearing.judge_id = data.judge_id;
            if (data.outcome !== undefined)
                hearing.outcome = data.outcome;
            if (data.remarks !== undefined)
                hearing.remarks = data.remarks;
            await manager.save(hearing);
            // 2. Re-stitch (In case date changed, order might change)
            await this.rebuildHearingChain(hearing.case_id, manager);
            return hearing;
        });
    }
    async deleteHearing(id, user) {
        const hearing = await this.hearingRepo.findById(id, user.organization_id);
        if (!hearing)
            throw new AppError('Hearing not found', 404);
        return AppDataSource.manager.transaction(async (manager) => {
            const caseId = hearing.case_id;
            // 1. Delete the record
            // Note: We use manager.delete to bypass repository checks inside transaction
            await manager.delete(Hearing, id);
            // 2. Re-stitch the remaining records
            await this.rebuildHearingChain(caseId, manager);
        });
    }
    async getHearings(caseId, user) {
        // Security check: Case must belong to User's Org
        const caseExists = await this.caseRepo.findById(caseId, user.organization_id);
        if (!caseExists)
            throw new AppError('Case not found', 404);
        // Use Repo to fetch sorted list
        return this.hearingRepo.findByCaseId(caseId, user.organization_id);
    }
}
//# sourceMappingURL=hearing.service.js.map