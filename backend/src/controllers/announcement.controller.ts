import { Response, NextFunction } from 'express';
import { AnnouncementService } from '../services/announcement.service.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { CreateAnnouncementDto } from '../dto/announcement.dto.js'; // Corrected Path

export class AnnouncementController {
  private service = new AnnouncementService();

  // 1. Get Feed
  listActive = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const list = await this.service.getActiveAnnouncements(req.user!);
      res.json(list);
    } catch (err) { next(err); }
  };

  // 2. Get Managed List
  listManaged = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const list = await this.service.getManageableList(req.user!);
      res.json(list);
    } catch (err) { next(err); }
  };

  // 3. Create
  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Data is already validated by middleware
      const data = req.body as CreateAnnouncementDto;
      const result = await this.service.create(data, req.user!);
      res.status(201).json(result);
    } catch (err) { next(err); }
  };

  // 4. Delete
  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      await this.service.delete(id, req.user!);
      res.json({ message: 'Announcement deleted' });
    } catch (err) { next(err); }
  };
}