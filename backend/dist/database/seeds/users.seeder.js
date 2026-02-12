import { User } from '../../entities/User.js';
import { Organization } from '../../entities/Organization.js'; // <-- Import
import { ROLES } from '../../config/roles.js';
import bcrypt from 'bcrypt';
export const seedUsers = async (dataSource) => {
    const userRepo = dataSource.getRepository(User);
    const orgRepo = dataSource.getRepository(Organization);
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('123', salt);
    // 1. Create a Test Organization First
    let org = await orgRepo.findOne({ where: { name: 'Legal Eagles LLP' } });
    if (!org) {
        org = await orgRepo.save({
            name: 'Legal Eagles LLP',
            address: '123 Supreme Court Road, New Delhi',
            contact_email: 'contact@legaleagles.com'
        });
        console.log('✅ Organization "Legal Eagles LLP" created');
    }
    // 2. Create Users linked to that Org
    const users = [
        {
            email: 'dev@legalapp.com',
            full_name: 'System Developer',
            password_hash: hash,
            role: ROLES.PLATFORM_ADMIN,
            organization: undefined // Dev has no org
        },
        {
            email: 'admin@lawfirm.com',
            full_name: 'Senior Partner',
            password_hash: hash,
            role: ROLES.ORG_ADMIN,
            organization: org // Link to the org object
        },
        {
            email: 'lawyer@lawfirm.com',
            full_name: 'A C',
            password_hash: hash,
            role: ROLES.EDITOR,
            organization: org // Link to the org object
        }
    ];
    for (const userData of users) {
        const exists = await userRepo.findOne({ where: { email: userData.email } });
        if (!exists) {
            await userRepo.save(userData);
        }
    }
    console.log('✅ Users seeded');
};
//# sourceMappingURL=users.seeder.js.map