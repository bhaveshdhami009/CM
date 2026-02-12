import { AppDataSource } from '../data-source.js';
import { Announcement, AnnouncementScope } from '../entities/Announcement.js';
import { Brackets } from 'typeorm';
export class AnnouncementRepository {
    constructor() {
        this.repo = AppDataSource.getRepository(Announcement);
    }
    // Fetch for a specific user (Global + Their Org)
    async findForUser(orgId) {
        const now = new Date();
        return this.repo.createQueryBuilder('a')
            .leftJoinAndSelect('a.creator', 'creator')
            .where('a.is_active = :isActive', { isActive: true })
            // Check Expiry (if set)
            .andWhere(new Brackets(qb => {
            qb.where('a.expires_at IS NULL')
                .orWhere('a.expires_at >= :now', { now });
        }))
            // Check Scope
            .andWhere(new Brackets(qb => {
            qb.where('a.scope = :global', { global: AnnouncementScope.GLOBAL })
                .orWhere('a.organization_id = :orgId', { orgId });
        }))
            .orderBy('a.created_at', 'DESC')
            .getMany();
    }
    // Fetch ALL for Management (Admin view)
    async findAllManaged(userRole, orgId) {
        const qb = this.repo.createQueryBuilder('a')
            .leftJoinAndSelect('a.creator', 'creator')
            .orderBy('a.created_at', 'DESC');
        // If not Platform Admin, only show own org's announcements
        if (userRole !== 9) { // 9 = Platform Admin
            qb.where('a.organization_id = :orgId', { orgId });
        }
        return qb.getMany();
    }
    async save(data) {
        return this.repo.save(data);
    }
    async delete(id) {
        return this.repo.delete(id);
    }
    async findById(id) { return this.repo.findOneBy({ id }); }
}
//# sourceMappingURL=announcement.repository.js.map