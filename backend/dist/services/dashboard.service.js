import { AppDataSource } from '../data-source.js';
import { Case } from '../entities/Case.js';
import { Hearing } from '../entities/Hearing.js';
import { CaseLog } from '../entities/CaseLog.js';
import { Between, MoreThanOrEqual } from 'typeorm';
import { AnnouncementRepository } from '../repositories/announcement.repository.js';
import { AppError } from '../utils/AppError.js';
export class DashboardService {
    constructor() {
        this.announcementRepo = new AnnouncementRepository();
        this.caseRepo = AppDataSource.getRepository(Case);
        this.hearingRepo = AppDataSource.getRepository(Hearing);
        this.logRepo = AppDataSource.getRepository(CaseLog);
    }
    // 1. STATS (Unchanged)
    async getStats(orgId, startStr, endStr) {
        const start = new Date(startStr);
        const end = new Date(endStr);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new AppError('Invalid date range provided', 400);
        }
        end.setHours(23, 59, 59, 999);
        const [tasksCompleted, hearingsCount, casesFiled, totalPendingTasks] = await Promise.all([
            this.logRepo.count({ where: { case: { organization_id: orgId }, is_pending: false, completed_at: Between(start, end) } }),
            this.hearingRepo.count({ where: { case: { organization_id: orgId }, hearing_date: Between(start, end) } }),
            this.caseRepo.count({ where: { organization_id: orgId, created_at: Between(start, end) } }),
            this.logRepo.count({ where: { case: { organization_id: orgId }, is_pending: true } })
        ]);
        return { tasksCompleted, hearingsCount, casesFiled, totalPendingTasks };
    }
    // 2. WIDGETS (Updated)
    async getWidgets(user) {
        const orgId = user.organization_id;
        const now = new Date();
        // FIX #1: Include IDs in selection so TypeORM maps relations correctly
        const caseSelectWithParties = {
            id: true,
            case_no: true,
            file_no: true,
            parties: {
                case_id: true, // FK
                party_id: true, // FK
                role: true,
                party: {
                    id: true, // PK
                    first_name: true,
                    last_name: true
                }
            }
        };
        // A. Upcoming Hearings
        const upcomingHearings = await this.hearingRepo.find({
            where: {
                case: { organization_id: orgId },
                hearing_date: MoreThanOrEqual(now)
            },
            relations: {
                case: { court: true, parties: { party: true } }
            },
            select: {
                id: true,
                hearing_date: true,
                purpose: true,
                court_room: true,
                case: {
                    ...caseSelectWithParties,
                    court: { id: true, name: true }
                }
            },
            order: { hearing_date: 'ASC' },
            take: 5
        });
        // B. Pending Tasks
        const pendingTasks = await this.logRepo.find({
            where: {
                case: { organization_id: orgId },
                is_pending: true
            },
            relations: { case: { parties: { party: true } } },
            select: {
                id: true,
                log_date: true,
                purpose: true,
                remarks: true,
                case: caseSelectWithParties
            },
            order: { log_date: 'ASC' },
            take: 5
        });
        // C. Recent Activity
        const recentActivity = await this.logRepo.find({
            where: {
                case: { organization_id: orgId },
            },
            relations: {
                case: { parties: { party: true } },
                creator: true
            },
            select: {
                id: true,
                updated_at: true,
                log_date: true,
                purpose: true,
                is_pending: true,
                case: caseSelectWithParties,
                creator: {
                    id: true,
                    full_name: true
                }
            },
            order: { updated_at: 'DESC' },
            take: 5
        });
        // D. Announcements
        const announcements = await this.announcementRepo.findForUser(orgId);
        // E. NEW: Recently Added Cases
        const recentCases = await this.caseRepo.find({
            where: { organization_id: orgId },
            relations: { parties: { party: true }, court: true },
            select: {
                ...caseSelectWithParties,
                created_at: true,
                court: { id: true, name: true }
            },
            order: { created_at: 'DESC' },
            take: 5
        });
        return {
            upcomingHearings,
            pendingTasks,
            recentActivity,
            announcements: announcements.slice(0, 3),
            recentCases // <--- Return new widget data
        };
    }
}
//# sourceMappingURL=dashboard.service.js.map