import { Router } from 'express';
import { OrganizationController } from '../controllers/organization.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validateDto } from '../middleware/validation.middleware.js'; // <--- New
import { CreateOrgDto } from '../dto/org.dto.js'; // <--- New DTO
import { hasPermission } from '../middleware/rbac.middleware.js';
import { ROLES } from '../config/roles.js';
const router = Router();
const controller = new OrganizationController();
router.use(authenticateToken);
router.use(hasPermission(ROLES.PLATFORM_ADMIN)); // Locked to Super Admin
router.get('/', controller.list);
// POST: Strict validation
router.post('/', validateDto(CreateOrgDto), controller.create);
// PATCH: Partial validation (skipMissingProperties = true)
// This allows updating just the name or just the email without sending the full object
router.patch('/:id', validateDto(CreateOrgDto, true), controller.update);
router.delete('/:id', controller.delete);
export default router;
//# sourceMappingURL=organization.routes.js.map