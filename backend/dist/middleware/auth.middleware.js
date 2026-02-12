import jwt from 'jsonwebtoken';
import { AppDataSource } from '../data-source.js';
import { User } from '../entities/User.js';
import { UserSession } from '../entities/UserSession.js'; // <--- Import this
import { AppError } from '../utils/AppError.js';
import { requestContext } from '../utils/context.js';
export const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return next(new AppError('Authentication required. Please log in.', 401));
    }
    try {
        const secret = process.env.JWT_SECRET || 'default_secret';
        // 1. Verify Signature
        const payload = jwt.verify(token, secret);
        // 2. IMMEDIATE REVOCATION CHECK
        // We check if the session ID inside the token still exists in the DB.
        const sessionRepo = AppDataSource.getRepository(UserSession);
        const activeSession = await sessionRepo.findOne({ where: { id: payload.sessionId } });
        if (!activeSession) {
            // Session was revoked or logged out
            return next(new AppError('Session expired or revoked. Please log in again.', 401));
        }
        // 3. User Existence Check
        const userRepo = AppDataSource.getRepository(User);
        const user = await userRepo.findOne({ where: { id: payload.user.id } });
        if (!user) {
            return next(new AppError('The user belonging to this token no longer exists.', 401));
        }
        // 4. Org Check
        if (user.role !== 9 && !user.organization_id) { // 9 is PLATFORM_ADMIN
            return next(new AppError('Access Denied: You are not linked to an Organization.', 403));
        }
        req.user = user;
        requestContext.run({ user }, () => {
            next();
        });
    }
    catch (err) {
        next(err);
    }
};
//# sourceMappingURL=auth.middleware.js.map