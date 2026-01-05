import { AppLayout } from '~/components/AppLayout';
import { Card } from '~/components/Card';
import { Button } from '~/components/Button';
import { Modal } from '~/components/Modal';
import { Input } from '~/components/Input';
import { TextArea } from '~/components/TextArea';
import { useSession } from '~/lib/session-context';
import { useModalForm } from '~/hooks/useModalForm';
import { usePlanUpdater } from '~/hooks/usePlanUpdater';
import type { Safe, Cabinet, SecuritySystem, Key } from '~/types';
import { Edit2, Trash2 } from 'lucide-react';

export default function PhysicalSecurity() {
  const { plan } = useSession();
  const { updatePlan } = usePlanUpdater();

  const safeForm = useModalForm<Partial<Safe>>({ location: '', combinationAccessMethod: '', contents: '', notes: '' });
  const cabinetForm = useModalForm<Partial<Cabinet>>({ type: '', location: '', keyLocation: '', contents: '', notes: '' });
  const systemForm = useModalForm<Partial<SecuritySystem>>({ systemType: '', code: '', resetInstructions: '', notes: '' });
  const keyForm = useModalForm<Partial<Key>>({ keyType: '', location: '', opensWhat: '', notes: '' });

  const handleSaveSafe = async () => {
    if (!plan || !safeForm.formData.location) return;
    const updated = safeForm.editingItem
      ? plan.physicalSecurity.safes.map(s => s.id === safeForm.editingItem!.id ? { ...safeForm.formData, id: s.id } as Safe : s)
      : [...plan.physicalSecurity.safes, { ...safeForm.formData, id: crypto.randomUUID() } as Safe];
    await updatePlan({ ...plan, physicalSecurity: { ...plan.physicalSecurity, safes: updated } }, 'Safe saved');
    safeForm.closeModal();
  };

  const handleDeleteSafe = async (id: string) => {
    if (!plan || !confirm('Delete this safe?')) return;
    const updated = plan.physicalSecurity.safes.filter(s => s.id !== id);
    await updatePlan({ ...plan, physicalSecurity: { ...plan.physicalSecurity, safes: updated } }, 'Safe deleted');
  };

  const handleSaveCabinet = async () => {
    if (!plan || !cabinetForm.formData.type) return;
    const updated = cabinetForm.editingItem
      ? plan.physicalSecurity.cabinets.map(c => c.id === cabinetForm.editingItem!.id ? { ...cabinetForm.formData, id: c.id } as Cabinet : c)
      : [...plan.physicalSecurity.cabinets, { ...cabinetForm.formData, id: crypto.randomUUID() } as Cabinet];
    await updatePlan({ ...plan, physicalSecurity: { ...plan.physicalSecurity, cabinets: updated } }, 'Cabinet saved');
    cabinetForm.closeModal();
  };

  const handleDeleteCabinet = async (id: string) => {
    if (!plan || !confirm('Delete this cabinet?')) return;
    const updated = plan.physicalSecurity.cabinets.filter(c => c.id !== id);
    await updatePlan({ ...plan, physicalSecurity: { ...plan.physicalSecurity, cabinets: updated } }, 'Cabinet deleted');
  };

  const handleSaveSystem = async () => {
    if (!plan || !systemForm.formData.systemType) return;
    const updated = systemForm.editingItem
      ? plan.physicalSecurity.securitySystems.map(s => s.id === systemForm.editingItem!.id ? { ...systemForm.formData, id: s.id } as SecuritySystem : s)
      : [...plan.physicalSecurity.securitySystems, { ...systemForm.formData, id: crypto.randomUUID() } as SecuritySystem];
    await updatePlan({ ...plan, physicalSecurity: { ...plan.physicalSecurity, securitySystems: updated } }, 'Security system saved');
    systemForm.closeModal();
  };

  const handleDeleteSystem = async (id: string) => {
    if (!plan || !confirm('Delete this security system?')) return;
    const updated = plan.physicalSecurity.securitySystems.filter(s => s.id !== id);
    await updatePlan({ ...plan, physicalSecurity: { ...plan.physicalSecurity, securitySystems: updated } }, 'Security system deleted');
  };

  const handleSaveKey = async () => {
    if (!plan || !keyForm.formData.keyType) return;
    const currentKeys = plan.physicalSecurity.keys || [];
    const updated = keyForm.editingItem
      ? currentKeys.map(k => k.id === keyForm.editingItem!.id ? { ...keyForm.formData, id: k.id } as Key : k)
      : [...currentKeys, { ...keyForm.formData, id: crypto.randomUUID() } as Key];
    await updatePlan({ ...plan, physicalSecurity: { ...plan.physicalSecurity, keys: updated } }, 'Key saved');
    keyForm.closeModal();
  };

  const handleDeleteKey = async (id: string) => {
    if (!plan || !confirm('Delete this key?')) return;
    const currentKeys = plan.physicalSecurity.keys || [];
    const updated = currentKeys.filter(k => k.id !== id);
    await updatePlan({ ...plan, physicalSecurity: { ...plan.physicalSecurity, keys: updated } }, 'Key deleted');
  };

  return (
    <AppLayout>
      {plan && (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Physical Security</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Document safes, cabinets, security systems, and keys
          </p>
        </div>

        <Card title="Safes" action={<Button onClick={() => safeForm.openModal()}>Add Safe</Button>}>
          <div className="space-y-3">
            {plan.physicalSecurity.safes.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No safes added yet</p>
            ) : (
              plan.physicalSecurity.safes.map(safe => (
                <div key={safe.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{safe.location}</div>
                    {safe.combinationAccessMethod && <div className="text-sm text-gray-600">Access: {safe.combinationAccessMethod}</div>}
                    {safe.contents && <div className="text-sm text-gray-500 mt-1">Contents: {safe.contents}</div>}
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

        <Card title="File Cabinets" action={<Button onClick={() => cabinetForm.openModal()}>Add Cabinet</Button>}>
          <div className="space-y-3">
            {plan.physicalSecurity.cabinets.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No cabinets added yet</p>
            ) : (
              plan.physicalSecurity.cabinets.map(cabinet => (
                <div key={cabinet.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{cabinet.type}</div>
                    <div className="text-sm text-gray-600">{cabinet.location}</div>
                    {cabinet.keyLocation && <div className="text-sm text-gray-500 mt-1">Key: {cabinet.keyLocation}</div>}
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

        <Card title="Security Systems" action={<Button onClick={() => systemForm.openModal()}>Add System</Button>}>
          <div className="space-y-3">
            {plan.physicalSecurity.securitySystems.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No security systems added yet</p>
            ) : (
              plan.physicalSecurity.securitySystems.map(system => (
                <div key={system.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{system.systemType}</div>
                    {system.code && <div className="text-sm text-gray-600">Code: {system.code}</div>}
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

        <Card title="Keys" action={<Button onClick={() => keyForm.openModal()}>Add Key</Button>}>
          <div className="space-y-3">
            {(!plan.physicalSecurity.keys || plan.physicalSecurity.keys.length === 0) ? (
              <p className="text-gray-500 text-sm italic">No keys added yet</p>
            ) : (
              plan.physicalSecurity.keys.map(key => (
                <div key={key.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{key.keyType}</div>
                    <div className="text-sm text-gray-600">Location: {key.location}</div>
                    {key.opensWhat && <div className="text-sm text-gray-500 mt-1">Opens: {key.opensWhat}</div>}
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

        <Modal isOpen={safeForm.isModalOpen} onClose={safeForm.closeModal} title={safeForm.editingItem ? 'Edit Safe' : 'Add Safe'} footer={<><Button variant="secondary" onClick={safeForm.closeModal}>Cancel</Button><Button onClick={handleSaveSafe} disabled={!safeForm.formData.location?.trim()}>Save</Button></>}>
          <div className="space-y-4">
            <Input label="Location" value={safeForm.formData.location || ''} onChange={(e) => safeForm.updateField('location', e.target.value)} placeholder="e.g., Master bedroom closet" required />
            <Input label="Combination/Access Method" value={safeForm.formData.combinationAccessMethod || ''} onChange={(e) => safeForm.updateField('combinationAccessMethod', e.target.value)} placeholder="Where combination is stored" />
            <TextArea label="Contents" value={safeForm.formData.contents || ''} onChange={(e) => safeForm.updateField('contents', e.target.value)} placeholder="What's stored in the safe" rows={3} />
            <TextArea label="Notes" value={safeForm.formData.notes || ''} onChange={(e) => safeForm.updateField('notes', e.target.value)} rows={2} />
          </div>
        </Modal>

        <Modal isOpen={cabinetForm.isModalOpen} onClose={cabinetForm.closeModal} title={cabinetForm.editingItem ? 'Edit Cabinet' : 'Add Cabinet'} footer={<><Button variant="secondary" onClick={cabinetForm.closeModal}>Cancel</Button><Button onClick={handleSaveCabinet} disabled={!cabinetForm.formData.type?.trim()}>Save</Button></>}>
          <div className="space-y-4">
            <Input label="Cabinet Type" value={cabinetForm.formData.type || ''} onChange={(e) => cabinetForm.updateField('type', e.target.value)} placeholder="e.g., File cabinet, Locked drawer" required />
            <Input label="Location" value={cabinetForm.formData.location || ''} onChange={(e) => cabinetForm.updateField('location', e.target.value)} placeholder="e.g., Home office" />
            <Input label="Key Location" value={cabinetForm.formData.keyLocation || ''} onChange={(e) => cabinetForm.updateField('keyLocation', e.target.value)} placeholder="Where the key is stored" />
            <TextArea label="Contents" value={cabinetForm.formData.contents || ''} onChange={(e) => cabinetForm.updateField('contents', e.target.value)} placeholder="What's stored inside" rows={3} />
            <TextArea label="Notes" value={cabinetForm.formData.notes || ''} onChange={(e) => cabinetForm.updateField('notes', e.target.value)} rows={2} />
          </div>
        </Modal>

        <Modal isOpen={systemForm.isModalOpen} onClose={systemForm.closeModal} title={systemForm.editingItem ? 'Edit Security System' : 'Add Security System'} footer={<><Button variant="secondary" onClick={systemForm.closeModal}>Cancel</Button><Button onClick={handleSaveSystem} disabled={!systemForm.formData.systemType?.trim()}>Save</Button></>}>
          <div className="space-y-4">
            <Input label="System Type" value={systemForm.formData.systemType || ''} onChange={(e) => systemForm.updateField('systemType', e.target.value)} placeholder="e.g., ADT Home Security, Ring" required />
            <Input label="Code" value={systemForm.formData.code || ''} onChange={(e) => systemForm.updateField('code', e.target.value)} placeholder="Access code or PIN" />
            <TextArea label="Reset Instructions" value={systemForm.formData.resetInstructions || ''} onChange={(e) => systemForm.updateField('resetInstructions', e.target.value)} placeholder="How to reset or access the system" rows={3} />
            <TextArea label="Notes" value={systemForm.formData.notes || ''} onChange={(e) => systemForm.updateField('notes', e.target.value)} rows={2} />
          </div>
        </Modal>

        <Modal isOpen={keyForm.isModalOpen} onClose={keyForm.closeModal} title={keyForm.editingItem ? 'Edit Key' : 'Add Key'} footer={<><Button variant="secondary" onClick={keyForm.closeModal}>Cancel</Button><Button onClick={handleSaveKey} disabled={!keyForm.formData.keyType?.trim()}>Save</Button></>}>
          <div className="space-y-4">
            <Input label="Key Type" value={keyForm.formData.keyType || ''} onChange={(e) => keyForm.updateField('keyType', e.target.value)} placeholder="e.g., House key, Car key" required />
            <Input label="Location" value={keyForm.formData.location || ''} onChange={(e) => keyForm.updateField('location', e.target.value)} placeholder="Where the key is stored" />
            <Input label="Opens What" value={keyForm.formData.opensWhat || ''} onChange={(e) => keyForm.updateField('opensWhat', e.target.value)} placeholder="What this key unlocks" />
            <TextArea label="Notes" value={keyForm.formData.notes || ''} onChange={(e) => keyForm.updateField('notes', e.target.value)} rows={2} />
          </div>
        </Modal>
      </div>
      )}
    </AppLayout>
  );
}
