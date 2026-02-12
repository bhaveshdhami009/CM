import { DataSource } from 'typeorm';
import { Setting } from '../../entities/Setting.js';

export const seedSettings = async (dataSource: DataSource) => {
  const repo = dataSource.getRepository(Setting);

  const initialSettings = [
    {
      key: 'log_purposes',
      description: 'Dropdown options for Case Logs/Hearings',
      value: [
        'Admission', 'Arguments', 'Evidence', 'Order/Judgment', 
        'Drafting', 'Filing', 'Client Meeting', 'File Inspection', 'Misc'
      ]
    },
    //{
    // key: 'case_statuses',
    //  description: 'Status options for a Case',
    //  value: ['To be Filed', 'Pending', 'Disposed', 'Sine Die', 'Decreed']
    //},
    {
      key: 'case_types',
      description: 'List of available Case Types',
      value: ['Private', 'DLSA', 'Execution', 'File Inspection']
    },
    //{
    //  key: 'establishments',
    //  description: 'List of Court Establishments',
    //  value: ['District and Sessions Judge, North-West, RHC', 'Chief Metropolitan Magistrate, North-West, RHC', 'Senior Civil Judge cum RC, North-West, RHC', 'Principal Judge Family Court, North West, RHC']
    //},
  ];

  for (const item of initialSettings) {
    const exists = await repo.findOne({ where: { key: item.key } });
    if (!exists) {
      await repo.save(item);
    } else {
      // Optional: Update existing keys with new defaults if needed
      // exists.value = item.value;
      // await repo.save(exists);
    }
  }
  console.log('✅ Settings seeded');
};