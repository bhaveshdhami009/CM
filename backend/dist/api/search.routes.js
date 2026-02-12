import { Router } from 'express';
import { SearchController } from '../controllers/search.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validateDto } from '../middleware/validation.middleware.js'; // <--- New
import { AdvancedSearchDto } from '../dto/search.dto.js'; // <--- New DTO
import { hasPermission } from '../middleware/rbac.middleware.js';
import { ROLES } from '../config/roles.js';
const router = Router();
const controller = new SearchController();
router.use(authenticateToken);
// Allow Viewers to search
router.post('/', hasPermission(ROLES.VIEWER), validateDto(AdvancedSearchDto), controller.search);
export default router;
//# sourceMappingURL=search.routes.js.map