import { Router } from 'express';
import { LogController } from '../controllers/log.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { hasPermission } from '../middleware/rbac.middleware.js';
import { ROLES } from '../config/roles.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
// Configure Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/logs/';
        if (!fs.existsSync(uploadPath))
            fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });
const router = Router({ mergeParams: true });
const controller = new LogController();
router.use(authenticateToken);
router.get('/', hasPermission(ROLES.VIEWER), controller.getAll);
router.post('/', hasPermission(ROLES.EDITOR), upload.single('file'), 
// No validateDto here: Controller handles FormData type conversion manually
controller.create);
router.get('/:logId/file', hasPermission(ROLES.VIEWER), controller.downloadFile);
router.patch('/:id', hasPermission(ROLES.EDITOR), upload.single('file'), 
// No validateDto here: Controller handles FormData type conversion manually
controller.update);
router.patch('/:id/toggle', hasPermission(ROLES.EDITOR), controller.togglePending);
router.delete('/:id', hasPermission(ROLES.EDITOR), controller.delete);
export default router;
//# sourceMappingURL=log.routes.js.map