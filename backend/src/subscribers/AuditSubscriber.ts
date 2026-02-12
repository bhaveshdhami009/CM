import { 
  EventSubscriber, 
  EntitySubscriberInterface, 
  InsertEvent, 
  UpdateEvent, 
  RemoveEvent 
} from 'typeorm';
import { AuditLog } from '../entities/AuditLog.js';
import { getCurrentUser } from '../utils/context.js'; // Import our context helper
import { AuthLog } from '../entities/AuthLog.js'; // Don't audit the audit logs!

@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface {
  
  // 1. Filter: Which tables to ignore?
  // We don't want to log changes to the logs themselves.
  afterLoad() {} 

  // 2. Handle Inserts (Create)
  async afterInsert(event: InsertEvent<any>) {
    if (this.shouldIgnore(event.metadata.tableName)) return;

    const user = getCurrentUser();
    if (!user) return; // System event or not logged in

    const log = new AuditLog();
    log.table_name = event.metadata.tableName;
    log.record_id = event.entity.id; // Assumes entity has 'id'
    log.action = 'CREATE';
    log.performed_by_id = user.id;
    log.new_values = event.entity; // The whole object is new

    await event.manager.save(log);
  }

  // 3. Handle Updates (Edit)
  async afterUpdate(event: UpdateEvent<any>) {
    if (this.shouldIgnore(event.metadata.tableName)) return;

    const user = getCurrentUser();
    if (!user) return;

    // Calculate Diff
    const oldValues: any = {};
    const newValues: any = {};
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
  async beforeRemove(event: RemoveEvent<any>) {
    // We use beforeRemove to capture the ID before it's gone, 
    // though afterRemove is usually safer for confirmation.
    // For Audit, knowing *what* was deleted is key.
    if (this.shouldIgnore(event.metadata.tableName)) return;
    
    const user = getCurrentUser();
    if (!user) return;

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

  private shouldIgnore(tableName: string): boolean {
    // Add 'user_sessions' and 'login_attempts' to this list
    return [
      'audit_logs', 
      'auth_logs', 
      'user_sessions', 
      'login_attempts'
    ].includes(tableName);
  }
}