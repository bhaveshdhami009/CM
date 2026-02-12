import { District } from '../../entities/District.js';
import { Court } from '../../entities/Court.js';
export const seedLocations = async (dataSource) => {
    const districtRepo = dataSource.getRepository(District);
    const courtRepo = dataSource.getRepository(Court);
    // Define data structure
    const data = [
        {
            district: 'Central',
            state: 'Delhi',
            courts: ['Tis Hazari Court']
        },
        {
            district: 'East',
            state: 'Delhi',
            courts: ['Karkardooma Court']
        },
        {
            district: 'New Delhi',
            state: 'Delhi',
            courts: ['District Court Saket', 'High Court of Delhi', 'Patiala House Court']
        },
        {
            district: 'North',
            state: 'Delhi',
            courts: ['Rohini Court']
        },
        {
            district: 'North East',
            state: 'Delhi',
            courts: ['Karkardooma Court']
        },
        {
            district: 'North West',
            state: 'Delhi',
            courts: ['Rohini Court']
        },
        {
            district: 'Shahdara',
            state: 'Delhi',
            courts: ['Karkardooma Court']
        },
        {
            district: 'South',
            state: 'Delhi',
            courts: ['Saket Court']
        },
        {
            district: 'South East',
            state: 'Delhi',
            courts: ['Saket Court']
        },
        {
            district: 'South West',
            state: 'Delhi',
            courts: ['Dwarka Court']
        },
        {
            district: 'West',
            state: 'Delhi',
            courts: ['Tis Hazari Court']
        }
    ];
    for (const item of data) {
        // 1. Create District
        let district = await districtRepo.findOne({ where: { name: item.district } });
        if (!district) {
            district = await districtRepo.save({ name: item.district, state: item.state });
        }
        // 2. Create Courts linked to this District
        for (const courtName of item.courts) {
            const courtExists = await courtRepo.findOne({
                where: { name: courtName, district_id: district.id }
            });
            if (!courtExists) {
                await courtRepo.save({
                    name: courtName,
                    district: district // TypeORM handles the foreign key assignment
                });
            }
        }
    }
    console.log('✅ Locations (Districts & Courts) seeded');
};
//# sourceMappingURL=locations.seeder.js.map