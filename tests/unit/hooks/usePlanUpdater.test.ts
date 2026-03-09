import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePlanUpdater } from '~/hooks/usePlanUpdater';
import type { Plan } from '~/types';

// Mock dependencies
const mockSavePlan = vi.fn();
const mockShowToast = vi.fn();

vi.mock('~/lib/session-context', () => ({
  useSession: () => ({
    plan: {
      version: 1,
      id: 'old-plan',
      contacts: [{ id: '1', name: 'John Doe', relationship: 'Friend' }],
      updatedAt: '2026-03-09T00:00:00.000Z',
      auditLogs: []
    } as unknown as Plan,
    savePlan: mockSavePlan
  })
}));

vi.mock('~/lib/toast-context', () => ({
  useToast: () => ({
    showToast: mockShowToast
  })
}));

describe('usePlanUpdater Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('computes granular diffs for user_update actions and delegates saving', async () => {
    const { result } = renderHook(() => usePlanUpdater());

    // Create a new plan that represents a change
    const newPlan = {
      version: 1,
      id: 'old-plan',
      contacts: [
        { id: '1', name: 'John Doe', relationship: 'Brother' }, // Modified
        { id: '2', name: 'Jane Doe', relationship: 'Sister' }   // Added
      ],
      updatedAt: '2026-03-09T01:00:00.000Z',
      auditLogs: []
    } as unknown as Plan;

    // Trigger update
    await result.current.updatePlan(newPlan, 'Contacts Updated Successfully!');

    // Verify side effects
    expect(mockShowToast).toHaveBeenCalledWith('Contacts Updated Successfully!', 'success');
    
    // Verify savePlan was called with the correct parameters
    expect(mockSavePlan).toHaveBeenCalledTimes(1);
    
    const [savedPlan, action, details, changes] = mockSavePlan.mock.calls[0];
    
    expect(savedPlan).toEqual(newPlan);
    expect(action).toBe('user_update');
    expect(details).toBe('Contacts Updated Successfully!');
    
    // Crucially, verify that diffs were computed correctly
    expect(changes).toBeDefined();
    expect(Array.isArray(changes)).toBe(true);
    // Since arrays are complicated in diffs of lengths, it should output:
    expect(changes).toContain('contacts: 1 -> 2 items');
  });

  it('suppresses granular diff computation for system events', async () => {
    const { result } = renderHook(() => usePlanUpdater());

    const newPlan = {
      version: 1,
      id: 'old-plan',
      contacts: [{ id: '1', name: 'John Doe', relationship: 'Friend' }],
      preferences: { theme: 'dark' }, // some fake system change
      updatedAt: '2026-03-09T01:00:00.000Z',
      auditLogs: []
    } as unknown as Plan;

    // Trigger update with a system audit action
    await result.current.updatePlan(newPlan, undefined, 'system_encrypt', 'Re-encrypted vault');
    
    expect(mockSavePlan).toHaveBeenCalledTimes(1);
    const [, action, details, changes] = mockSavePlan.mock.calls[0];
    
    expect(action).toBe('system_encrypt');
    expect(details).toBe('Re-encrypted vault');
    // Changes should be completely suppressed (undefined) for system events
    expect(changes).toBeUndefined();
  });
});
