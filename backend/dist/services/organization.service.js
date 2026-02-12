import { AppDataSource } from '../data-source.js';
import { OrganizationRepository } from '../repositories/organization.repository.js';
import { UserRepository } from '../repositories/user.repository.js';
import { Organization } from '../entities/Organization.js';
import { User } from '../entities/User.js';
import { AppError } from '../utils/AppError.js';
import { ROLES } from '../config/roles.js';
import bcrypt from 'bcrypt';
export class OrganizationService {
    constructor() {
        this.orgRepo = new OrganizationRepository();
        this.userRepo = new UserRepository();
    }
    async getAll(filters) {
        return this.orgRepo.findAll(filters);
    }
    async onboardOrganization(data) {
        // 1. Pre-checks (Read-only, no transaction needed yet)
        const existingOrg = await this.orgRepo.findByName(data.name);
        if (existingOrg)
            throw new AppError('Organization Name already exists', 409);
        const existingUser = await this.userRepo.findByEmail(data.admin_email);
        if (existingUser)
            throw new AppError('Admin Email already exists', 409);
        // 2. Transaction (Atomic Create)
        return AppDataSource.manager.transaction(async (manager) => {
            // A. Create Organization
            const org = new Organization();
            org.name = data.name;
            org.address = data.address;
            org.contact_email = data.contact_email;
            org.phone = data.phone;
            const savedOrg = await manager.save(org);
            // B. Create Admin User
            const user = new User();
            user.email = data.admin_email;
            user.full_name = data.admin_name;
            user.organization_id = savedOrg.id;
            user.role = ROLES.ORG_ADMIN; // Role 8 (or 3, depending on config)
            // Hash Password
            // If no password provided, generate a random secure one or default (policy dependent)
            const rawPass = data.admin_password || 'Admin@123';
            user.password_hash = await bcrypt.hash(rawPass, 10);
            await manager.save(user);
            return savedOrg;
        });
    }
    async updateOrganization(id, data) {
        // Use Repository method, do not access .repo directly
        // (Ensure OrganizationRepository has findById, or add it)
        const org = await this.orgRepo.findById(id);
        if (!org)
            throw new AppError('Organization not found', 404);
        // Update allowed fields
        if (data.name)
            org.name = data.name;
        if (data.address)
            org.address = data.address;
        if (data.contact_email)
            org.contact_email = data.contact_email;
        if (data.phone)
            org.phone = data.phone;
        return this.orgRepo.save(org);
    }
    async deleteOrganization(id) {
        // Check existence first
        const org = await this.orgRepo.findById(id);
        if (!org)
            throw new AppError('Organization not found', 404);
        // Hard Delete (Cascades to Users/Cases usually defined in DB schema)
        // If you need Soft Delete, add @DeleteDateColumn to Organization entity
        return this.orgRepo.delete(id);
    }
}
//# sourceMappingURL=organization.service.js.map