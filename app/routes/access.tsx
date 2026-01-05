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
import type { PrimaryEmail, Device, NetworkInfrastructure, IoTDevice } from '~/types';
import { Edit2, Trash2 } from 'lucide-react';

export default function Access() {
  const { plan } = useSession();
  const { updatePlan } = usePlanUpdater();

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
    await updatePlan(updatedPlan, emailForm.editingItem ? 'Email updated successfully' : 'Email added successfully');
    emailForm.closeModal();
  };

  const handleDeleteEmail = async (id: string) => {
    if (!plan || !confirm('Delete this email account?')) return;

    const updatedEmails = plan.access.primaryEmails.filter(e => e.id !== id);
    const updatedPlan = { ...plan, access: { ...plan.access, primaryEmails: updatedEmails } };
    await updatePlan(updatedPlan, 'Email deleted successfully');
  };

  const handleSaveDevice = async () => {
    if (!plan || !deviceForm.formData.name) return;

    const updatedDevices = deviceForm.editingItem
      ? plan.access.devices.map(d => d.id === deviceForm.editingItem!.id ? { ...deviceForm.formData, id: d.id } as Device : d)
      : [...plan.access.devices, { ...deviceForm.formData, id: crypto.randomUUID() } as Device];

    const updatedPlan = { ...plan, access: { ...plan.access, devices: updatedDevices } };
    await updatePlan(updatedPlan, deviceForm.editingItem ? 'Device updated successfully' : 'Device added successfully');
    deviceForm.closeModal();
  };

  const handleDeleteDevice = async (id: string) => {
    if (!plan || !confirm('Delete this device?')) return;

    const updatedDevices = plan.access.devices.filter(d => d.id !== id);
    const updatedPlan = { ...plan, access: { ...plan.access, devices: updatedDevices } };
    await updatePlan(updatedPlan, 'Device deleted successfully');
  };

  const handleUpdateNotes = async (field: 'passwordManagerNotes' | 'twoFANotes', value: string) => {
    if (!plan) return;

    const updatedPlan = { ...plan, access: { ...plan.access, [field]: value } };
    await updatePlan(updatedPlan, 'Notes updated successfully');
  };

  const handleSaveNetwork = async () => {
    if (!plan || !networkForm.formData.routerModemModel) return;

    const updatedNetwork = networkForm.editingItem
      ? plan.access.networkInfrastructure.map(n => n.id === networkForm.editingItem!.id ? { ...networkForm.formData, id: n.id } as NetworkInfrastructure : n)
      : [...plan.access.networkInfrastructure, { ...networkForm.formData, id: crypto.randomUUID() } as NetworkInfrastructure];

    const updatedPlan = { ...plan, access: { ...plan.access, networkInfrastructure: updatedNetwork } };
    await updatePlan(updatedPlan, networkForm.editingItem ? 'Network infrastructure updated successfully' : 'Network infrastructure added successfully');
    networkForm.closeModal();
  };

  const handleDeleteNetwork = async (id: string) => {
    if (!plan || !confirm('Delete this network infrastructure item?')) return;

    const updatedNetwork = plan.access.networkInfrastructure.filter(n => n.id !== id);
    const updatedPlan = { ...plan, access: { ...plan.access, networkInfrastructure: updatedNetwork } };
    await updatePlan(updatedPlan, 'Network infrastructure deleted successfully');
  };

  const handleSaveIoT = async () => {
    if (!plan || !iotForm.formData.name) return;

    const updatedIoT = iotForm.editingItem
      ? plan.access.iotDevices.map(i => i.id === iotForm.editingItem!.id ? { ...iotForm.formData, id: i.id } as IoTDevice : i)
      : [...plan.access.iotDevices, { ...iotForm.formData, id: crypto.randomUUID() } as IoTDevice];

    const updatedPlan = { ...plan, access: { ...plan.access, iotDevices: updatedIoT } };
    await updatePlan(updatedPlan, iotForm.editingItem ? 'IoT device updated successfully' : 'IoT device added successfully');
    iotForm.closeModal();
  };

  const handleDeleteIoT = async (id: string) => {
    if (!plan || !confirm('Delete this IoT device?')) return;

    const updatedIoT = plan.access.iotDevices.filter(i => i.id !== id);
    const updatedPlan = { ...plan, access: { ...plan.access, iotDevices: updatedIoT } };
    await updatePlan(updatedPlan, 'IoT device deleted successfully');
  };

  return (
    <AppLayout>
      {plan && (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Access Information</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Document where to find passwords and how to access accounts
          </p>
        </div>

        <WarningBanner type="warning">
          <strong>Security Notice:</strong> Avoid storing master passwords, PINs, or safe combinations here. Instead, note WHERE they can be found (e.g., "Master password stored in KeePass vault on desktop").
        </WarningBanner>

        <Card title="Primary Email Accounts" action={<Button onClick={() => emailForm.openModal()}>Add Email</Button>}>
          <div className="space-y-3">
            {plan.access.primaryEmails.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No email accounts added yet</p>
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

        <Card title="Password Manager">
          <TextArea
            label="Location and Access Instructions"
            value={plan.access.passwordManagerNotes}
            onChange={(e) => handleUpdateNotes('passwordManagerNotes', e.target.value)}
            placeholder="e.g., KeePass vault on desktop computer. Key file on USB drive in safe. Master password with attorney."
            rows={4}
            helpText="Describe where your password manager is and how to access it"
          />
        </Card>

        <Card title="Two-Factor Authentication (2FA)">
          <TextArea
            label="Recovery Information"
            value={plan.access.twoFANotes}
            onChange={(e) => handleUpdateNotes('twoFANotes', e.target.value)}
            placeholder="e.g., 2FA recovery codes in password manager. Authenticator app backup on secondary phone. SMS fallback to +1234567890."
            rows={4}
            helpText="Explain how to recover 2FA codes or access accounts with 2FA"
          />
        </Card>

        <Card title="Network Infrastructure" action={<Button onClick={() => networkForm.openModal()}>Add Infrastructure</Button>}>
          <p className="text-sm text-gray-600 mb-4">
            Router, modem, WiFi, and network access information
          </p>
          <div className="space-y-3">
            {plan.access.networkInfrastructure.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No network infrastructure added yet</p>
            ) : (
              plan.access.networkInfrastructure.map(network => (
                <div key={network.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{network.routerModemModel}</div>
                    <div className="text-sm text-gray-600">WiFi: {network.wifiNetworkName || 'Not specified'}</div>
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

        <Card title="IoT & Smart Home Devices" action={<Button onClick={() => iotForm.openModal()}>Add Device</Button>}>
          <p className="text-sm text-gray-600 mb-4">
            Smart home devices, hubs, and IoT equipment that may need special handling
          </p>
          <div className="space-y-3">
            {plan.access.iotDevices.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No IoT devices added yet</p>
            ) : (
              plan.access.iotDevices.map(device => (
                <div key={device.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{device.name}</div>
                    <div className="text-sm text-gray-600">{device.deviceType}</div>
                    {device.recipientDisposition && <div className="text-sm text-gray-500 mt-1">Disposition: {device.recipientDisposition}</div>}
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

        <Card title="Device Retention" action={<Button onClick={() => deviceForm.openModal()}>Add Device</Button>}>
          <p className="text-sm text-gray-600 mb-4">
            Important devices to keep and for how long (phones, laptops, tablets with saved passwords or 2FA apps)
          </p>
          <div className="space-y-3">
            {plan.access.devices.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No devices added yet</p>
            ) : (
              plan.access.devices.map(device => (
                <div key={device.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{device.name}</div>
                    <div className="text-sm text-gray-600">{device.type}</div>
                    {device.intendedRecipient && <div className="text-sm text-gray-600 mt-1">Recipient: {device.intendedRecipient}</div>}
                    {device.requiresDataWipe && <div className="text-sm text-orange-600 mt-1">⚠️ Requires data wipe</div>}
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
          title={emailForm.editingItem ? 'Edit Email' : 'Add Email'}
          footer={
            <>
              <Button variant="secondary" onClick={emailForm.closeModal}>
                Cancel
              </Button>
              <Button onClick={handleSaveEmail} disabled={!emailForm.formData.email?.trim()}>
                Save
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={emailForm.formData.email || ''}
              onChange={(e) => emailForm.updateField('email', e.target.value)}
              required
            />
            <Input
              label="Provider"
              value={emailForm.formData.provider || ''}
              onChange={(e) => emailForm.updateField('provider', e.target.value)}
              placeholder="e.g., Gmail, Outlook"
            />
            <TextArea
              label="Notes"
              value={emailForm.formData.notes || ''}
              onChange={(e) => emailForm.updateField('notes', e.target.value)}
              placeholder="Recovery email, special instructions..."
            />
          </div>
        </Modal>

        <Modal
          isOpen={deviceForm.isModalOpen}
          onClose={deviceForm.closeModal}
          title={deviceForm.editingItem ? 'Edit Device' : 'Add Device'}
          footer={
            <>
              <Button variant="secondary" onClick={deviceForm.closeModal}>
                Cancel
              </Button>
              <Button onClick={handleSaveDevice} disabled={!deviceForm.formData.name?.trim()}>
                Save
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input
              label="Device Name"
              value={deviceForm.formData.name || ''}
              onChange={(e) => deviceForm.updateField('name', e.target.value)}
              placeholder="e.g., iPhone 13, MacBook Pro"
              required
            />
            <Input
              label="Type"
              value={deviceForm.formData.type || ''}
              onChange={(e) => deviceForm.updateField('type', e.target.value)}
              placeholder="Phone, Laptop, Tablet"
            />
            <Input
              label="Intended Recipient"
              value={deviceForm.formData.intendedRecipient || ''}
              onChange={(e) => deviceForm.updateField('intendedRecipient', e.target.value)}
              placeholder="e.g., John Smith, Donate to charity"
            />
            <TextArea
              label="Disposal Instructions"
              value={deviceForm.formData.disposalInstructions || ''}
              onChange={(e) => deviceForm.updateField('disposalInstructions', e.target.value)}
              placeholder="Special handling instructions for disposing or transferring this device"
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
                Requires data wipe before disposal
                <span className="block text-xs text-gray-500 mt-1">Check if this device should be securely wiped before transfer or disposal</span>
              </label>
            </div>
            <TextArea
              label="Retention Notes"
              value={deviceForm.formData.retentionNotes || ''}
              onChange={(e) => deviceForm.updateField('retentionNotes', e.target.value)}
              placeholder="e.g., Keep for at least 1 year - has authenticator app with 2FA codes"
            />
          </div>
        </Modal>

        <Modal
          isOpen={networkForm.isModalOpen}
          onClose={networkForm.closeModal}
          title={networkForm.editingItem ? 'Edit Network Infrastructure' : 'Add Network Infrastructure'}
          footer={
            <>
              <Button variant="secondary" onClick={networkForm.closeModal}>
                Cancel
              </Button>
              <Button onClick={handleSaveNetwork} disabled={!networkForm.formData.routerModemModel?.trim()}>
                Save
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input
              label="Router/Modem Model"
              value={networkForm.formData.routerModemModel || ''}
              onChange={(e) => networkForm.updateField('routerModemModel', e.target.value)}
              placeholder="e.g., Netgear Nighthawk R7000"
              required
            />
            <Input
              label="WiFi Network Name"
              value={networkForm.formData.wifiNetworkName || ''}
              onChange={(e) => networkForm.updateField('wifiNetworkName', e.target.value)}
              placeholder="Network SSID"
            />
            <Input
              label="WiFi Credentials Location"
              value={networkForm.formData.wifiCredentialsLocation || ''}
              onChange={(e) => networkForm.updateField('wifiCredentialsLocation', e.target.value)}
              placeholder="Where password is stored"
            />
            <Input
              label="Admin Panel URL"
              value={networkForm.formData.adminPanelUrl || ''}
              onChange={(e) => networkForm.updateField('adminPanelUrl', e.target.value)}
              placeholder="e.g., 192.168.1.1 or http://routerlogin.net"
            />
            <Input
              label="Admin Credentials Location"
              value={networkForm.formData.adminCredentialsLocation || ''}
              onChange={(e) => networkForm.updateField('adminCredentialsLocation', e.target.value)}
              placeholder="Where admin login is stored"
            />
            <TextArea
              label="Restart Procedures"
              value={networkForm.formData.restartProcedures || ''}
              onChange={(e) => networkForm.updateField('restartProcedures', e.target.value)}
              placeholder="Steps to restart or reset the network equipment"
            />
            <Input
              label="Technical Support Contact"
              value={networkForm.formData.technicalSupportContact || ''}
              onChange={(e) => networkForm.updateField('technicalSupportContact', e.target.value)}
              placeholder="ISP support phone number"
            />
            <TextArea
              label="Notes"
              value={networkForm.formData.notes || ''}
              onChange={(e) => networkForm.updateField('notes', e.target.value)}
              placeholder="Additional information"
            />
          </div>
        </Modal>

        <Modal
          isOpen={iotForm.isModalOpen}
          onClose={iotForm.closeModal}
          title={iotForm.editingItem ? 'Edit IoT Device' : 'Add IoT Device'}
          footer={
            <>
              <Button variant="secondary" onClick={iotForm.closeModal}>
                Cancel
              </Button>
              <Button onClick={handleSaveIoT} disabled={!iotForm.formData.name?.trim()}>
                Save
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input
              label="Device Name"
              value={iotForm.formData.name || ''}
              onChange={(e) => iotForm.updateField('name', e.target.value)}
              placeholder="e.g., Living Room Thermostat"
              required
            />
            <Input
              label="Device Type"
              value={iotForm.formData.deviceType || ''}
              onChange={(e) => iotForm.updateField('deviceType', e.target.value)}
              placeholder="e.g., Smart Thermostat, Security Camera"
            />
            <Input
              label="Hub/Controller"
              value={iotForm.formData.hubController || ''}
              onChange={(e) => iotForm.updateField('hubController', e.target.value)}
              placeholder="e.g., SmartThings Hub, Amazon Echo"
            />
            <Input
              label="Credentials Location"
              value={iotForm.formData.credentialsLocation || ''}
              onChange={(e) => iotForm.updateField('credentialsLocation', e.target.value)}
              placeholder="Where account/app credentials are stored"
            />
            <TextArea
              label="Recipient/Disposition"
              value={iotForm.formData.recipientDisposition || ''}
              onChange={(e) => iotForm.updateField('recipientDisposition', e.target.value)}
              placeholder="Who should receive this device or how to dispose of it"
            />
            <TextArea
              label="Notes"
              value={iotForm.formData.notes || ''}
              onChange={(e) => iotForm.updateField('notes', e.target.value)}
              placeholder="Additional setup or configuration details"
            />
          </div>
        </Modal>
      </div>
      )}
    </AppLayout>
  );
}
