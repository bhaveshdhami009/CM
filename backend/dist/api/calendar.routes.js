import { Router } from 'express';
import { LogController } from '../controllers/log.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { hasPermission } from '../middleware/rbac.middleware.js';
import { ROLES } from '../config/roles.js';
const router = Router();
const controller = new LogController();
router.use(authenticateToken);
// GET /api/calendar?start=...&end=...
router.get('/', hasPermission(ROLES.VIEWER), controller.getCalendar);
export default router;
//# sourceMappingURL=calendar.routes.js.map