import { SearchService } from '../services/search.service.js';
import { processCaseData } from '../utils/case.utils.js'; // Import Shared Utility
export class SearchController {
    constructor() {
        this.service = new SearchService();
        this.search = async (req, res, next) => {
            try {
                // 1. Strict Type Casting
                const searchData = req.body;
                // 2. Call Service
                const result = await this.service.search(searchData, req.user);
                // 3. Post-Process if Cases
                if (searchData.entityType === 'cases') {
                    result.data = result.data.map((c) => processCaseData(c));
                }
                res.json(result);
            }
            catch (err) {
                next(err);
            }
        };
    }
}
//# sourceMappingURL=search.controller.js.map