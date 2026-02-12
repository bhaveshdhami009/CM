import { Router } from 'express';
import { HearingController } from '../controllers/hearing.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validateDto } from '../middleware/validation.middleware.js'; // <--- New
import { CreateHearingDto } from '../dto/hearing.dto.js'; // <--- New DTO
import { hasPermission } from '../middleware/rbac.middleware.js';
import { ROLES } from '../config/roles.js';
const router = Router({ mergeParams: true });
const controller = new HearingController();
router.use(authenticateToken);
// GET /api/cases/:caseId/hearings
router.get('/', hasPermission(ROLES.VIEWER), controller.getAll);
// POST /api/cases/:caseId/hearings
router.post('/', hasPermission(ROLES.EDITOR), validateDto(CreateHearingDto), // <--- DTO Validation
controller.create);
// PUT /api/cases/:caseId/hearings/:id
router.put('/:id', hasPermission(ROLES.EDITOR), validateDto(CreateHearingDto), // <--- DTO Validation
controller.update);
// DELETE /api/cases/:caseId/hearings/:id
router.delete('/:id', hasPermission(ROLES.EDITOR), controller.delete);
export default router;
//# sourceMappingURL=hearing.routes.js.map