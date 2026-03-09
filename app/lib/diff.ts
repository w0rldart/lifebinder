import type { Plan } from '~/types';

function calculateDiff(oldObj: any, newObj: any, path: string = ''): string[] {
  if (oldObj === newObj) return [];

  if (oldObj === undefined) return [`${path}: Added`];
  if (newObj === undefined) return [`${path}: Removed`];

  if (Array.isArray(oldObj) && Array.isArray(newObj)) {
    if (oldObj.length !== newObj.length)
      return [`${path}: ${oldObj.length} -> ${newObj.length} items`];
    if (JSON.stringify(oldObj) !== JSON.stringify(newObj))
      return [`${path}: Array items modified`];
    return [];
  }

  if (typeof oldObj === 'object' && oldObj !== null && typeof newObj === 'object' && newObj !== null) {
    const keys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);
    let changes: string[] = [];
    for (const key of keys) {
      if (key === 'updatedAt' || key === 'auditLogs') continue;
      const newPath = path ? `${path}.${key}` : key;
      changes = changes.concat(calculateDiff(oldObj[key], newObj[key], newPath));
    }
    return changes;
  }

  let oldStr = String(oldObj);
  let newStr = String(newObj);
  if (oldStr.length > 50) oldStr = oldStr.substring(0, 50) + '...';
  if (newStr.length > 50) newStr = newStr.substring(0, 50) + '...';

  if (path.toLowerCase().includes('password') || path.toLowerCase().includes('passphrase'))
    return [`${path}: Value changed`];

  return [`${path}: '${oldStr}' -> '${newStr}'`];
}

export function diffPlans(oldPlan: Plan, newPlan: Plan): string[] {
  const changes = calculateDiff(oldPlan, newPlan);
  if (changes.length > 10)
    return [...changes.slice(0, 10), `...and ${changes.length - 10} more changes`];
  return changes;
}
