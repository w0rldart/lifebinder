import { AppLayout } from '~/components/AppLayout';
import { Card } from '~/components/Card';
import { Button } from '~/components/Button';
import { Modal } from '~/components/Modal';
import { Input } from '~/components/Input';
import { TextArea } from '~/components/TextArea';
import { WarningBanner } from '~/components/WarningBanner';
import { useSession } from '~/lib/session-context';
import { useModalForm } from '~/hooks/useModalForm';
import { usePlanUpdater } from '~/hooks/usePlanUpdater';
import { useLanguage } from '~/lib/language-context';
import type { PrimaryEmail, Device, NetworkInfrastructure, IoTDevice } from '~/types';
import { Edit2, Trash2 } from 'lucide-react';

export default function Access() {
  const { plan } = useSession();
  const { updatePlan } = usePlanUpdater();
  const { t } = useLanguage();

  const emailForm = useModalForm<Partial<PrimaryEmail>>({ email: '', provider: '', notes: '' });
  const deviceForm = useModalForm<Partial<Device>>({ type: '', name: '', retentionNotes: '', intendedRecipient: '', disposalInstructions: '', requiresDataWipe: false });
  const networkForm = useModalForm<Partial<NetworkInfrastructure>>({ routerModemModel: '', wifiNetworkName: '', wifiCredentialsLocation: '', adminPanelUrl: '', adminCredentialsLocation: '', restartProcedures: '', technicalSupportContact: '', notes: '' });
  const iotForm = useModalForm<Partial<IoTDevice>>({ deviceType: '', name: '', hubController: '', credentialsLocation: '', recipientDisposition: '', notes: '' });

  const handleSaveEmail = async () => {
    if (!plan || !emailForm.formData.email) return;

    const updatedEmails = emailForm.editingItem
      ? plan.access.primaryEmails.map(e => e.id === emailForm.editingItem!.id ? { ...emailForm.formData, id: e.id } as PrimaryEmail : e)
      : [...plan.access.primaryEmails, { ...emailForm.formData, id: crypto.randomUUID() } as PrimaryEmail];

    const updatedPlan = { ...plan, access: { ...plan.access, primaryEmails: updatedEmails } };
    await updatePlan(updatedPlan, emailForm.editingItem ? t('access.emailUpdated') : t('access.emailAdded'));
    emailForm.closeModal();
  };

  const handleDeleteEmail = async (id: string) => {
    if (!plan || !confirm(t('access.deleteEmailConfirm'))) return;

    const updatedEmails = plan.access.primaryEmails.filter(e => e.id !== id);
    const updatedPlan = { ...plan, access: { ...plan.access, primaryEmails: updatedEmails } };
    await updatePlan(updatedPlan, t('access.emailDeleted'));
  };

  const handleSaveDevice = async () => {
    if (!plan || !deviceForm.formData.name) return;

    const updatedDevices = deviceForm.editingItem
      ? plan.access.devices.map(d => d.id === deviceForm.editingItem!.id ? { ...deviceForm.formData, id: d.id } as Device : d)
      : [...plan.access.devices, { ...deviceForm.formData, id: crypto.randomUUID() } as Device];

    const updatedPlan = { ...plan, access: { ...plan.access, devices: updatedDevices } };
    await updatePlan(updatedPlan, deviceForm.editingItem ? t('access.deviceUpdated') : t('access.deviceAdded'));
    deviceForm.closeModal();
  };

  const handleDeleteDevice = async (id: string) => {
    if (!plan || !confirm(t('access.deleteDeviceConfirm'))) return;

    const updatedDevices = plan.access.devices.filter(d => d.id !== id);
    const updatedPlan = { ...plan, access: { ...plan.access, devices: updatedDevices } };
    await updatePlan(updatedPlan, t('access.deviceDeleted'));
  };

  const handleUpdateNotes = async (field: 'passwordManagerNotes' | 'twoFANotes', value: string) => {
    if (!plan) return;

    const updatedPlan = { ...plan, access: { ...plan.access, [field]: value } };
    await updatePlan(updatedPlan, t('access.notesUpdated'));
  };

  const handleSaveNetwork = async () => {
    if (!plan || !networkForm.formData.routerModemModel) return;

    const updatedNetwork = networkForm.editingItem
      ? plan.access.networkInfrastructure.map(n => n.id === networkForm.editingItem!.id ? { ...networkForm.formData, id: n.id } as NetworkInfrastructure : n)
      : [...plan.access.networkInfrastructure, { ...networkForm.formData, id: crypto.randomUUID() } as NetworkInfrastructure];

    const updatedPlan = { ...plan, access: { ...plan.access, networkInfrastructure: updatedNetwork } };
    await updatePlan(updatedPlan, networkForm.editingItem ? t('access.networkUpdated') : t('access.networkAdded'));
    networkForm.closeModal();
  };

  const handleDeleteNetwork = async (id: string) => {
    if (!plan || !confirm(t('access.deleteNetworkConfirm'))) return;

    const updatedNetwork = plan.access.networkInfrastructure.filter(n => n.id !== id);
    const updatedPlan = { ...plan, access: { ...plan.access, networkInfrastructure: updatedNetwork } };
    await updatePlan(updatedPlan, t('access.networkDeleted'));
  };

  const handleSaveIoT = async () => {
    if (!plan || !iotForm.formData.name) return;

    const updatedIoT = iotForm.editingItem
      ? plan.access.iotDevices.map(i => i.id === iotForm.editingItem!.id ? { ...iotForm.formData, id: i.id } as IoTDevice : i)
      : [...plan.access.iotDevices, { ...iotForm.formData, id: crypto.randomUUID() } as IoTDevice];

    const updatedPlan = { ...plan, access: { ...plan.access, iotDevices: updatedIoT } };
    await updatePlan(updatedPlan, iotForm.editingItem ? t('access.iotUpdated') : t('access.iotAdded'));
    iotForm.closeModal();
  };

  const handleDeleteIoT = async (id: string) => {
    if (!plan || !confirm(t('access.deleteIoTConfirm'))) return;

    const updatedIoT = plan.access.iotDevices.filter(i => i.id !== id);
    const updatedPlan = { ...plan, access: { ...plan.access, iotDevices: updatedIoT } };
    await updatePlan(updatedPlan, t('access.iotDeleted'));
  };

  return (
    <AppLayout>
      {plan && (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t('access.title')}</h1>
          <p className="text-sm sm:text-base text-gray-600">
            {t('access.description')}
          </p>
        </div>

        <WarningBanner type="warning">
          <strong>{t('access.securityNotice')}</strong> {t('access.securityNoticeText')}
        </WarningBanner>

        <Card title={t('access.primaryEmails')} action={<Button onClick={() => emailForm.openModal()}>{t('access.addEmail')}</Button>}>
          <div className="space-y-3">
            {plan.access.primaryEmails.length === 0 ? (
              <p className="text-gray-500 text-sm italic">{t('access.noEmailsYet')}</p>
            ) : (
              plan.access.primaryEmails.map(email => (
                <div key={email.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{email.email}</div>
                    <div className="text-sm text-gray-600">{email.provider}</div>
                    {email.notes && <div className="text-sm text-gray-500 mt-1">{email.notes}</div>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => emailForm.openModal(email)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDeleteEmail(email.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card title={t('access.passwordManager')}>
          <TextArea
            label={t('access.locationAndAccessInstructions')}
            value={plan.access.passwordManagerNotes}
            onChange={(e) => handleUpdateNotes('passwordManagerNotes', e.target.value)}
            placeholder={t('access.passwordManagerPlaceholder')}
            rows={4}
            helpText={t('access.passwordManagerHelpText')}
          />
        </Card>

        <Card title={t('access.twoFA')}>
          <TextArea
            label={t('access.recoveryInformation')}
            value={plan.access.twoFANotes}
            onChange={(e) => handleUpdateNotes('twoFANotes', e.target.value)}
            placeholder={t('access.twoFAPlaceholder')}
            rows={4}
            helpText={t('access.twoFAHelpText')}
          />
        </Card>

        <Card title={t('access.networkInfrastructure')} action={<Button onClick={() => networkForm.openModal()}>{t('access.addInfrastructure')}</Button>}>
          <p className="text-sm text-gray-600 mb-4">
            {t('access.networkDescription')}
          </p>
          <div className="space-y-3">
            {plan.access.networkInfrastructure.length === 0 ? (
              <p className="text-gray-500 text-sm italic">{t('access.noNetworkYet')}</p>
            ) : (
              plan.access.networkInfrastructure.map(network => (
                <div key={network.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{network.routerModemModel}</div>
                    <div className="text-sm text-gray-600">{t('access.wifiLabel')} {network.wifiNetworkName || t('access.notSpecified')}</div>
                    {network.notes && <div className="text-sm text-gray-500 mt-1">{network.notes}</div>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => networkForm.openModal(network)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDeleteNetwork(network.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card title={t('access.iotDevices')} action={<Button onClick={() => iotForm.openModal()}>{t('access.addDevice')}</Button>}>
          <p className="text-sm text-gray-600 mb-4">
            {t('access.iotDescription')}
          </p>
          <div className="space-y-3">
            {plan.access.iotDevices.length === 0 ? (
              <p className="text-gray-500 text-sm italic">{t('access.noIoTYet')}</p>
            ) : (
              plan.access.iotDevices.map(device => (
                <div key={device.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{device.name}</div>
                    <div className="text-sm text-gray-600">{device.deviceType}</div>
                    {device.recipientDisposition && <div className="text-sm text-gray-500 mt-1">{t('access.dispositionLabel')} {device.recipientDisposition}</div>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => iotForm.openModal(device)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDeleteIoT(device.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card title={t('access.deviceRetention')} action={<Button onClick={() => deviceForm.openModal()}>{t('access.addDevice')}</Button>}>
          <p className="text-sm text-gray-600 mb-4">
            {t('access.deviceRetentionDescription')}
          </p>
          <div className="space-y-3">
            {plan.access.devices.length === 0 ? (
              <p className="text-gray-500 text-sm italic">{t('access.noDevicesYet')}</p>
            ) : (
              plan.access.devices.map(device => (
                <div key={device.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{device.name}</div>
                    <div className="text-sm text-gray-600">{device.type}</div>
                    {device.intendedRecipient && <div className="text-sm text-gray-600 mt-1">{t('access.recipientLabel')} {device.intendedRecipient}</div>}
                    {device.requiresDataWipe && <div className="text-sm text-orange-600 mt-1">⚠️ {t('access.requiresDataWipe')}</div>}
                    {device.retentionNotes && <div className="text-sm text-gray-500 mt-1">{device.retentionNotes}</div>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => deviceForm.openModal(device)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDeleteDevice(device.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Modal
          isOpen={emailForm.isModalOpen}
          onClose={emailForm.closeModal}
          title={emailForm.editingItem ? t('access.modals.editEmail') : t('access.modals.addEmail')}
          footer={
            <>
              <Button variant="secondary" onClick={emailForm.closeModal}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleSaveEmail} disabled={!emailForm.formData.email?.trim()}>
                {t('common.save')}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input
              label={t('access.fields.emailAddress')}
              type="email"
              value={emailForm.formData.email || ''}
              onChange={(e) => emailForm.updateField('email', e.target.value)}
              required
            />
            <Input
              label={t('access.fields.provider')}
              value={emailForm.formData.provider || ''}
              onChange={(e) => emailForm.updateField('provider', e.target.value)}
              placeholder={t('access.fields.providerPlaceholder')}
            />
            <TextArea
              label={t('contacts.notes')}
              value={emailForm.formData.notes || ''}
              onChange={(e) => emailForm.updateField('notes', e.target.value)}
              placeholder={t('access.fields.notesPlaceholder')}
            />
          </div>
        </Modal>

        <Modal
          isOpen={deviceForm.isModalOpen}
          onClose={deviceForm.closeModal}
          title={deviceForm.editingItem ? t('access.modals.editDevice') : t('access.modals.addDevice')}
          footer={
            <>
              <Button variant="secondary" onClick={deviceForm.closeModal}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleSaveDevice} disabled={!deviceForm.formData.name?.trim()}>
                {t('common.save')}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input
              label={t('access.fields.deviceName')}
              value={deviceForm.formData.name || ''}
              onChange={(e) => deviceForm.updateField('name', e.target.value)}
              placeholder={t('access.fields.deviceNamePlaceholder')}
              required
            />
            <Input
              label={t('access.fields.type')}
              value={deviceForm.formData.type || ''}
              onChange={(e) => deviceForm.updateField('type', e.target.value)}
              placeholder={t('access.fields.typePlaceholder')}
            />
            <Input
              label={t('access.fields.intendedRecipient')}
              value={deviceForm.formData.intendedRecipient || ''}
              onChange={(e) => deviceForm.updateField('intendedRecipient', e.target.value)}
              placeholder={t('access.fields.intendedRecipientPlaceholder')}
            />
            <TextArea
              label={t('access.fields.disposalInstructions')}
              value={deviceForm.formData.disposalInstructions || ''}
              onChange={(e) => deviceForm.updateField('disposalInstructions', e.target.value)}
              placeholder={t('access.fields.disposalInstructionsPlaceholder')}
            />
            <div className="flex items-start">
              <input
                type="checkbox"
                id="requiresDataWipe"
                checked={deviceForm.formData.requiresDataWipe || false}
                onChange={(e) => deviceForm.updateField('requiresDataWipe', e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="requiresDataWipe" className="ml-2 block text-sm text-gray-700">
                {t('access.fields.requiresDataWipeLabel')}
                <span className="block text-xs text-gray-500 mt-1">{t('access.fields.requiresDataWipeHelp')}</span>
              </label>
            </div>
            <TextArea
              label={t('access.fields.retentionNotes')}
              value={deviceForm.formData.retentionNotes || ''}
              onChange={(e) => deviceForm.updateField('retentionNotes', e.target.value)}
              placeholder={t('access.fields.retentionNotesPlaceholder')}
            />
          </div>
        </Modal>

        <Modal
          isOpen={networkForm.isModalOpen}
          onClose={networkForm.closeModal}
          title={networkForm.editingItem ? t('access.modals.editNetwork') : t('access.modals.addNetwork')}
          footer={
            <>
              <Button variant="secondary" onClick={networkForm.closeModal}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleSaveNetwork} disabled={!networkForm.formData.routerModemModel?.trim()}>
                {t('common.save')}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input
              label={t('access.fields.routerModemModel')}
              value={networkForm.formData.routerModemModel || ''}
              onChange={(e) => networkForm.updateField('routerModemModel', e.target.value)}
              placeholder={t('access.fields.routerModemModelPlaceholder')}
              required
            />
            <Input
              label={t('access.fields.wifiNetworkName')}
              value={networkForm.formData.wifiNetworkName || ''}
              onChange={(e) => networkForm.updateField('wifiNetworkName', e.target.value)}
              placeholder={t('access.fields.wifiNetworkNamePlaceholder')}
            />
            <Input
              label={t('access.fields.wifiCredentialsLocation')}
              value={networkForm.formData.wifiCredentialsLocation || ''}
              onChange={(e) => networkForm.updateField('wifiCredentialsLocation', e.target.value)}
              placeholder={t('access.fields.wifiCredentialsLocationPlaceholder')}
            />
            <Input
              label={t('access.fields.adminPanelUrl')}
              value={networkForm.formData.adminPanelUrl || ''}
              onChange={(e) => networkForm.updateField('adminPanelUrl', e.target.value)}
              placeholder={t('access.fields.adminPanelUrlPlaceholder')}
            />
            <Input
              label={t('access.fields.adminCredentialsLocation')}
              value={networkForm.formData.adminCredentialsLocation || ''}
              onChange={(e) => networkForm.updateField('adminCredentialsLocation', e.target.value)}
              placeholder={t('access.fields.adminCredentialsLocationPlaceholder')}
            />
            <TextArea
              label={t('access.fields.restartProcedures')}
              value={networkForm.formData.restartProcedures || ''}
              onChange={(e) => networkForm.updateField('restartProcedures', e.target.value)}
              placeholder={t('access.fields.restartProceduresPlaceholder')}
            />
            <Input
              label={t('access.fields.technicalSupportContact')}
              value={networkForm.formData.technicalSupportContact || ''}
              onChange={(e) => networkForm.updateField('technicalSupportContact', e.target.value)}
              placeholder={t('access.fields.technicalSupportContactPlaceholder')}
            />
            <TextArea
              label={t('contacts.notes')}
              value={networkForm.formData.notes || ''}
              onChange={(e) => networkForm.updateField('notes', e.target.value)}
              placeholder={t('access.fields.additionalInformation')}
            />
          </div>
        </Modal>

        <Modal
          isOpen={iotForm.isModalOpen}
          onClose={iotForm.closeModal}
          title={iotForm.editingItem ? t('access.modals.editIoT') : t('access.modals.addIoT')}
          footer={
            <>
              <Button variant="secondary" onClick={iotForm.closeModal}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleSaveIoT} disabled={!iotForm.formData.name?.trim()}>
                {t('common.save')}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input
              label={t('access.fields.deviceName')}
              value={iotForm.formData.name || ''}
              onChange={(e) => iotForm.updateField('name', e.target.value)}
              placeholder={t('access.fields.deviceNamePlaceholder')}
              required
            />
            <Input
              label={t('access.fields.deviceType')}
              value={iotForm.formData.deviceType || ''}
              onChange={(e) => iotForm.updateField('deviceType', e.target.value)}
              placeholder={t('access.fields.deviceTypePlaceholder')}
            />
            <Input
              label={t('access.fields.hubController')}
              value={iotForm.formData.hubController || ''}
              onChange={(e) => iotForm.updateField('hubController', e.target.value)}
              placeholder={t('access.fields.hubControllerPlaceholder')}
            />
            <Input
              label={t('access.fields.credentialsLocation')}
              value={iotForm.formData.credentialsLocation || ''}
              onChange={(e) => iotForm.updateField('credentialsLocation', e.target.value)}
              placeholder={t('access.fields.credentialsLocationPlaceholder')}
            />
            <TextArea
              label={t('access.fields.recipientDisposition')}
              value={iotForm.formData.recipientDisposition || ''}
              onChange={(e) => iotForm.updateField('recipientDisposition', e.target.value)}
              placeholder={t('access.fields.recipientDispositionPlaceholder')}
            />
            <TextArea
              label={t('contacts.notes')}
              value={iotForm.formData.notes || ''}
              onChange={(e) => iotForm.updateField('notes', e.target.value)}
              placeholder={t('access.fields.additionalSetupDetails')}
            />
          </div>
        </Modal>
      </div>
      )}
    </AppLayout>
  );
}
