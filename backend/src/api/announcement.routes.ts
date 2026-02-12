import { Router } from 'express';
import { AnnouncementController } from '../controllers/announcement.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { hasPermission } from '../middleware/rbac.middleware.js';
import { ROLES } from '../config/roles.js';
import { validateDto } from '../middleware/validation.middleware.js'; // <--- New
import { CreateAnnouncementDto } from '../dto/announcement.dto.js'; // <--- New DTO

const router = Router();
const controller = new AnnouncementController();

router.use(authenticateToken);

// GET /api/announcements/feed
router.get('/feed', controller.listActive);

// GET /api/announcements/manage
router.get('/manage', hasPermission(ROLES.ORG_ADMIN), controller.listManaged);

// POST /api/announcements
router.post('/', 
  hasPermission(ROLES.ORG_ADMIN), 
  validateDto(CreateAnnouncementDto), // <--- Replaced old validator
  controller.create
);

// DELETE /api/announcements/:id
router.delete('/:id', hasPermission(ROLES.ORG_ADMIN), controller.delete);

export default router;