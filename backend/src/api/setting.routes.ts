import { Router } from 'express';
import { SettingController } from '../controllers/setting.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { hasPermission } from '../middleware/rbac.middleware.js';
import { ROLES } from '../config/roles.js';
import { validateDto } from '../middleware/validation.middleware.js'; // <--- New
import { CreateSettingDto } from '../dto/setting.dto.js'; // <--- New DTO

const router = Router();
const controller = new SettingController();

router.use(authenticateToken);

// 1. Get Value (Used by Dropdowns) - Accessible to Viewers
router.get('/:key', controller.getByKey); 

// 2. List All Settings (For Admin Panel) - Admin Only
router.get('/', hasPermission(ROLES.PLATFORM_ADMIN), controller.getAll);

// Create New Setting
router.post('/', 
  hasPermission(ROLES.PLATFORM_ADMIN), 
  validateDto(CreateSettingDto), 
  controller.create
);

// Update/Version Setting (using key in URL)
router.post('/:key', 
  hasPermission(ROLES.PLATFORM_ADMIN), 
  validateDto(CreateSettingDto), 
  controller.update
);

export default router;