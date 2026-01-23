import { AppLayout } from '~/components/AppLayout';
import { Card } from '~/components/Card';
import { Button } from '~/components/Button';
import { Modal } from '~/components/Modal';
import { Input } from '~/components/Input';
import { TextArea } from '~/components/TextArea';
import { useSession } from '~/lib/session-context';
import { useModalForm } from '~/hooks/useModalForm';
import { usePlanUpdater } from '~/hooks/usePlanUpdater';
import { useLanguage } from '~/lib/language-context';
import type { Safe, Cabinet, SecuritySystem, Key } from '~/types';
import { Edit2, Trash2 } from 'lucide-react';

export default function PhysicalSecurity() {
  const { plan } = useSession();
  const { updatePlan } = usePlanUpdater();
  const { t } = useLanguage();

  const safeForm = useModalForm<Partial<Safe>>({ location: '', combinationAccessMethod: '', contents: '', notes: '' });
  const cabinetForm = useModalForm<Partial<Cabinet>>({ type: '', location: '', keyLocation: '', contents: '', notes: '' });
  const systemForm = useModalForm<Partial<SecuritySystem>>({ systemType: '', code: '', resetInstructions: '', notes: '' });
  const keyForm = useModalForm<Partial<Key>>({ keyType: '', location: '', opensWhat: '', notes: '' });

  const handleSaveSafe = async () => {
    if (!plan || !safeForm.formData.location) return;
    const updated = safeForm.editingItem
      ? plan.physicalSecurity.safes.map(s => s.id === safeForm.editingItem!.id ? { ...safeForm.formData, id: s.id } as Safe : s)
      : [...plan.physicalSecurity.safes, { ...safeForm.formData, id: crypto.randomUUID() } as Safe];
    await updatePlan({ ...plan, physicalSecurity: { ...plan.physicalSecurity, safes: updated } }, t('physicalSecurity.safeSaved'));
    safeForm.closeModal();
  };

  const handleDeleteSafe = async (id: string) => {
    if (!plan || !confirm(t('physicalSecurity.deleteSafeConfirm'))) return;
    const updated = plan.physicalSecurity.safes.filter(s => s.id !== id);
    await updatePlan({ ...plan, physicalSecurity: { ...plan.physicalSecurity, safes: updated } }, t('physicalSecurity.safeDeleted'));
  };

  const handleSaveCabinet = async () => {
    if (!plan || !cabinetForm.formData.type) return;
    const updated = cabinetForm.editingItem
      ? plan.physicalSecurity.cabinets.map(c => c.id === cabinetForm.editingItem!.id ? { ...cabinetForm.formData, id: c.id } as Cabinet : c)
      : [...plan.physicalSecurity.cabinets, { ...cabinetForm.formData, id: crypto.randomUUID() } as Cabinet];
    await updatePlan({ ...plan, physicalSecurity: { ...plan.physicalSecurity, cabinets: updated } }, t('physicalSecurity.cabinetSaved'));
    cabinetForm.closeModal();
  };

  const handleDeleteCabinet = async (id: string) => {
    if (!plan || !confirm(t('physicalSecurity.deleteCabinetConfirm'))) return;
    const updated = plan.physicalSecurity.cabinets.filter(c => c.id !== id);
    await updatePlan({ ...plan, physicalSecurity: { ...plan.physicalSecurity, cabinets: updated } }, t('physicalSecurity.cabinetDeleted'));
  };

  const handleSaveSystem = async () => {
    if (!plan || !systemForm.formData.systemType) return;
    const updated = systemForm.editingItem
      ? plan.physicalSecurity.securitySystems.map(s => s.id === systemForm.editingItem!.id ? { ...systemForm.formData, id: s.id } as SecuritySystem : s)
      : [...plan.physicalSecurity.securitySystems, { ...systemForm.formData, id: crypto.randomUUID() } as SecuritySystem];
    await updatePlan({ ...plan, physicalSecurity: { ...plan.physicalSecurity, securitySystems: updated } }, t('physicalSecurity.systemSaved'));
    systemForm.closeModal();
  };

  const handleDeleteSystem = async (id: string) => {
    if (!plan || !confirm(t('physicalSecurity.deleteSystemConfirm'))) return;
    const updated = plan.physicalSecurity.securitySystems.filter(s => s.id !== id);
    await updatePlan({ ...plan, physicalSecurity: { ...plan.physicalSecurity, securitySystems: updated } }, t('physicalSecurity.systemDeleted'));
  };

  const handleSaveKey = async () => {
    if (!plan || !keyForm.formData.keyType) return;
    const currentKeys = plan.physicalSecurity.keys || [];
    const updated = keyForm.editingItem
      ? currentKeys.map(k => k.id === keyForm.editingItem!.id ? { ...keyForm.formData, id: k.id } as Key : k)
      : [...currentKeys, { ...keyForm.formData, id: crypto.randomUUID() } as Key];
    await updatePlan({ ...plan, physicalSecurity: { ...plan.physicalSecurity, keys: updated } }, t('physicalSecurity.keySaved'));
    keyForm.closeModal();
  };

  const handleDeleteKey = async (id: string) => {
    if (!plan || !confirm(t('physicalSecurity.deleteKeyConfirm'))) return;
    const currentKeys = plan.physicalSecurity.keys || [];
    const updated = currentKeys.filter(k => k.id !== id);
    await updatePlan({ ...plan, physicalSecurity: { ...plan.physicalSecurity, keys: updated } }, t('physicalSecurity.keyDeleted'));
  };

  return (
    <AppLayout>
      {plan && (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t('physicalSecurity.title')}</h1>
          <p className="text-sm sm:text-base text-gray-600">
            {t('physicalSecurity.description')}
          </p>
        </div>

        <Card title={t('physicalSecurity.safes')} action={<Button onClick={() => safeForm.openModal()}>{t('physicalSecurity.addSafe')}</Button>}>
          <div className="space-y-3">
            {plan.physicalSecurity.safes.length === 0 ? (
              <p className="text-gray-500 text-sm italic">{t('physicalSecurity.noSafesYet')}</p>
            ) : (
              plan.physicalSecurity.safes.map(safe => (
                <div key={safe.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{safe.location}</div>
                    {safe.combinationAccessMethod && <div className="text-sm text-gray-600">{t('physicalSecurity.accessLabel')} {safe.combinationAccessMethod}</div>}
                    {safe.contents && <div className="text-sm text-gray-500 mt-1">{t('physicalSecurity.contentsLabel')} {safe.contents}</div>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => safeForm.openModal(safe)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDeleteSafe(safe.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card title={t('physicalSecurity.cabinets')} action={<Button onClick={() => cabinetForm.openModal()}>{t('physicalSecurity.addCabinet')}</Button>}>
          <div className="space-y-3">
            {plan.physicalSecurity.cabinets.length === 0 ? (
              <p className="text-gray-500 text-sm italic">{t('physicalSecurity.noCabinetsYet')}</p>
            ) : (
              plan.physicalSecurity.cabinets.map(cabinet => (
                <div key={cabinet.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{cabinet.type}</div>
                    <div className="text-sm text-gray-600">{cabinet.location}</div>
                    {cabinet.keyLocation && <div className="text-sm text-gray-500 mt-1">{t('physicalSecurity.keyLocationLabel')} {cabinet.keyLocation}</div>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => cabinetForm.openModal(cabinet)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDeleteCabinet(cabinet.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card title={t('physicalSecurity.securitySystems')} action={<Button onClick={() => systemForm.openModal()}>{t('physicalSecurity.addSystem')}</Button>}>
          <div className="space-y-3">
            {plan.physicalSecurity.securitySystems.length === 0 ? (
              <p className="text-gray-500 text-sm italic">{t('physicalSecurity.noSystemsYet')}</p>
            ) : (
              plan.physicalSecurity.securitySystems.map(system => (
                <div key={system.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{system.systemType}</div>
                    {system.code && <div className="text-sm text-gray-600">{t('physicalSecurity.codeLabel')} {system.code}</div>}
                    {system.resetInstructions && <div className="text-sm text-gray-500 mt-1">{system.resetInstructions}</div>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => systemForm.openModal(system)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDeleteSystem(system.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card title={t('physicalSecurity.keys')} action={<Button onClick={() => keyForm.openModal()}>{t('physicalSecurity.addKey')}</Button>}>
          <div className="space-y-3">
            {(!plan.physicalSecurity.keys || plan.physicalSecurity.keys.length === 0) ? (
              <p className="text-gray-500 text-sm italic">{t('physicalSecurity.noKeysYet')}</p>
            ) : (
              plan.physicalSecurity.keys.map(key => (
                <div key={key.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{key.keyType}</div>
                    <div className="text-sm text-gray-600">{t('physicalSecurity.fields.location')}: {key.location}</div>
                    {key.opensWhat && <div className="text-sm text-gray-500 mt-1">{t('physicalSecurity.opensLabel')} {key.opensWhat}</div>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => keyForm.openModal(key)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDeleteKey(key.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Modal isOpen={safeForm.isModalOpen} onClose={safeForm.closeModal} title={safeForm.editingItem ? t('physicalSecurity.editSafe') : t('physicalSecurity.addSafe')} footer={<><Button variant="secondary" onClick={safeForm.closeModal}>{t('common.cancel')}</Button><Button onClick={handleSaveSafe} disabled={!safeForm.formData.location?.trim()}>{t('common.save')}</Button></>}>
          <div className="space-y-4">
            <Input label={t('physicalSecurity.fields.location')} value={safeForm.formData.location || ''} onChange={(e) => safeForm.updateField('location', e.target.value)} placeholder={t('physicalSecurity.fields.locationPlaceholder')} required />
            <Input label={t('physicalSecurity.fields.combinationAccessMethod')} value={safeForm.formData.combinationAccessMethod || ''} onChange={(e) => safeForm.updateField('combinationAccessMethod', e.target.value)} placeholder={t('physicalSecurity.fields.combinationPlaceholder')} />
            <TextArea label={t('physicalSecurity.fields.contents')} value={safeForm.formData.contents || ''} onChange={(e) => safeForm.updateField('contents', e.target.value)} placeholder={t('physicalSecurity.fields.contentsPlaceholder')} rows={3} />
            <TextArea label={t('contacts.notes')} value={safeForm.formData.notes || ''} onChange={(e) => safeForm.updateField('notes', e.target.value)} rows={2} />
          </div>
        </Modal>

        <Modal isOpen={cabinetForm.isModalOpen} onClose={cabinetForm.closeModal} title={cabinetForm.editingItem ? t('physicalSecurity.editCabinet') : t('physicalSecurity.addCabinet')} footer={<><Button variant="secondary" onClick={cabinetForm.closeModal}>{t('common.cancel')}</Button><Button onClick={handleSaveCabinet} disabled={!cabinetForm.formData.type?.trim()}>{t('common.save')}</Button></>}>
          <div className="space-y-4">
            <Input label={t('physicalSecurity.fields.type')} value={cabinetForm.formData.type || ''} onChange={(e) => cabinetForm.updateField('type', e.target.value)} placeholder={t('physicalSecurity.fields.typePlaceholder')} required />
            <Input label={t('physicalSecurity.fields.location')} value={cabinetForm.formData.location || ''} onChange={(e) => cabinetForm.updateField('location', e.target.value)} placeholder={t('physicalSecurity.fields.locationPlaceholder')} />
            <Input label={t('physicalSecurity.fields.keyLocation')} value={cabinetForm.formData.keyLocation || ''} onChange={(e) => cabinetForm.updateField('keyLocation', e.target.value)} placeholder={t('physicalSecurity.fields.keyLocationPlaceholder')} />
            <TextArea label={t('physicalSecurity.fields.cabinetContents')} value={cabinetForm.formData.contents || ''} onChange={(e) => cabinetForm.updateField('contents', e.target.value)} placeholder={t('physicalSecurity.fields.cabinetContentsPlaceholder')} rows={3} />
            <TextArea label={t('contacts.notes')} value={cabinetForm.formData.notes || ''} onChange={(e) => cabinetForm.updateField('notes', e.target.value)} rows={2} />
          </div>
        </Modal>

        <Modal isOpen={systemForm.isModalOpen} onClose={systemForm.closeModal} title={systemForm.editingItem ? t('physicalSecurity.editSystem') : t('physicalSecurity.addSystem')} footer={<><Button variant="secondary" onClick={systemForm.closeModal}>{t('common.cancel')}</Button><Button onClick={handleSaveSystem} disabled={!systemForm.formData.systemType?.trim()}>{t('common.save')}</Button></>}>
          <div className="space-y-4">
            <Input label={t('physicalSecurity.fields.systemType')} value={systemForm.formData.systemType || ''} onChange={(e) => systemForm.updateField('systemType', e.target.value)} placeholder={t('physicalSecurity.fields.systemTypePlaceholder')} required />
            <Input label={t('physicalSecurity.fields.code')} value={systemForm.formData.code || ''} onChange={(e) => systemForm.updateField('code', e.target.value)} placeholder={t('physicalSecurity.fields.codePlaceholder')} />
            <TextArea label={t('physicalSecurity.fields.resetInstructions')} value={systemForm.formData.resetInstructions || ''} onChange={(e) => systemForm.updateField('resetInstructions', e.target.value)} placeholder={t('physicalSecurity.fields.resetInstructionsPlaceholder')} rows={3} />
            <TextArea label={t('contacts.notes')} value={systemForm.formData.notes || ''} onChange={(e) => systemForm.updateField('notes', e.target.value)} rows={2} />
          </div>
        </Modal>

        <Modal isOpen={keyForm.isModalOpen} onClose={keyForm.closeModal} title={keyForm.editingItem ? t('physicalSecurity.editKey') : t('physicalSecurity.addKey')} footer={<><Button variant="secondary" onClick={keyForm.closeModal}>{t('common.cancel')}</Button><Button onClick={handleSaveKey} disabled={!keyForm.formData.keyType?.trim()}>{t('common.save')}</Button></>}>
          <div className="space-y-4">
            <Input label={t('physicalSecurity.fields.keyType')} value={keyForm.formData.keyType || ''} onChange={(e) => keyForm.updateField('keyType', e.target.value)} placeholder={t('physicalSecurity.fields.keyTypePlaceholder')} required />
            <Input label={t('physicalSecurity.fields.keyLocationField')} value={keyForm.formData.location || ''} onChange={(e) => keyForm.updateField('location', e.target.value)} placeholder={t('physicalSecurity.fields.keyLocationFieldPlaceholder')} />
            <Input label={t('physicalSecurity.fields.opensWhat')} value={keyForm.formData.opensWhat || ''} onChange={(e) => keyForm.updateField('opensWhat', e.target.value)} placeholder={t('physicalSecurity.fields.opensWhatPlaceholder')} />
            <TextArea label={t('contacts.notes')} value={keyForm.formData.notes || ''} onChange={(e) => keyForm.updateField('notes', e.target.value)} rows={2} />
          </div>
        </Modal>
      </div>
      )}
    </AppLayout>
  );
}
