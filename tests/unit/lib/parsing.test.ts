import { describe, it, expect } from 'vitest';
import { validatePlanSchema } from '~/lib/validation';

describe('JSON Data Validation', () => {
  it('should accept a perfectly valid plan object', () => {
    const validPlan = {
      id: '123',
      title: 'Valid Plan',
      createdAt: 'date',
      updatedAt: 'date',
      contacts: [],
      notificationPlan: { orderedContactIds: [] },
      access: {},
      accounts: {},
      documents: [],
      emergency: {},
      willTestaments: {}
    };

    const result = validatePlanSchema(validPlan);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject a plan missing core required primitive fields', () => {
    const missingFieldsPlan = {
      id: '123'
      // missing title, createdAt, contacts, etc
    };

    const result = validatePlanSchema(missingFieldsPlan);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing required field: title');
    expect(result.errors).toContain('Missing required field: contacts');
  });

  it('should reject a plan with an invalid array type (like Contacts)', () => {
    const corruptedPlan = {
      id: '123',
      title: 'Valid Plan',
      createdAt: 'date',
      updatedAt: 'date',
      contacts: { notAnArray: true }, // Should be an array
      notificationPlan: { orderedContactIds: [] },
      access: {},
      accounts: {},
      documents: [],
      emergency: {},
      willTestaments: {}
    };

    const result = validatePlanSchema(corruptedPlan);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid contacts: must be an array');
  });

  it('should completely reject non-objects like null or strings', () => {
    const result1 = validatePlanSchema(null);
    expect(result1.valid).toBe(false);
    
    const result2 = validatePlanSchema("Some random string data");
    expect(result2.valid).toBe(false);
  });
});
