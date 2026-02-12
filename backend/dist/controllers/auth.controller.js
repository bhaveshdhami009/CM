import { AuthService } from '../services/auth.service.js';
import { AppError } from '../utils/AppError.js';
//import useragent from 'express-useragent';
//import * as useragent from 'express-useragent'; 
export class AuthController {
    constructor() {
        this.authService = new AuthService();
        /*
          public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            try {
              // Data is already validated by middleware
              const data = req.body as RegisterDto;
              
              const user = await this.authService.register(data);
              
              // Don't send password hash back! Service usually handles this or use class-transformer
              // But for safety, we can sanitize response here manually if needed,
              // though User entity shouldn't be returning sensitive data if configured right.
              res.status(201).json({
                id: user.id,
                email: user.email,
                full_name: user.full_name
              });
            } catch (error: any) {
              next(error);
            }
          };
        */
        this.login = async (req, res, next) => {
            try {
                const data = req.body; // Includes email, password
                const { rememberMe } = req.body; // Extract extra flags not in DTO if passed, or add to DTO
                const ip = String(req.ip || req.socket.remoteAddress);
                // Parse User Agent
                const uaSource = req.headers['user-agent'] || '';
                const ua = req.useragent;
                const deviceName = `${ua.browser} on ${ua.os} (${ua.platform})`;
                // Pass the DTO object to the service
                const tokens = await this.authService.login(data, ip, deviceName, !!rememberMe);
                res.json(tokens);
            }
            catch (error) {
                next(error);
            }
        };
        this.refresh = async (req, res, next) => {
            try {
                const { refreshToken } = req.body;
                if (!refreshToken)
                    return next(new AppError('Refresh Token required', 400));
                const tokens = await this.authService.refresh(refreshToken);
                res.json(tokens);
            }
            catch (err) {
                next(err);
            }
        };
        this.logout = async (req, res, next) => {
            try {
                const { refreshToken } = req.body;
                if (refreshToken) {
                    await this.authService.logout(refreshToken);
                }
                res.json({ message: 'Logged out' });
            }
            catch (err) {
                next(err);
            }
        };
        this.changePassword = async (req, res, next) => {
            try {
                // You can create a ChangePasswordDto if you want strict validation here too
                const { oldPassword, newPassword, logoutOthers } = req.body;
                await this.authService.changePassword(req.user.id, oldPassword, newPassword, logoutOthers);
                res.json({ message: 'Password updated successfully' });
            }
            catch (err) {
                next(err);
            }
        };
        this.getSessions = async (req, res, next) => {
            try {
                const sessions = await this.authService.getActiveSessions(req.user.id);
                res.json(sessions);
            }
            catch (err) {
                next(err);
            }
        };
        this.revokeSession = async (req, res, next) => {
            try {
                const { sessionId } = req.params;
                await this.authService.revokeSession(sessionId, req.user.id);
                res.json({ message: 'Session revoked' });
            }
            catch (err) {
                next(err);
            }
        };
    }
}
//# sourceMappingURL=auth.controller.js.map