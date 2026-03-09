export const validatePlanSchema = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Invalid plan data: not an object'] };
  }

  const requiredFields = ['id', 'title', 'createdAt', 'updatedAt', 'contacts', 'notificationPlan', 'access', 'accounts', 'documents', 'emergency'];

  for (const field of requiredFields) {
    if (!(field in data)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (!('willTestaments' in data) && !('estatePlanning' in data)) {
    errors.push('Missing required field: willTestaments or estatePlanning');
  }

  if (data.contacts && !Array.isArray(data.contacts)) {
    errors.push('Invalid contacts: must be an array');
  }

  if (data.notificationPlan && typeof data.notificationPlan !== 'object') {
    errors.push('Invalid notificationPlan: must be an object');
  }

  if (data.notificationPlan && !('orderedContactIds' in data.notificationPlan)) {
    errors.push('Invalid notificationPlan: missing orderedContactIds');
  }

  if (data.access && typeof data.access !== 'object') {
    errors.push('Invalid access: must be an object');
  }

  if (data.accounts && typeof data.accounts !== 'object') {
    errors.push('Invalid accounts: must be an object');
  }

  if (data.documents && !Array.isArray(data.documents)) {
    errors.push('Invalid documents: must be an array');
  }

  if (data.emergency && typeof data.emergency !== 'object') {
    errors.push('Invalid emergency: must be an object');
  }

  if (data.willTestaments && typeof data.willTestaments !== 'object') {
    errors.push('Invalid willTestaments: must be an object');
  }

  if (data.estatePlanning && typeof data.estatePlanning !== 'object') {
    errors.push('Invalid estatePlanning: must be an object');
  }

  return { valid: errors.length === 0, errors };
};
