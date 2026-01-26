import { AppLayout } from '~/components/AppLayout';
import { Card } from '~/components/Card';
import { Button } from '~/components/Button';
import { Modal } from '~/components/Modal';
import { Input } from '~/components/Input';
import { TextArea } from '~/components/TextArea';
import { Select } from '~/components/Select';
import { useSession } from '~/lib/session-context';
import { useLanguage } from '~/lib/language-context';
import { useModalForm } from '~/hooks/useModalForm';
import { usePlanUpdater } from '~/hooks/usePlanUpdater';
import type { Subscription, CloudService, Domain, HostingAccount, AccountStatus, SocialMediaAccount, SocialMediaDisposition } from '~/types';
import { Edit2, Trash2 } from 'lucide-react';

export default function Accounts() {
  const { plan } = useSession();
  const { t } = useLanguage();
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
    await updatePlan(updatedPlan, subForm.editingItem ? t('accounts.subscriptionUpdated') : t('accounts.subscriptionAdded'));
    subForm.closeModal();
  };

  const handleSaveCloud = async () => {
    if (!plan || !cloudForm.formData.name) return;

    const updated = cloudForm.editingItem
      ? plan.accounts.cloudServices.map(c => c.id === cloudForm.editingItem!.id ? { ...cloudForm.formData, id: c.id } as CloudService : c)
      : [...plan.accounts.cloudServices, { ...cloudForm.formData, id: crypto.randomUUID() } as CloudService];

    const updatedPlan = { ...plan, accounts: { ...plan.accounts, cloudServices: updated } };
    await updatePlan(updatedPlan, cloudForm.editingItem ? t('accounts.cloudServiceUpdated') : t('accounts.cloudServiceAdded'));
    cloudForm.closeModal();
  };

  const handleSaveDomain = async () => {
    if (!plan || !domainForm.formData.name) return;

    const updated = domainForm.editingItem
      ? plan.accounts.domains.map(d => d.id === domainForm.editingItem!.id ? { ...domainForm.formData, id: d.id } as Domain : d)
      : [...plan.accounts.domains, { ...domainForm.formData, id: crypto.randomUUID() } as Domain];

    const updatedPlan = { ...plan, accounts: { ...plan.accounts, domains: updated } };
    await updatePlan(updatedPlan, domainForm.editingItem ? t('accounts.domainUpdated') : t('accounts.domainAdded'));
    domainForm.closeModal();
  };

  const handleSaveHosting = async () => {
    if (!plan || !hostingForm.formData.provider) return;

    const updated = hostingForm.editingItem
      ? plan.accounts.hosting.map(h => h.id === hostingForm.editingItem!.id ? { ...hostingForm.formData, id: h.id } as HostingAccount : h)
      : [...plan.accounts.hosting, { ...hostingForm.formData, id: crypto.randomUUID() } as HostingAccount];

    const updatedPlan = { ...plan, accounts: { ...plan.accounts, hosting: updated } };
    await updatePlan(updatedPlan, hostingForm.editingItem ? t('accounts.hostingUpdated') : t('accounts.hostingAdded'));
    hostingForm.closeModal();
  };

  const handleSaveSocial = async () => {
    if (!plan || !socialForm.formData.platform) return;

    const updated = socialForm.editingItem
      ? plan.accounts.socialMedia.map(s => s.id === socialForm.editingItem!.id ? { ...socialForm.formData, id: s.id } as SocialMediaAccount : s)
      : [...plan.accounts.socialMedia, { ...socialForm.formData, id: crypto.randomUUID() } as SocialMediaAccount];

    const updatedPlan = { ...plan, accounts: { ...plan.accounts, socialMedia: updated } };
    await updatePlan(updatedPlan, socialForm.editingItem ? t('accounts.socialMediaUpdated') : t('accounts.socialMediaAdded'));
    socialForm.closeModal();
  };

  const handleDelete = async (type: 'subscription' | 'cloud' | 'domain' | 'hosting' | 'social', id: string) => {
    if (!plan || !confirm(t('accounts.deleteItem'))) return;

    const updates: any = { ...plan.accounts };
    if (type === 'subscription') updates.subscriptions = plan.accounts.subscriptions.filter(s => s.id !== id);
    if (type === 'cloud') updates.cloudServices = plan.accounts.cloudServices.filter(c => c.id !== id);
    if (type === 'domain') updates.domains = plan.accounts.domains.filter(d => d.id !== id);
    if (type === 'hosting') updates.hosting = plan.accounts.hosting.filter(h => h.id !== id);
    if (type === 'social') updates.socialMedia = plan.accounts.socialMedia.filter(s => s.id !== id);

    const updatedPlan = { ...plan, accounts: updates };
    await updatePlan(updatedPlan, t('accounts.itemDeleted'));
  };

  const statusOptions = [
    { value: 'keep', label: t('accounts.fields.statusKeep') },
    { value: 'cancel', label: t('accounts.fields.statusCancel') },
    { value: 'review', label: t('accounts.fields.statusReview') },
  ];

  const dispositionOptions = [
    { value: 'keep', label: t('accounts.fields.dispositionKeep') },
    { value: 'close', label: t('accounts.fields.dispositionClose') },
    { value: 'export_first', label: t('accounts.fields.dispositionExport') },
    { value: 'memorialize', label: t('accounts.fields.dispositionMemorialize') },
  ];

  return (
    <AppLayout>
      {plan && (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t('accounts.title')}</h1>
          <p className="text-sm sm:text-base text-gray-600">{t('accounts.description')}</p>
        </div>

        <Card title={t('accounts.subscriptions')} action={<Button onClick={() => subForm.openModal()}>{t('common.add')}</Button>}>
          <div className="space-y-3">
            {plan.accounts.subscriptions.length === 0 ? (
              <p className="text-gray-500 text-sm italic">{t('accounts.noSubscriptions')}</p>
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

        <Card title={t('accounts.cloudServices')} action={<Button onClick={() => cloudForm.openModal()}>{t('common.add')}</Button>}>
          <p className="text-sm text-gray-600 mb-4">{t('accounts.cloudServicesDescription')}</p>
          <div className="space-y-3">
            {plan.accounts.cloudServices.length === 0 ? (
              <p className="text-gray-500 text-sm italic">{t('accounts.noCloudServices')}</p>
            ) : (
              plan.accounts.cloudServices.map(cloud => (
                <div key={cloud.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-gray-900">{cloud.name}</div>
                      {cloud.billingWarning && <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">{t('accounts.fields.highBillRisk')}</span>}
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

        <Card title={t('accounts.domains')} action={<Button onClick={() => domainForm.openModal()}>{t('common.add')}</Button>}>
          <div className="space-y-3">
            {plan.accounts.domains.length === 0 ? (
              <p className="text-gray-500 text-sm italic">{t('accounts.noDomains')}</p>
            ) : (
              plan.accounts.domains.map(domain => (
                <div key={domain.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{domain.name}</div>
                    <div className="text-sm text-gray-600">{domain.registrar}</div>
                    {domain.expirationDate && <div className="text-sm text-gray-500 mt-1">{t('accounts.fields.expires')}: {domain.expirationDate}</div>}
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

        <Card title={t('accounts.hosting')} action={<Button onClick={() => hostingForm.openModal()}>{t('common.add')}</Button>}>
          <div className="space-y-3">
            {plan.accounts.hosting.length === 0 ? (
              <p className="text-gray-500 text-sm italic">{t('accounts.noHosting')}</p>
            ) : (
              plan.accounts.hosting.map(hosting => (
                <div key={hosting.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{hosting.provider}</div>
                    <div className="text-sm text-gray-600">{hosting.accountName}</div>
                    {hosting.renewalDate && <div className="text-sm text-gray-500 mt-1">{t('accounts.fields.renews')}: {hosting.renewalDate}</div>}
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

        <Card title={t('accounts.socialMedia')} action={<Button onClick={() => socialForm.openModal()}>{t('common.add')}</Button>}>
          <p className="text-sm text-gray-600 mb-4">
            {t('accounts.socialMediaDescription')}
          </p>
          <div className="space-y-3">
            {plan.accounts.socialMedia.length === 0 ? (
              <p className="text-gray-500 text-sm italic">{t('accounts.noSocialMedia')}</p>
            ) : (
              plan.accounts.socialMedia.map(social => (
                <div key={social.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{social.platform}</div>
                    <div className="text-sm text-gray-600">@{social.username}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {t('accounts.fields.disposition')}: {social.disposition === 'keep' ? t('accounts.fields.dispositionKeep') : social.disposition === 'close' ? t('accounts.fields.dispositionClose') : social.disposition === 'export_first' ? t('accounts.fields.dispositionExport') : t('accounts.fields.dispositionMemorialize')}
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

        <Modal isOpen={subForm.isModalOpen} onClose={subForm.closeModal} title={subForm.editingItem ? t('accounts.editSubscription') : t('accounts.addSubscription')} footer={<><Button variant="secondary" onClick={subForm.closeModal}>{t('common.cancel')}</Button><Button onClick={handleSaveSubscription} disabled={!subForm.formData.name?.trim()}>{t('common.save')}</Button></>}>
          <div className="space-y-4">
            <Input label={t('accounts.fields.name')} value={subForm.formData.name || ''} onChange={(e) => subForm.updateField('name', e.target.value)} required />
            <Input label={t('accounts.fields.type')} value={subForm.formData.type || ''} onChange={(e) => subForm.updateField('type', e.target.value)} placeholder={t('accounts.fields.typePlaceholder')} />
            <Select label={t('accounts.fields.status')} value={subForm.formData.status || 'review'} onChange={(e) => subForm.updateField('status', e.target.value as AccountStatus)} options={statusOptions} />
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={subForm.formData.autoPayEnabled || false} onChange={(e) => subForm.updateField('autoPayEnabled', e.target.checked)} className="rounded border-gray-300" />
              <span className="text-sm text-gray-700">{t('accounts.fields.autoPayEnabled')}</span>
            </label>
            <Input label={t('accounts.fields.contractEndDate')} type="date" value={subForm.formData.contractEndDate || ''} onChange={(e) => subForm.updateField('contractEndDate', e.target.value)} />
            <Input label={t('accounts.fields.cancellationNoticeDays')} type="number" value={subForm.formData.cancellationNoticeDays?.toString() || ''} onChange={(e) => subForm.updateField('cancellationNoticeDays', parseInt(e.target.value) || 0)} placeholder={t('accounts.fields.cancellationNoticeDaysPlaceholder')} />
            <Input label={t('accounts.fields.paymentMethod')} value={subForm.formData.paymentMethod || ''} onChange={(e) => subForm.updateField('paymentMethod', e.target.value)} placeholder={t('accounts.fields.paymentMethodPlaceholder')} />
            <TextArea label={t('contacts.notes')} value={subForm.formData.notes || ''} onChange={(e) => subForm.updateField('notes', e.target.value)} />
          </div>
        </Modal>

        <Modal isOpen={cloudForm.isModalOpen} onClose={cloudForm.closeModal} title={cloudForm.editingItem ? t('accounts.editCloudService') : t('accounts.addCloudService')} footer={<><Button variant="secondary" onClick={cloudForm.closeModal}>{t('common.cancel')}</Button><Button onClick={handleSaveCloud} disabled={!cloudForm.formData.name?.trim()}>{t('common.save')}</Button></>}>
          <div className="space-y-4">
            <Input label={t('accounts.fields.name')} value={cloudForm.formData.name || ''} onChange={(e) => cloudForm.updateField('name', e.target.value)} required />
            <Input label={t('accounts.fields.provider')} value={cloudForm.formData.provider || ''} onChange={(e) => cloudForm.updateField('provider', e.target.value)} placeholder={t('accounts.fields.providerPlaceholder')} />
            <Select label={t('accounts.fields.status')} value={cloudForm.formData.status || 'review'} onChange={(e) => cloudForm.updateField('status', e.target.value as AccountStatus)} options={statusOptions} />
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={cloudForm.formData.autoPayEnabled || false} onChange={(e) => cloudForm.updateField('autoPayEnabled', e.target.checked)} className="rounded border-gray-300" />
              <span className="text-sm text-gray-700">{t('accounts.fields.autoPayEnabled')}</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={cloudForm.formData.billingWarning || false} onChange={(e) => cloudForm.updateField('billingWarning', e.target.checked)} className="rounded border-gray-300" />
              <span className="text-sm text-gray-700">{t('accounts.fields.highBillingRisk')}</span>
            </label>
            <TextArea label={t('contacts.notes')} value={cloudForm.formData.notes || ''} onChange={(e) => cloudForm.updateField('notes', e.target.value)} />
          </div>
        </Modal>

        <Modal isOpen={domainForm.isModalOpen} onClose={domainForm.closeModal} title={domainForm.editingItem ? t('accounts.editDomain') : t('accounts.addDomain')} footer={<><Button variant="secondary" onClick={domainForm.closeModal}>{t('common.cancel')}</Button><Button onClick={handleSaveDomain} disabled={!domainForm.formData.name?.trim()}>{t('common.save')}</Button></>}>
          <div className="space-y-4">
            <Input label={t('accounts.fields.domainName')} value={domainForm.formData.name || ''} onChange={(e) => domainForm.updateField('name', e.target.value)} required />
            <Input label={t('accounts.fields.registrar')} value={domainForm.formData.registrar || ''} onChange={(e) => domainForm.updateField('registrar', e.target.value)} />
            <Input label={t('accounts.fields.expirationDate')} type="date" value={domainForm.formData.expirationDate || ''} onChange={(e) => domainForm.updateField('expirationDate', e.target.value)} />
            <TextArea label={t('contacts.notes')} value={domainForm.formData.notes || ''} onChange={(e) => domainForm.updateField('notes', e.target.value)} />
          </div>
        </Modal>

        <Modal isOpen={hostingForm.isModalOpen} onClose={hostingForm.closeModal} title={hostingForm.editingItem ? t('accounts.editHosting') : t('accounts.addHosting')} footer={<><Button variant="secondary" onClick={hostingForm.closeModal}>{t('common.cancel')}</Button><Button onClick={handleSaveHosting} disabled={!hostingForm.formData.provider?.trim()}>{t('common.save')}</Button></>}>
          <div className="space-y-4">
            <Input label={t('accounts.fields.provider')} value={hostingForm.formData.provider || ''} onChange={(e) => hostingForm.updateField('provider', e.target.value)} required />
            <Input label={t('accounts.fields.accountName')} value={hostingForm.formData.accountName || ''} onChange={(e) => hostingForm.updateField('accountName', e.target.value)} />
            <Input label={t('accounts.fields.renewalDate')} type="date" value={hostingForm.formData.renewalDate || ''} onChange={(e) => hostingForm.updateField('renewalDate', e.target.value)} />
            <TextArea label={t('contacts.notes')} value={hostingForm.formData.notes || ''} onChange={(e) => hostingForm.updateField('notes', e.target.value)} />
          </div>
        </Modal>

        <Modal isOpen={socialForm.isModalOpen} onClose={socialForm.closeModal} title={socialForm.editingItem ? t('accounts.editSocialMedia') : t('accounts.addSocialMedia')} footer={<><Button variant="secondary" onClick={socialForm.closeModal}>{t('common.cancel')}</Button><Button onClick={handleSaveSocial} disabled={!socialForm.formData.platform?.trim()}>{t('common.save')}</Button></>}>
          <div className="space-y-4">
            <Input label={t('accounts.fields.platform')} value={socialForm.formData.platform || ''} onChange={(e) => socialForm.updateField('platform', e.target.value)} placeholder={t('accounts.fields.platformPlaceholder')} required />
            <Input label={t('accounts.fields.username')} value={socialForm.formData.username || ''} onChange={(e) => socialForm.updateField('username', e.target.value)} placeholder={t('accounts.fields.usernamePlaceholder')} />
            <Select label={t('accounts.fields.disposition')} value={socialForm.formData.disposition || 'keep'} onChange={(e) => socialForm.updateField('disposition', e.target.value as SocialMediaDisposition)} options={dispositionOptions} />
            <TextArea label={t('accounts.fields.exportInstructions')} value={socialForm.formData.exportInstructions || ''} onChange={(e) => socialForm.updateField('exportInstructions', e.target.value)} placeholder={t('accounts.fields.exportInstructionsPlaceholder')} rows={3} />
            <TextArea label={t('contacts.notes')} value={socialForm.formData.notes || ''} onChange={(e) => socialForm.updateField('notes', e.target.value)} />
          </div>
        </Modal>
      </div>
      )}
    </AppLayout>
  );
}
