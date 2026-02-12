import { AppDataSource } from '../data-source.js';
import { LoginAttempt } from '../entities/LoginAttempt.js';
import { AppError } from '../utils/AppError.js';
// 1 Hour Reset Window
const FAILURE_RESET_WINDOW = 60 * 60 * 1000;
export class SecurityService {
    constructor() {
        this.repo = AppDataSource.getRepository(LoginAttempt);
    }
    async checkLockdown(email) {
        const attempt = await this.repo.findOne({ where: { email } });
        if (!attempt)
            return;
        if (attempt.lockout_until && new Date() < attempt.lockout_until) {
            const waitSeconds = Math.ceil((attempt.lockout_until.getTime() - new Date().getTime()) / 1000);
            let timeMsg = `${waitSeconds} seconds`;
            if (waitSeconds > 60)
                timeMsg = `${Math.ceil(waitSeconds / 60)} minutes`;
            if (waitSeconds > 3600)
                timeMsg = `${Math.ceil(waitSeconds / 3600)} hours`;
            throw new AppError(`Account locked. Try again in ${timeMsg}.`, 429);
        }
    }
    async recordFailure(email) {
        let attempt = await this.repo.findOne({ where: { email } });
        const now = new Date();
        if (attempt) {
            const timeSinceLastFail = now.getTime() - attempt.last_attempt_at.getTime();
            // SAFETY CHECK: Is the account currently locked?
            const isLocked = attempt.lockout_until && attempt.lockout_until > now;
            // Only reset if time has passed AND the account is NOT currently locked
            if (!isLocked && timeSinceLastFail > FAILURE_RESET_WINDOW) {
                attempt.count = 1;
                attempt.lockout_until = undefined;
            }
            else {
                // Increment if recent fail OR if locked (to extend/maintain lock logic if needed)
                attempt.count += 1;
            }
        }
        else {
            attempt = this.repo.create({ email, count: 1 });
        }
        // Update Lockout based on NEW count
        if (attempt.count >= 30) {
            attempt.lockout_until = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 Hours
        }
        else if (attempt.count >= 20) {
            attempt.lockout_until = new Date(now.getTime() + 30 * 60 * 1000); // 30 Mins
        }
        else if (attempt.count >= 10) {
            attempt.lockout_until = new Date(now.getTime() + 2 * 60 * 1000); // 2 Mins
        }
        attempt.last_attempt_at = now;
        await this.repo.save(attempt);
    }
    async resetAttempts(email) {
        await this.repo.delete({ email });
    }
}
//# sourceMappingURL=security.service.js.map