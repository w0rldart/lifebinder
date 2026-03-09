import { useSession } from '~/lib/session-context';
import { useToast } from '~/lib/toast-context';
import type { Plan } from '~/types';

/**
 * Recursively compares an old state and a new state to generate a human-readable list of changes.
 * This function intentionally avoids deep comparison of massive objects and masks sensitive fields.
 */
function calculateDiff(oldObj: any, newObj: any, path: string = ''): string[] {
  // If exact match (primitive or exact same reference), no changes
  if (oldObj === newObj) return [];

  // Handle additions and removals at this node level
  if (oldObj === undefined) return [`${path}: Added`];
  if (newObj === undefined) return [`${path}: Removed`];

  // Compare arrays: summarize length changes or flag internal modifications
  if (Array.isArray(oldObj) && Array.isArray(newObj)) {
    if (oldObj.length !== newObj.length)
      return [`${path}: ${oldObj.length} -> ${newObj.length} items`];
    if (JSON.stringify(oldObj) !== JSON.stringify(newObj))
      return [`${path}: Array items modified`];
    return [];
  }

  // Recursively inspect objects
  if (typeof oldObj === 'object' && oldObj !== null && typeof newObj === 'object' && newObj !== null) {
    const keys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);
    let changes: string[] = [];
    for (const key of keys) {
      // Ignore fields that naturally churn on every save and shouldn't bloat the diff
      if (key === 'updatedAt' || key === 'auditLogs') continue;
      
      const newPath = path ? `${path}.${key}` : key;
      changes = changes.concat(calculateDiff(oldObj[key], newObj[key], newPath));
    }
    return changes;
  }

  // Stringify primitives and truncate if they are excessively long
  let oldStr = String(oldObj);
  let newStr = String(newObj);
  if (oldStr.length > 50) oldStr = oldStr.substring(0, 50) + '...';
  if (newStr.length > 50) newStr = newStr.substring(0, 50) + '...';

  // Mask security-sensitive strings to prevent them leaking into the audit trail
  if (path.toLowerCase().includes('password') || path.toLowerCase().includes('passphrase'))
    return [`${path}: Value changed`];

  // Output standard primitive modification
  return [`${path}: '${oldStr}' -> '${newStr}'`];
}

/**
 * Wraps calculateDiff to enforce a maximum number of granular change logs per action.
 * Prevents a massive root-level edit from flooding the audit log view.
 */
function diffPlans(oldPlan: Plan, newPlan: Plan): string[] {
  const changes = calculateDiff(oldPlan, newPlan);
  if (changes.length > 10)
    return [...changes.slice(0, 10), `...and ${changes.length - 10} more changes`];
  return changes;
}

export function usePlanUpdater() {
  const { plan: oldPlan, savePlan } = useSession();
  const { showToast } = useToast();

  const updatePlan = async (updatedPlan: Plan, successMessage?: string, auditAction?: string, auditDetails?: string) => {
    try {
      // Default to standard data mutation events if the caller didn't provide specific audit details
      const action = auditAction || (successMessage ? 'user_update' : 'data_mutation');
      const details = auditDetails || successMessage || 'Data updated silently or reordered';
      
      // Only compute granular diffs for user-driven updates, not system events (like locking/unlocking)
      const isUserAction = !auditAction || auditAction === 'user_update' || auditAction === 'data_mutation';
      const changes = (oldPlan && isUserAction) ? diffPlans(oldPlan, updatedPlan) : undefined;
      
      await savePlan(updatedPlan, action, details, changes);
      
      if (successMessage) {
        showToast(successMessage, 'success');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save changes';
      showToast(errorMessage, 'error');
      throw error;
    }
  };

  return { updatePlan };
}
