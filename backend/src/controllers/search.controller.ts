import { Response, NextFunction } from 'express';
import { SearchService } from '../services/search.service.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { AdvancedSearchDto } from '../dto/search.dto.js'; // Import DTO
import { processCaseData } from '../utils/case.utils.js'; // Import Shared Utility

export class SearchController {
  private service = new SearchService();

  search = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // 1. Strict Type Casting
      const searchData = req.body as AdvancedSearchDto;

      // 2. Call Service
      const result = await this.service.search(searchData, req.user!);
      
      // 3. Post-Process if Cases
      if (searchData.entityType === 'cases') {
        result.data = result.data.map((c: any) => processCaseData(c));
      }

      res.json(result);
    } catch (err) { next(err); }
  };
}