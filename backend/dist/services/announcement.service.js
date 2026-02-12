import { AnnouncementRepository } from '../repositories/announcement.repository.js';
import { Announcement, AnnouncementScope } from '../entities/Announcement.js';
import { ROLES } from '../config/roles.js';
import { AppError } from '../utils/AppError.js';
export class AnnouncementService {
    constructor() {
        this.repo = new AnnouncementRepository();
    }
    // For User Dashboard
    async getActiveAnnouncements(user) {
        const orgId = user.organization_id || 0;
        return this.repo.findForUser(orgId);
    }
    // For Admin Management Page
    async getManageableList(user) {
        return this.repo.findAllManaged(user.role, user.organization_id || undefined);
    }
    // UPDATED: Use DTO type
    async create(data, user) {
        const announcement = new Announcement();
        announcement.title = data.title;
        announcement.message = data.message;
        announcement.created_by_id = user.id;
        // DTO validates 'expires_at' is an ISO string, so we can parse safely
        if (data.expires_at) {
            announcement.expires_at = new Date(data.expires_at);
        }
        // Security & Scope Logic
        if (user.role === ROLES.PLATFORM_ADMIN) {
            // Platform Admins can trust the requested scope
            if (data.scope === AnnouncementScope.GLOBAL) {
                announcement.scope = AnnouncementScope.GLOBAL;
                announcement.organization_id = undefined;
            }
            else {
                announcement.scope = AnnouncementScope.ORG;
                // Use target_org_id if provided, otherwise fallback to admin's own org (rare case)
                announcement.organization_id = data.target_org_id || user.organization_id;
            }
        }
        else {
            // Org Admins are FORCED to their own org, regardless of what they sent
            announcement.scope = AnnouncementScope.ORG;
            announcement.organization_id = user.organization_id;
        }
        return this.repo.save(announcement);
    }
    async delete(id, user) {
        const item = await this.repo.findById(id);
        if (!item)
            throw new AppError('Announcement not found', 404);
        // Security Check: Only Platform Admin can delete Global items
        if (user.role !== ROLES.PLATFORM_ADMIN) {
            if (item.scope === AnnouncementScope.GLOBAL) {
                throw new AppError('Cannot delete Global announcements', 403);
            }
            // Strict Org Check
            if (item.organization_id !== user.organization_id) {
                throw new AppError('Access Denied', 403);
            }
        }
        return this.repo.delete(id);
    }
}
//# sourceMappingURL=announcement.service.js.map