import { UserService } from '../services/user.service.js';
export class UserController {
    constructor() {
        this.service = new UserService();
        this.list = async (req, res, next) => {
            try {
                const filters = {
                    name: req.query.name,
                    email: req.query.email,
                    role: req.query.role ? parseInt(req.query.role) : undefined
                };
                const users = await this.service.getTeamMembers(req.user, filters);
                res.json(users);
            }
            catch (err) {
                next(err);
            }
        };
        this.create = async (req, res, next) => {
            try {
                // Body is guaranteed valid by middleware
                const data = req.body;
                const user = await this.service.addTeamMember(data, req.user);
                res.status(201).json(user);
            }
            catch (err) {
                next(err);
            }
        };
        this.update = async (req, res, next) => {
            try {
                const userId = parseInt(req.params.id);
                const data = req.body;
                const updatedUser = await this.service.updateTeamMember(req.user, userId, data);
                res.json(updatedUser);
            }
            catch (err) {
                next(err);
            }
        };
        this.delete = async (req, res, next) => {
            try {
                const userId = parseInt(req.params.id);
                await this.service.removeTeamMember(userId, req.user);
                res.json({ message: 'User removed successfully' });
            }
            catch (err) {
                next(err);
            }
        };
        this.updateProfile = async (req, res, next) => {
            try {
                // Body is guaranteed valid by middleware
                const data = req.body;
                const updatedUser = await this.service.updateProfile(req.user.id, data);
                res.json(updatedUser);
            }
            catch (err) {
                next(err);
            }
        };
    }
}
//# sourceMappingURL=user.controller.js.map