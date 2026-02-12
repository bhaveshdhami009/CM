import { PartyService } from '../services/party.service.js';
export class PartyController {
    constructor() {
        this.service = new PartyService();
        this.search = async (req, res, next) => {
            try {
                const query = req.query.q || '';
                // req.user is guaranteed by the auth middleware
                const results = await this.service.searchParties(query, req.user);
                res.json(results);
            }
            catch (error) {
                next(error);
            }
        };
        this.getAll = async (req, res, next) => {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 20;
                const search = req.query.search;
                // Extract Column Filters
                const filters = {
                    name: req.query.name,
                    parentage: req.query.parentage,
                    mobile: req.query.mobile,
                    city: req.query.city
                };
                const result = await this.service.getParties(req.user, page, limit, search, filters);
                res.json(result);
            }
            catch (err) {
                next(err);
            }
        };
        this.create = async (req, res, next) => {
            try {
                // Body validation is handled by validateDto middleware
                const partyData = req.body;
                const party = await this.service.createParty(partyData, req.user);
                res.status(201).json(party);
            }
            catch (err) {
                next(err);
            }
        };
        this.update = async (req, res, next) => {
            try {
                const id = parseInt(req.params.id);
                // Partial updates allow missing fields
                const partyData = req.body;
                const party = await this.service.updateParty(id, partyData, req.user);
                res.json(party);
            }
            catch (err) {
                next(err);
            }
        };
        this.delete = async (req, res, next) => {
            try {
                const id = parseInt(req.params.id);
                await this.service.deleteParty(id, req.user);
                res.json({ message: 'Party deleted' });
            }
            catch (err) {
                next(err);
            }
        };
    }
}
//# sourceMappingURL=party.controller.js.map