import { AppLayout } from '~/components/AppLayout';
import { Card } from '~/components/Card';
import { Button } from '~/components/Button';
import { Modal } from '~/components/Modal';
import { Input } from '~/components/Input';
import { TextArea } from '~/components/TextArea';
import { Select } from '~/components/Select';
import { useSession } from '~/lib/session-context';
import { useModalForm } from '~/hooks/useModalForm';
import { usePlanUpdater } from '~/hooks/usePlanUpdater';
import type { Subscription, CloudService, Domain, HostingAccount, AccountStatus, SocialMediaAccount, SocialMediaDisposition } from '~/types';
import { Edit2, Trash2 } from 'lucide-react';

export default function Accounts() {
  const { plan } = useSession();
  const { updatePlan } = usePlanUpdater();

  const subForm = useModalForm<Partial<Subscription>>({ name: '', type: '', status: 'review', notes: '', autoPayEnabled: false, contractEndDate: '', cancellationNoticeDays: 0, paymentMethod: '' });
  const cloudForm = useModalForm<Partial<CloudService>>({ name: '', provider: '', status: 'review', billingWarning: false, notes: '', autoPayEnabled: false });
  const domainForm = useModalForm<Partial<Domain>>({ name: '', registrar: '', expirationDate: '', notes: '' });
  const hostingForm = useModalForm<Partial<HostingAccount>>({ provider: '', accountName: '', renewalDate: '', notes: '' });
  const socialForm = useModalForm<Partial<SocialMediaAccount>>({ platform: '', username: '', disposition: 'keep', exportInstructions: '', notes: '' });

  const handleSaveSubscription = async () => {
    if (!plan || !subForm.formData.name) return;

    const updated = subForm.editingItem
      ? plan.accounts.subscriptions.map(s => s.id === subForm.editingItem!.id ? { ...subForm.formData, id: s.id } as Subscription : s)
      : [...plan.accounts.subscriptions, { ...subForm.formData, id: crypto.randomUUID() } as Subscription];

    const updatedPlan = { ...plan, accounts: { ...plan.accounts, subscriptions: updated } };
    await updatePlan(updatedPlan, subForm.editingItem ? 'Subscription updated' : 'Subscription added');
    subForm.closeModal();
  };

  const handleSaveCloud = async () => {
    if (!plan || !cloudForm.formData.name) return;

    const updated = cloudForm.editingItem
      ? plan.accounts.cloudServices.map(c => c.id === cloudForm.editingItem!.id ? { ...cloudForm.formData, id: c.id } as CloudService : c)
      : [...plan.accounts.cloudServices, { ...cloudForm.formData, id: crypto.randomUUID() } as CloudService];

    const updatedPlan = { ...plan, accounts: { ...plan.accounts, cloudServices: updated } };
    await updatePlan(updatedPlan, cloudForm.editingItem ? 'Cloud service updated' : 'Cloud service added');
    cloudForm.closeModal();
  };

  const handleSaveDomain = async () => {
    if (!plan || !domainForm.formData.name) return;

    const updated = domainForm.editingItem
      ? plan.accounts.domains.map(d => d.id === domainForm.editingItem!.id ? { ...domainForm.formData, id: d.id } as Domain : d)
      : [...plan.accounts.domains, { ...domainForm.formData, id: crypto.randomUUID() } as Domain];

    const updatedPlan = { ...plan, accounts: { ...plan.accounts, domains: updated } };
    await updatePlan(updatedPlan, domainForm.editingItem ? 'Domain updated' : 'Domain added');
    domainForm.closeModal();
  };

  const handleSaveHosting = async () => {
    if (!plan || !hostingForm.formData.provider) return;

    const updated = hostingForm.editingItem
      ? plan.accounts.hosting.map(h => h.id === hostingForm.editingItem!.id ? { ...hostingForm.formData, id: h.id } as HostingAccount : h)
      : [...plan.accounts.hosting, { ...hostingForm.formData, id: crypto.randomUUID() } as HostingAccount];

    const updatedPlan = { ...plan, accounts: { ...plan.accounts, hosting: updated } };
    await updatePlan(updatedPlan, hostingForm.editingItem ? 'Hosting updated' : 'Hosting added');
    hostingForm.closeModal();
  };

  const handleSaveSocial = async () => {
    if (!plan || !socialForm.formData.platform) return;

    const updated = socialForm.editingItem
      ? plan.accounts.socialMedia.map(s => s.id === socialForm.editingItem!.id ? { ...socialForm.formData, id: s.id } as SocialMediaAccount : s)
      : [...plan.accounts.socialMedia, { ...socialForm.formData, id: crypto.randomUUID() } as SocialMediaAccount];

    const updatedPlan = { ...plan, accounts: { ...plan.accounts, socialMedia: updated } };
    await updatePlan(updatedPlan, socialForm.editingItem ? 'Social media account updated' : 'Social media account added');
    socialForm.closeModal();
  };

  const handleDelete = async (type: 'subscription' | 'cloud' | 'domain' | 'hosting' | 'social', id: string) => {
    if (!plan || !confirm('Delete this item?')) return;

    const updates: any = { ...plan.accounts };
    if (type === 'subscription') updates.subscriptions = plan.accounts.subscriptions.filter(s => s.id !== id);
    if (type === 'cloud') updates.cloudServices = plan.accounts.cloudServices.filter(c => c.id !== id);
    if (type === 'domain') updates.domains = plan.accounts.domains.filter(d => d.id !== id);
    if (type === 'hosting') updates.hosting = plan.accounts.hosting.filter(h => h.id !== id);
    if (type === 'social') updates.socialMedia = plan.accounts.socialMedia.filter(s => s.id !== id);

    const updatedPlan = { ...plan, accounts: updates };
    await updatePlan(updatedPlan, 'Item deleted');
  };

  const statusOptions = [
    { value: 'keep', label: 'Keep' },
    { value: 'cancel', label: 'Cancel' },
    { value: 'review', label: 'Review' },
  ];

  const dispositionOptions = [
    { value: 'keep', label: 'Keep Active' },
    { value: 'close', label: 'Close Account' },
    { value: 'export_first', label: 'Export Data First, Then Close' },
    { value: 'memorialize', label: 'Memorialize' },
  ];

  return (
    <AppLayout>
      {plan && (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Accounts</h1>
          <p className="text-sm sm:text-base text-gray-600">Track subscriptions, cloud services, domains, and hosting</p>
        </div>

        <Card title="Subscriptions" action={<Button onClick={() => subForm.openModal()}>Add</Button>}>
          <div className="space-y-3">
            {plan.accounts.subscriptions.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No subscriptions added</p>
            ) : (
              plan.accounts.subscriptions.map(sub => (
                <div key={sub.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{sub.name}</div>
                    <div className="text-sm text-gray-600">{sub.type}</div>
                    {sub.notes && <div className="text-sm text-gray-500 mt-1">{sub.notes}</div>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 text-xs rounded ${sub.status === 'keep' ? 'bg-green-100 text-green-700' : sub.status === 'cancel' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {sub.status}
                    </span>
                    <button onClick={() => subForm.openModal(sub)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete('subscription', sub.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card title="Cloud Services" action={<Button onClick={() => cloudForm.openModal()}>Add</Button>}>
          <p className="text-sm text-gray-600 mb-4">Services that could result in unexpected charges (AWS, Azure, cloud storage, etc.)</p>
          <div className="space-y-3">
            {plan.accounts.cloudServices.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No cloud services added</p>
            ) : (
              plan.accounts.cloudServices.map(cloud => (
                <div key={cloud.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-gray-900">{cloud.name}</div>
                      {cloud.billingWarning && <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">High Bill Risk</span>}
                    </div>
                    <div className="text-sm text-gray-600">{cloud.provider}</div>
                    {cloud.notes && <div className="text-sm text-gray-500 mt-1">{cloud.notes}</div>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 text-xs rounded ${cloud.status === 'keep' ? 'bg-green-100 text-green-700' : cloud.status === 'cancel' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {cloud.status}
                    </span>
                    <button onClick={() => cloudForm.openModal(cloud)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete('cloud', cloud.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card title="Domains" action={<Button onClick={() => domainForm.openModal()}>Add</Button>}>
          <div className="space-y-3">
            {plan.accounts.domains.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No domains added</p>
            ) : (
              plan.accounts.domains.map(domain => (
                <div key={domain.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{domain.name}</div>
                    <div className="text-sm text-gray-600">{domain.registrar}</div>
                    {domain.expirationDate && <div className="text-sm text-gray-500 mt-1">Expires: {domain.expirationDate}</div>}
                    {domain.notes && <div className="text-sm text-gray-500 mt-1">{domain.notes}</div>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => domainForm.openModal(domain)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete('domain', domain.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card title="Hosting" action={<Button onClick={() => hostingForm.openModal()}>Add</Button>}>
          <div className="space-y-3">
            {plan.accounts.hosting.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No hosting accounts added</p>
            ) : (
              plan.accounts.hosting.map(hosting => (
                <div key={hosting.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{hosting.provider}</div>
                    <div className="text-sm text-gray-600">{hosting.accountName}</div>
                    {hosting.renewalDate && <div className="text-sm text-gray-500 mt-1">Renews: {hosting.renewalDate}</div>}
                    {hosting.notes && <div className="text-sm text-gray-500 mt-1">{hosting.notes}</div>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => hostingForm.openModal(hosting)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete('hosting', hosting.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card title="Social Media Accounts" action={<Button onClick={() => socialForm.openModal()}>Add</Button>}>
          <p className="text-sm text-gray-600 mb-4">
            Document how you want social media accounts handled
          </p>
          <div className="space-y-3">
            {plan.accounts.socialMedia.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No social media accounts added</p>
            ) : (
              plan.accounts.socialMedia.map(social => (
                <div key={social.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{social.platform}</div>
                    <div className="text-sm text-gray-600">@{social.username}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      Disposition: {social.disposition === 'keep' ? 'Keep Active' : social.disposition === 'close' ? 'Close' : social.disposition === 'export_first' ? 'Export First' : 'Memorialize'}
                    </div>
                    {social.notes && <div className="text-sm text-gray-500 mt-1">{social.notes}</div>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => socialForm.openModal(social)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete('social', social.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Modal isOpen={subForm.isModalOpen} onClose={subForm.closeModal} title={subForm.editingItem ? 'Edit Subscription' : 'Add Subscription'} footer={<><Button variant="secondary" onClick={subForm.closeModal}>Cancel</Button><Button onClick={handleSaveSubscription} disabled={!subForm.formData.name?.trim()}>Save</Button></>}>
          <div className="space-y-4">
            <Input label="Name" value={subForm.formData.name || ''} onChange={(e) => subForm.updateField('name', e.target.value)} required />
            <Input label="Type" value={subForm.formData.type || ''} onChange={(e) => subForm.updateField('type', e.target.value)} placeholder="e.g., Streaming, Software, Magazine" />
            <Select label="Status" value={subForm.formData.status || 'review'} onChange={(e) => subForm.updateField('status', e.target.value as AccountStatus)} options={statusOptions} />
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={subForm.formData.autoPayEnabled || false} onChange={(e) => subForm.updateField('autoPayEnabled', e.target.checked)} className="rounded border-gray-300" />
              <span className="text-sm text-gray-700">Auto-pay enabled</span>
            </label>
            <Input label="Contract End Date" type="date" value={subForm.formData.contractEndDate || ''} onChange={(e) => subForm.updateField('contractEndDate', e.target.value)} />
            <Input label="Cancellation Notice Period (days)" type="number" value={subForm.formData.cancellationNoticeDays?.toString() || ''} onChange={(e) => subForm.updateField('cancellationNoticeDays', parseInt(e.target.value) || 0)} placeholder="e.g., 30" />
            <Input label="Payment Method" value={subForm.formData.paymentMethod || ''} onChange={(e) => subForm.updateField('paymentMethod', e.target.value)} placeholder="e.g., Credit card ending in 1234" />
            <TextArea label="Notes" value={subForm.formData.notes || ''} onChange={(e) => subForm.updateField('notes', e.target.value)} />
          </div>
        </Modal>

        <Modal isOpen={cloudForm.isModalOpen} onClose={cloudForm.closeModal} title={cloudForm.editingItem ? 'Edit Cloud Service' : 'Add Cloud Service'} footer={<><Button variant="secondary" onClick={cloudForm.closeModal}>Cancel</Button><Button onClick={handleSaveCloud} disabled={!cloudForm.formData.name?.trim()}>Save</Button></>}>
          <div className="space-y-4">
            <Input label="Name" value={cloudForm.formData.name || ''} onChange={(e) => cloudForm.updateField('name', e.target.value)} required />
            <Input label="Provider" value={cloudForm.formData.provider || ''} onChange={(e) => cloudForm.updateField('provider', e.target.value)} placeholder="e.g., AWS, Azure, Google Cloud" />
            <Select label="Status" value={cloudForm.formData.status || 'review'} onChange={(e) => cloudForm.updateField('status', e.target.value as AccountStatus)} options={statusOptions} />
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={cloudForm.formData.autoPayEnabled || false} onChange={(e) => cloudForm.updateField('autoPayEnabled', e.target.checked)} className="rounded border-gray-300" />
              <span className="text-sm text-gray-700">Auto-pay enabled</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={cloudForm.formData.billingWarning || false} onChange={(e) => cloudForm.updateField('billingWarning', e.target.checked)} className="rounded border-gray-300" />
              <span className="text-sm text-gray-700">High billing risk</span>
            </label>
            <TextArea label="Notes" value={cloudForm.formData.notes || ''} onChange={(e) => cloudForm.updateField('notes', e.target.value)} />
          </div>
        </Modal>

        <Modal isOpen={domainForm.isModalOpen} onClose={domainForm.closeModal} title={domainForm.editingItem ? 'Edit Domain' : 'Add Domain'} footer={<><Button variant="secondary" onClick={domainForm.closeModal}>Cancel</Button><Button onClick={handleSaveDomain} disabled={!domainForm.formData.name?.trim()}>Save</Button></>}>
          <div className="space-y-4">
            <Input label="Domain Name" value={domainForm.formData.name || ''} onChange={(e) => domainForm.updateField('name', e.target.value)} required />
            <Input label="Registrar" value={domainForm.formData.registrar || ''} onChange={(e) => domainForm.updateField('registrar', e.target.value)} />
            <Input label="Expiration Date" type="date" value={domainForm.formData.expirationDate || ''} onChange={(e) => domainForm.updateField('expirationDate', e.target.value)} />
            <TextArea label="Notes" value={domainForm.formData.notes || ''} onChange={(e) => domainForm.updateField('notes', e.target.value)} />
          </div>
        </Modal>

        <Modal isOpen={hostingForm.isModalOpen} onClose={hostingForm.closeModal} title={hostingForm.editingItem ? 'Edit Hosting' : 'Add Hosting'} footer={<><Button variant="secondary" onClick={hostingForm.closeModal}>Cancel</Button><Button onClick={handleSaveHosting} disabled={!hostingForm.formData.provider?.trim()}>Save</Button></>}>
          <div className="space-y-4">
            <Input label="Provider" value={hostingForm.formData.provider || ''} onChange={(e) => hostingForm.updateField('provider', e.target.value)} required />
            <Input label="Account Name" value={hostingForm.formData.accountName || ''} onChange={(e) => hostingForm.updateField('accountName', e.target.value)} />
            <Input label="Renewal Date" type="date" value={hostingForm.formData.renewalDate || ''} onChange={(e) => hostingForm.updateField('renewalDate', e.target.value)} />
            <TextArea label="Notes" value={hostingForm.formData.notes || ''} onChange={(e) => hostingForm.updateField('notes', e.target.value)} />
          </div>
        </Modal>

        <Modal isOpen={socialForm.isModalOpen} onClose={socialForm.closeModal} title={socialForm.editingItem ? 'Edit Social Media Account' : 'Add Social Media Account'} footer={<><Button variant="secondary" onClick={socialForm.closeModal}>Cancel</Button><Button onClick={handleSaveSocial} disabled={!socialForm.formData.platform?.trim()}>Save</Button></>}>
          <div className="space-y-4">
            <Input label="Platform" value={socialForm.formData.platform || ''} onChange={(e) => socialForm.updateField('platform', e.target.value)} placeholder="e.g., Facebook, Twitter, Instagram" required />
            <Input label="Username/Handle" value={socialForm.formData.username || ''} onChange={(e) => socialForm.updateField('username', e.target.value)} placeholder="Without @ symbol" />
            <Select label="Disposition" value={socialForm.formData.disposition || 'keep'} onChange={(e) => socialForm.updateField('disposition', e.target.value as SocialMediaDisposition)} options={dispositionOptions} />
            <TextArea label="Export Instructions" value={socialForm.formData.exportInstructions || ''} onChange={(e) => socialForm.updateField('exportInstructions', e.target.value)} placeholder="If exporting data, explain how to do it" rows={3} />
            <TextArea label="Notes" value={socialForm.formData.notes || ''} onChange={(e) => socialForm.updateField('notes', e.target.value)} />
          </div>
        </Modal>
      </div>
      )}
    </AppLayout>
  );
}
