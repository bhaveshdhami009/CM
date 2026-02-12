import { DataSource } from 'typeorm';
import { District } from '../../entities/District.js';
import { Establishment } from '../../entities/Establishment.js';

export const seedEstablishments = async (dataSource: DataSource) => {
  const districtRepo = dataSource.getRepository(District);
  const estRepo = dataSource.getRepository(Establishment);

  // Define data: Key is District Name, Value is Array of Establishment Names
  const data: any = {
    'North West': ['District and Sessions Judge, North-West, RHC', 'Chief Metropolitan Magistrate, North-West, RHC', 'Senior Civil Judge cum RC, North-West, RHC', 'Principal Judge Family Court, North West, RHC'],
  };

  for (const [districtName, estList] of Object.entries(data)) {
    const district = await districtRepo.findOne({ where: { name: districtName } });
    if (district) {
      for (const name of (estList as string[])) {
        const exists = await estRepo.findOne({ 
          where: { name, district_id: district.id } 
        });
        
        if (!exists) {
          await estRepo.save({ name, district });
        }
      }
    }
  }
  console.log('✅ Establishments seeded');
};