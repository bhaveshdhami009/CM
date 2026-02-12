import { AppDataSource } from '../data-source.js';
import { User } from '../entities/User.js';
import { UserSession } from '../entities/UserSession.js';
import { LoginAttempt } from '../entities/LoginAttempt.js';
import { Organization } from '../entities/Organization.js';
import { ILike } from 'typeorm';
// --- USER REPO ---
export class UserRepository {
    constructor() {
        this.repo = AppDataSource.getRepository(User);
    }
    async findByEmail(email) {
        return this.repo.findOne({ where: { email } });
    }
    // Explicitly selecting fields to avoid sending password_hash to frontend
    async findById(id) {
        return this.repo.findOne({
            where: { id },
            select: ['id', 'email', 'full_name', 'role', 'organization_id', 'accent', 'is_dark_mode']
        });
    }
    async save(user) {
        return this.repo.save(user);
    }
    // Admin Search
    async findByOrganization(orgId, filters) {
        const where = { organization_id: orgId };
        if (filters) {
            if (filters.name)
                where.full_name = ILike(`%${filters.name}%`);
            if (filters.email)
                where.email = ILike(`%${filters.email}%`);
            if (filters.role)
                where.role = filters.role;
        }
        return this.repo.find({
            where: where,
            order: { full_name: 'ASC' },
            select: ['id', 'email', 'full_name', 'role'] // Optimization
        });
    }
    async delete(id) {
        return this.repo.delete(id);
    }
}
// --- SESSION REPO ---
export class SessionRepository {
    constructor() {
        this.repo = AppDataSource.getRepository(UserSession);
    }
    async findOne(options) {
        return this.repo.findOne(options);
    }
    async save(session) {
        return this.repo.save(session);
    }
    async delete(criteria) {
        return this.repo.delete(criteria);
    }
    async find(options) {
        return this.repo.find(options);
    }
}
// --- LOGIN ATTEMPT REPO ---
export class LoginAttemptRepository {
    constructor() {
        this.repo = AppDataSource.getRepository(LoginAttempt);
    }
    async incrementAttempt(email) {
        let attempt = await this.repo.findOneBy({ email });
        if (!attempt) {
            attempt = this.repo.create({ email, count: 1 });
        }
        else {
            attempt.count += 1;
            attempt.last_attempt_at = new Date();
        }
        return this.repo.save(attempt);
    }
    async reset(email) {
        return this.repo.delete({ email });
    }
    async findOneBy(criteria) {
        return this.repo.findOneBy(criteria);
    }
    async save(attempt) {
        return this.repo.save(attempt);
    }
}
// --- ORGANIZATION REPO ---
export class OrganizationRepository {
    constructor() {
        this.repo = AppDataSource.getRepository(Organization);
    }
    async findAll(filters) {
        // ... logic if needed, or use generic
        return this.repo.find();
    }
}
//# sourceMappingURL=user.repository.js.map