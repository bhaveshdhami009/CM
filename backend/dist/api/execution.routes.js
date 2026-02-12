import { Router } from 'express';
import { ExecutionController } from '../controllers/execution.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validateDto } from '../middleware/validation.middleware.js';
import { StartExecutionDto, UpdateExecutionDto, MarkCycleCompleteDto } from '../dto/execution.dto.js';
import { hasPermission } from '../middleware/rbac.middleware.js';
import { ROLES } from '../config/roles.js';
const router = Router({ mergeParams: true });
const controller = new ExecutionController();
router.use(authenticateToken);
// Start: POST /api/cases/:caseId/execution/start
router.post('/start', hasPermission(ROLES.EDITOR), validateDto(StartExecutionDto), controller.start);
// Update: PATCH /api/cases/:caseId/execution
router.patch('/', hasPermission(ROLES.EDITOR), validateDto(UpdateExecutionDto), controller.update);
// Hard Delete: DELETE /api/cases/:caseId/execution
router.delete('/', hasPermission(ROLES.ORG_ADMIN), controller.delete);
// Complete Cycle: POST /api/cases/:caseId/execution/complete
router.post('/complete', hasPermission(ROLES.EDITOR), validateDto(MarkCycleCompleteDto), controller.completeCycle);
// Stop (Make Inactive): PATCH /api/cases/:caseId/execution/stop
// Changed from DELETE / to PATCH /stop to differentiate from Hard Delete
router.patch('/stop', hasPermission(ROLES.EDITOR), controller.stop);
export default router;
//# sourceMappingURL=execution.routes.js.map