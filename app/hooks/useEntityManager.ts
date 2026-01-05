import { useSession } from '~/lib/session-context';
import { usePlanUpdater } from './usePlanUpdater';
import type { Plan } from '~/types';

type EntityWithId = { id: string };

export function useEntityManager<T extends EntityWithId>(
  sectionGetter: (plan: Plan) => T[],
  sectionSetter: (plan: Plan, entities: T[]) => Plan
) {
  const { plan } = useSession();
  const { updatePlan } = usePlanUpdater();

  const addEntity = async (newEntity: T, successMessage?: string) => {
    if (!plan) return;

    const entities = sectionGetter(plan);
    const updatedEntities = [...entities, newEntity];
    const updatedPlan = sectionSetter(plan, updatedEntities);

    await updatePlan(updatedPlan, successMessage);
  };

  const updateEntity = async (entityId: string, updatedEntity: T, successMessage?: string) => {
    if (!plan) return;

    const entities = sectionGetter(plan);
    const updatedEntities = entities.map(entity =>
      entity.id === entityId ? updatedEntity : entity
    );
    const updatedPlan = sectionSetter(plan, updatedEntities);

    await updatePlan(updatedPlan, successMessage);
  };

  const deleteEntity = async (entityId: string, successMessage?: string) => {
    if (!plan) return;

    const entities = sectionGetter(plan);
    const updatedEntities = entities.filter(entity => entity.id !== entityId);
    const updatedPlan = sectionSetter(plan, updatedEntities);

    await updatePlan(updatedPlan, successMessage);
  };

  const getEntities = () => {
    return plan ? sectionGetter(plan) : [];
  };

  return {
    entities: getEntities(),
    addEntity,
    updateEntity,
    deleteEntity,
  };
}
