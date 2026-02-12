var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { EventSubscriber } from 'typeorm';
import { AuditLog } from '../entities/AuditLog.js';
import { getCurrentUser } from '../utils/context.js'; // Import our context helper
let AuditSubscriber = class AuditSubscriber {
    // 1. Filter: Which tables to ignore?
    // We don't want to log changes to the logs themselves.
    afterLoad() { }
    // 2. Handle Inserts (Create)
    async afterInsert(event) {
        if (this.shouldIgnore(event.metadata.tableName))
            return;
        const user = getCurrentUser();
        if (!user)
            return; // System event or not logged in
        const log = new AuditLog();
        log.table_name = event.metadata.tableName;
        log.record_id = event.entity.id; // Assumes entity has 'id'
        log.action = 'CREATE';
        log.performed_by_id = user.id;
        log.new_values = event.entity; // The whole object is new
        await event.manager.save(log);
    }
    // 3. Handle Updates (Edit)
    async afterUpdate(event) {
        if (this.shouldIgnore(event.metadata.tableName))
            return;
        const user = getCurrentUser();
        if (!user)
            return;
        // Calculate Diff
        const oldValues = {};
        const newValues = {};
        let hasChanges = false;
        // TypeORM provides updatedColumns. Let's compare databaseEntity (old) vs entity (new)
        event.updatedColumns.forEach(col => {
            const prop = col.propertyName;
            const oldValue = event.databaseEntity[prop];
            const newValue = event.entity ? event.entity[prop] : undefined;
            // Only log if values are different (and not undefined)
            if (newValue !== undefined && oldValue !== newValue) {
                // Skip 'updated_at' usually, but keep if you want strict logs
                if (prop !== 'updated_at') {
                    oldValues[prop] = oldValue;
                    newValues[prop] = newValue;
                    hasChanges = true;
                }
            }
        });
        if (hasChanges) {
            const log = new AuditLog();
            log.table_name = event.metadata.tableName;
            log.record_id = event.databaseEntity.id;
            log.action = 'UPDATE';
            log.performed_by_id = user.id;
            log.old_values = oldValues;
            log.new_values = newValues;
            await event.manager.save(log);
        }
    }
    // 4. Handle Deletes
    async beforeRemove(event) {
        // We use beforeRemove to capture the ID before it's gone, 
        // though afterRemove is usually safer for confirmation.
        // For Audit, knowing *what* was deleted is key.
        if (this.shouldIgnore(event.metadata.tableName))
            return;
        const user = getCurrentUser();
        if (!user)
            return;
        const log = new AuditLog();
        log.table_name = event.metadata.tableName;
        log.record_id = event.entityId;
        log.action = 'DELETE';
        log.performed_by_id = user.id;
        log.old_values = event.entity; // Log what was deleted
        // Use a separate transaction or manager to ensure log saves even if record deletes
        // But usually saving inside the same transaction is correct.
        await event.manager.save(AuditLog, log);
    }
    shouldIgnore(tableName) {
        // Add 'user_sessions' and 'login_attempts' to this list
        return [
            'audit_logs',
            'auth_logs',
            'user_sessions',
            'login_attempts'
        ].includes(tableName);
    }
};
AuditSubscriber = __decorate([
    EventSubscriber()
], AuditSubscriber);
export { AuditSubscriber };
//# sourceMappingURL=AuditSubscriber.js.map