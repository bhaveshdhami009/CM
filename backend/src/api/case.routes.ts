import { Router } from 'express';
import { CaseController } from '../controllers/case.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validateDto } from '../middleware/validation.middleware.js'; // <--- New
import { CreateCaseDto } from '../dto/case.dto.js'; // <--- New DTO
import { hasPermission } from '../middleware/rbac.middleware.js';
import { ROLES } from '../config/roles.js';
import logRouter from './log.routes.js';
import executionRouter from './execution.routes.js';
import hearingRouter from './hearing.routes.js';

const router = Router();
const caseController = new CaseController();

// --- Case Routes ---

router.get('/', 
  authenticateToken, 
  hasPermission(ROLES.VIEWER), 
  caseController.getAll
);

router.post('/', 
  authenticateToken, 
  hasPermission(ROLES.EDITOR), 
  validateDto(CreateCaseDto), // <--- Use DTO Validation
  caseController.create
);

router.get('/:id', 
  authenticateToken, 
  hasPermission(ROLES.VIEWER), 
  caseController.getOne
);

// --- Sub-Routers ---
// Note: Ensure sub-routers have { mergeParams: true }
router.use('/:caseId/logs', logRouter);
router.use('/:caseId/execution', executionRouter);
router.use('/:caseId/hearings', hearingRouter); 

// --- Edit / Delete Routes ---

router.put('/:id', 
  authenticateToken, 
  hasPermission(ROLES.EDITOR), 
  validateDto(CreateCaseDto), // <--- Use DTO Validation
  caseController.update
);

router.delete('/:id', 
  authenticateToken, 
  hasPermission(ROLES.ORG_ADMIN), 
  caseController.delete
);

export default router;