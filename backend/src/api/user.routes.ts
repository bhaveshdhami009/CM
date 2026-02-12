import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { hasPermission } from '../middleware/rbac.middleware.js';
import { ROLES } from '../config/roles.js';
import { validateDto } from '../middleware/validation.middleware.js'; // <--- New
import { CreateTeamMemberDto, UpdateProfileDto } from '../dto/user.dto.js'; // <--- New DTOs

const router = Router();
const controller = new UserController();

router.use(authenticateToken);

// 1. Profile Route (Accessible to ANY logged-in user)
router.patch('/profile', 
  validateDto(UpdateProfileDto, true), // Partial update allowed
  controller.updateProfile
);

// 2. Admin Routes (Restricted to Org Admin/Editor)

// List Team
router.get('/', hasPermission(ROLES.EDITOR), controller.list);

// Create Member
router.post('/', 
  hasPermission(ROLES.ORG_ADMIN), 
  validateDto(CreateTeamMemberDto), 
  controller.create
);

// Remove Member
router.delete('/:id', hasPermission(ROLES.ORG_ADMIN), controller.delete);

// Update Member
router.patch('/:id', 
  hasPermission(ROLES.ORG_ADMIN), 
  validateDto(CreateTeamMemberDto, true), // Partial update allowed
  controller.update
);

export default router;