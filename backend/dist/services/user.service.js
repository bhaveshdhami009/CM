import { UserRepository } from '../repositories/user.repository.js';
import { User } from '../entities/User.js';
import { AppError } from '../utils/AppError.js';
import bcrypt from 'bcrypt';
export class UserService {
    constructor() {
        this.userRepo = new UserRepository();
    }
    async getTeamMembers(currentUser, filters) {
        return this.userRepo.findByOrganization(currentUser.organization_id, filters);
    }
    // 1. UPDATED: Use DTO
    async addTeamMember(data, adminUser) {
        // Check if email exists
        const existing = await this.userRepo.findByEmail(data.email);
        if (existing)
            throw new AppError('User with this email already exists', 409);
        // Hash Password
        const password = data.password || 'LegalApp@123';
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        // Create User
        const newUser = new User();
        newUser.email = data.email;
        newUser.full_name = data.fullName; // Map DTO (camel) to Entity (snake)
        newUser.password_hash = hash;
        newUser.role = data.role;
        newUser.organization_id = adminUser.organization_id;
        newUser.created_by = adminUser.id;
        const savedUser = await this.userRepo.save(newUser);
        // Remove password from response
        const { password_hash, ...safeUser } = savedUser;
        return safeUser;
    }
    async removeTeamMember(userId, adminUser) {
        if (userId === adminUser.id)
            throw new AppError('Cannot delete yourself', 400);
        // Use findById (Repository Encapsulation)
        const targetUser = await this.userRepo.findById(userId);
        // Strict Org Check
        if (!targetUser || targetUser.organization_id !== adminUser.organization_id) {
            throw new AppError('User not found in your organization', 404);
        }
        return this.userRepo.delete(userId);
    }
    // 2. UPDATED: Use UpdateProfileDto & Repository Encapsulation
    async updateProfile(userId, data) {
        const user = await this.userRepo.findById(userId);
        if (!user)
            throw new AppError('User not found', 404);
        // Apply strict updates
        if (data.accent)
            user.accent = data.accent;
        if (data.is_dark_mode !== undefined)
            user.is_dark_mode = data.is_dark_mode;
        // Note: If you want to allow name changes here, ensure DTO allows it.
        // user.full_name = data.fullName; 
        // Use Repo.save() instead of accessing .repo.update() directly
        await this.userRepo.save(user);
        // Return sanitized profile (using the specific repo method if available, or manual sanitize)
        // Assuming UserRepository has a findById that returns the object
        const { password_hash, ...safeUser } = user;
        return safeUser;
    }
    // 3. UPDATED: Use Partial DTO & Repository Encapsulation
    async updateTeamMember(adminUser, targetUserId, data) {
        // Use findById
        const targetUser = await this.userRepo.findById(targetUserId);
        // Strict Org Check
        if (!targetUser || targetUser.organization_id !== adminUser.organization_id) {
            throw new AppError('User not found in your organization', 404);
        }
        // Map Fields
        if (data.fullName)
            targetUser.full_name = data.fullName;
        if (data.email)
            targetUser.email = data.email;
        if (data.role)
            targetUser.role = data.role;
        // Password Reset
        if (data.password && data.password.trim().length > 0) {
            const salt = await bcrypt.genSalt(10);
            targetUser.password_hash = await bcrypt.hash(data.password, salt);
        }
        const savedUser = await this.userRepo.save(targetUser);
        const { password_hash, ...safeUser } = savedUser;
        return safeUser;
    }
}
//# sourceMappingURL=user.service.js.map