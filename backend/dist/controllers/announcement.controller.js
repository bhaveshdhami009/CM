import { AnnouncementService } from '../services/announcement.service.js';
export class AnnouncementController {
    constructor() {
        this.service = new AnnouncementService();
        // 1. Get Feed
        this.listActive = async (req, res, next) => {
            try {
                const list = await this.service.getActiveAnnouncements(req.user);
                res.json(list);
            }
            catch (err) {
                next(err);
            }
        };
        // 2. Get Managed List
        this.listManaged = async (req, res, next) => {
            try {
                const list = await this.service.getManageableList(req.user);
                res.json(list);
            }
            catch (err) {
                next(err);
            }
        };
        // 3. Create
        this.create = async (req, res, next) => {
            try {
                // Data is already validated by middleware
                const data = req.body;
                const result = await this.service.create(data, req.user);
                res.status(201).json(result);
            }
            catch (err) {
                next(err);
            }
        };
        // 4. Delete
        this.delete = async (req, res, next) => {
            try {
                const id = parseInt(req.params.id);
                await this.service.delete(id, req.user);
                res.json({ message: 'Announcement deleted' });
            }
            catch (err) {
                next(err);
            }
        };
    }
}
//# sourceMappingURL=announcement.controller.js.map