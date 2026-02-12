import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
const router = Router();
const controller = new DashboardController();
router.use(authenticateToken);
router.get('/stats', controller.getStats);
router.get('/widgets', controller.getWidgets);
export default router;
//# sourceMappingURL=dashboard.routes.js.map