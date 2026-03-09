import { useSession } from '~/lib/session-context';
import { useToast } from '~/lib/toast-context';
import { diffPlans } from '~/lib/diff';
import type { Plan } from '~/types';

export function usePlanUpdater() {
  const { plan: oldPlan, savePlan } = useSession();
  const { showToast } = useToast();

  const updatePlan = async (updatedPlan: Plan, successMessage?: string, auditAction?: string, auditDetails?: string) => {
    try {
      const action = auditAction || (successMessage ? 'user_update' : 'data_mutation');
      const details = auditDetails || successMessage || 'Data updated silently or reordered';
      // Only compute granular diffs for user-driven updates, not system events
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
