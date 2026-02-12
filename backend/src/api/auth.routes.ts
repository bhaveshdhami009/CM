import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authLimiter } from '../middleware/rate-limit.middleware.js'; 
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validateDto } from '../middleware/validation.middleware.js'; // <--- New
import { LoginDto } from '../dto/validation.dto.js'; // <--- New DTOs

const router = Router();
const authController = new AuthController();

// POST /api/auth/register (Added for completeness based on your controller)
// Register is unnecessary.
// router.post('/register', authLimiter, validateDto(RegisterDto), authController.register);

// POST /api/auth/login
router.post('/login', authLimiter, validateDto(LoginDto), authController.login);

// Public, but requires valid refresh token
router.post('/refresh', authController.refresh); 
router.post('/logout', authController.logout);

// Protected Management Routes
router.post('/change-password', authenticateToken, authController.changePassword);
router.get('/sessions', authenticateToken, authController.getSessions);
router.delete('/sessions/:sessionId', authenticateToken, authController.revokeSession);

export default router;