import { useSession } from '~/lib/session-context';
import { useToast } from '~/lib/toast-context';
import type { Plan } from '~/types';

export function usePlanUpdater() {
  const { savePlan } = useSession();
  const { showToast } = useToast();

  const updatePlan = async (updatedPlan: Plan, successMessage?: string) => {
    try {
      await savePlan(updatedPlan);
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
