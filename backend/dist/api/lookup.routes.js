import { Router } from 'express';
import { LookupController } from '../controllers/lookup.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validateDto } from '../middleware/validation.middleware.js'; // <--- New
import { CreateDistrictDto, CreateCourtDto, CreateJudgeDto, CreateEstablishmentDto } from '../dto/lookup.dto.js'; // <--- New DTOs
import { hasPermission } from '../middleware/rbac.middleware.js';
import { ROLES } from '../config/roles.js';
const router = Router();
const lookupController = new LookupController();
// 🔒 Global Security
router.use(authenticateToken);
// --- PUBLIC READ (Viewers) ---
router.get('/case-types', lookupController.getCaseTypes);
router.get('/districts', lookupController.getDistricts);
router.get('/districts/:districtId/courts', lookupController.getCourtsByDistrict);
router.get('/courts', lookupController.getAllCourts);
router.get('/establishments', lookupController.getAllEstablishments);
router.get('/judges', lookupController.getJudges);
router.get('/districts/:districtId/establishments', lookupController.getEstablishmentsByDistrict);
// --- ADMIN WRITE (Platform Admin Only) ---
// Districts
router.post('/districts', hasPermission(ROLES.PLATFORM_ADMIN), validateDto(CreateDistrictDto), lookupController.saveDistrict);
router.put('/districts/:id', hasPermission(ROLES.PLATFORM_ADMIN), validateDto(CreateDistrictDto), lookupController.saveDistrict);
router.delete('/districts/:id', hasPermission(ROLES.PLATFORM_ADMIN), lookupController.deleteDistrict);
// Courts
router.post('/courts', hasPermission(ROLES.PLATFORM_ADMIN), validateDto(CreateCourtDto), lookupController.saveCourt);
router.put('/courts/:id', hasPermission(ROLES.PLATFORM_ADMIN), validateDto(CreateCourtDto), lookupController.saveCourt);
router.delete('/courts/:id', hasPermission(ROLES.PLATFORM_ADMIN), lookupController.deleteCourt);
// Judges (Create allow Editor, Save/Delete Admin)
router.post('/judges', hasPermission(ROLES.EDITOR), validateDto(CreateJudgeDto), lookupController.saveJudge); // Consolidated createJudge logic to saveJudge if payloads match, or map accordingly
router.put('/judges/:id', hasPermission(ROLES.PLATFORM_ADMIN), validateDto(CreateJudgeDto), lookupController.saveJudge);
router.delete('/judges/:id', hasPermission(ROLES.PLATFORM_ADMIN), lookupController.deleteJudge);
// Establishments
router.post('/establishments', hasPermission(ROLES.PLATFORM_ADMIN), validateDto(CreateEstablishmentDto), lookupController.saveEstablishment);
router.put('/establishments/:id', hasPermission(ROLES.PLATFORM_ADMIN), validateDto(CreateEstablishmentDto), lookupController.saveEstablishment);
router.delete('/establishments/:id', hasPermission(ROLES.PLATFORM_ADMIN), lookupController.deleteEstablishment);
export default router;
//# sourceMappingURL=lookup.routes.js.map