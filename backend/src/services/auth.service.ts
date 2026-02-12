import { AppDataSource } from '../data-source.js';
import { User } from '../entities/User.js';
import { UserSession } from '../entities/UserSession.js';
import { AuthLog } from '../entities/AuthLog.js';
import { SecurityService } from './security.service.js';
import { UserRepository } from '../repositories/user.repository.js'; // Use Custom Repo
import { AppError } from '../utils/AppError.js';
import { LessThan } from 'typeorm';
import { LoginDto } from '../dto/validation.dto.js'; // Import DTOs
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export class AuthService {
  // Use Custom Repository for User logic
  private userRepo = new UserRepository(); 
  
  // Keep standard TypeORM repos for simple entities if no custom logic exists yet
  private sessionRepo = AppDataSource.getRepository(UserSession);
  private authLogRepo = AppDataSource.getRepository(AuthLog);
  private securityService = new SecurityService();

  // 1. Generate Tokens Helper
  private generateTokens(user: User, sessionId: string) {
    const accessToken = jwt.sign(
      { 
        user: { 
          id: user.id, 
          email: user.email, 
          full_name: user.full_name, 
          role: user.role, 
          orgId: user.organization_id,
          accent: user.accent,
          is_dark_mode: user.is_dark_mode
        },
        sessionId // Link Access Token to the Session
      }, 
      process.env.JWT_SECRET || 'default_secret', 
      { expiresIn: '15m' } 
    );

    const refreshToken = crypto.randomBytes(40).toString('hex');
    return { accessToken, refreshToken };
  }

  // 2. Optimized Login
  async login(data: LoginDto, ip: string, userAgent: string, rememberMe: boolean) {
    const { email, password } = data;

    // A. Security Checks
    await this.securityService.checkLockdown(email);
    
    // Cleanup old sessions (Housekeeping)
    // Fire and forget (don't await) to speed up login response? 
    // Safer to await to ensure DB health, but it's a quick delete.
    await this.sessionRepo.delete({ expires_at: LessThan(new Date()) });

    // B. Find User
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      await this.securityService.recordFailure(email);
      throw new AppError('Invalid credentials.', 401);
    }

    // C. Check Password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      await this.securityService.recordFailure(email);
      throw new AppError('Invalid credentials.', 401);
    }

    // Reset Lockout
    await this.securityService.resetAttempts(email);

    // D. Create Session (OPTIMIZED)
    // 1. Generate UUID manually so we can sign the token immediately
    const sessionId = crypto.randomUUID(); 
    const { accessToken, refreshToken } = this.generateTokens(user, sessionId);

    const session = new UserSession();
    session.id = sessionId; // Assign the ID manually
    session.user_id = user.id;
    session.ip_address = ip;
    session.device_name = userAgent;
    
    const days = rememberMe ? 30 : 1;
    session.expires_at = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    session.last_active = new Date();
    
    // Hash token before saving
    session.refresh_token_hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    
    // 2. Single DB Write
    await this.sessionRepo.save(session);

    // Log History (Async, don't block response)
    this.authLogRepo.save({ user_id: user.id, ip_address: ip, user_agent: userAgent });

    return { accessToken, refreshToken };
  }

  // 3. Refresh Token
  async refresh(refreshToken: string) {
    const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const session = await this.sessionRepo.findOne({ 
      where: { refresh_token_hash: hash },
      relations: { user: true }
    });

    if (!session || session.expires_at < new Date()) {
      throw new AppError('Invalid or expired session', 401);
    }

    // Rotate Tokens
    const newTokens = this.generateTokens(session.user, session.id);
    
    session.refresh_token_hash = crypto.createHash('sha256').update(newTokens.refreshToken).digest('hex');
    session.last_active = new Date();
    await this.sessionRepo.save(session);

    return newTokens;
  }

  // 4. Logout
  async logout(refreshToken: string) {
    const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await this.sessionRepo.delete({ refresh_token_hash: hash });
  }

  // 5. Change Password
  async changePassword(userId: number, oldPass: string, newPass: string, revokeAllSessions: boolean) {
    // Use findById from Repo (if available) or standard findOne
    const user = await this.userRepo.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const isMatch = await bcrypt.compare(oldPass, user.password_hash);
    if (!isMatch) throw new AppError('Current password is incorrect', 400);

    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(newPass, salt);
    await this.userRepo.save(user);

    if (revokeAllSessions) {
      await this.sessionRepo.delete({ user_id: userId });
    }
  }

  async getActiveSessions(userId: number) {
    return this.sessionRepo.find({ 
      where: { user_id: userId },
      order: { last_active: 'DESC' }
    });
  }

  async revokeSession(sessionId: string, userId: number) {
    return this.sessionRepo.delete({ id: sessionId, user_id: userId });
  }
  
  /*
  // 6. Register (Updated with DTO)
  async register(data: RegisterDto): Promise<User> {
    const { email, password, full_name } = data;

    // Check if exists
    const existing = await this.userRepo.findByEmail(email);
    if (existing) throw new AppError('Email already exists', 400);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User();
    newUser.email = email;
    newUser.password_hash = hashedPassword;
    newUser.full_name = full_name;
    // Default org ID if applicable, or handle via invite logic
    // newUser.organization_id = ... 

    return this.userRepo.save(newUser);
  }
  */
}
