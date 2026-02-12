import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { PartyController } from '../controllers/party.controller.js';
import { validateDto } from '../middleware/validation.middleware.js'; // <--- New
import { CreatePartyDto } from '../dto/party.dto.js'; // <--- New DTO
import { hasPermission } from '../middleware/rbac.middleware.js';
import { ROLES } from '../config/roles.js';
const router = Router();
const controller = new PartyController();
router.use(authenticateToken);
router.get('/search', hasPermission(ROLES.VIEWER), controller.search);
// Management Routes
router.get('/', hasPermission(ROLES.ORG_ADMIN), controller.getAll);
router.post('/', hasPermission(ROLES.EDITOR), validateDto(CreatePartyDto), controller.create);
// Allow partial updates (skipMissingProperties = true)
router.put('/:id', hasPermission(ROLES.ORG_ADMIN), validateDto(CreatePartyDto, true), controller.update);
router.delete('/:id', hasPermission(ROLES.ORG_ADMIN), controller.delete);
export default router;
//# sourceMappingURL=party.routes.js.map