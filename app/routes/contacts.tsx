import { useState } from 'react';
import { AppLayout } from '~/components/AppLayout';
import { Card } from '~/components/Card';
import { Button } from '~/components/Button';
import { Modal } from '~/components/Modal';
import { Input } from '~/components/Input';
import { TextArea } from '~/components/TextArea';
import { EmptyState } from '~/components/EmptyState';
import { WarningBanner } from '~/components/WarningBanner';
import { useSession } from '~/lib/session-context';
import { useLanguage } from '~/lib/language-context';
import { useModalForm } from '~/hooks/useModalForm';
import { usePlanUpdater } from '~/hooks/usePlanUpdater';
import type { Contact } from '~/types';
import { ChevronUp, ChevronDown, AlertTriangle, Phone, Mail, Info, User, Star } from 'lucide-react';

interface ContactAssociations {
  executorRole: boolean;
  assetBeneficiaries: Array<{ assetName: string; percentage?: number }>;
  totalCount: number;
}

export default function Contacts() {
  const { plan } = useSession();
  const { t } = useLanguage();
  const { updatePlan } = usePlanUpdater();
  const [deleteWarning, setDeleteWarning] = useState<{ id: string; name: string; references: string[] } | null>(null);
  const [detailContact, setDetailContact] = useState<Contact | null>(null);

  const initialFormData: Partial<Contact> = {
    name: '',
    relationship: '',
    phone: '',
    email: '',
    notes: '',
    notifyBeforeSocial: false,
  };

  const {
    isModalOpen,
    formData,
    editingItem: editingContact,
    openModal,
    closeModal,
    updateField,
  } = useModalForm<Partial<Contact>>(initialFormData);

  const getContactAssociations = (contactId: string): ContactAssociations => {
    if (!plan) return { executorRole: false, assetBeneficiaries: [], totalCount: 0 };

    const executorRole = plan.willTestaments.estateContacts.some(ec => ec.existingContactId === contactId);
    const assetBeneficiaries: Array<{ assetName: string; percentage?: number }> = [];

    plan.willTestaments.assets.forEach(asset => {
      const beneficiary = asset.beneficiaries.find(b => b.contactId === contactId);
      if (beneficiary) {
        assetBeneficiaries.push({
          assetName: asset.name,
          percentage: beneficiary.percentage
        });
      }
    });

    const totalCount = (executorRole ? 1 : 0) + assetBeneficiaries.length;

    return { executorRole, assetBeneficiaries, totalCount };
  };

  const findContactReferences = (contactId: string): string[] => {
    if (!plan) return [];
    const references: string[] = [];

    if (plan.willTestaments.estateContacts.some(ec => ec.existingContactId === contactId)) {
      references.push('Estate Planning - Executors/Trustees');
    }

    plan.willTestaments.assets.forEach(asset => {
      if (asset.beneficiaries.some(b => b.contactId === contactId)) {
        references.push(`Estate Planning - Asset: "${asset.name}" (Beneficiary)`);
      }
    });

    return references;
  };

  const handleSave = async () => {
    if (!plan || !formData.name) return;

    const updatedContacts = editingContact
      ? plan.contacts.map(c => c.id === editingContact.id ? { ...formData, id: c.id, order: c.order } as Contact : c)
      : [...plan.contacts, { ...formData, id: crypto.randomUUID(), order: plan.contacts.length } as Contact];

    const orderedContactIds = updatedContacts.map(c => c.id);
    const updatedPlan = {
      ...plan,
      contacts: updatedContacts,
      notificationPlan: { ...plan.notificationPlan, orderedContactIds }
    };

    await updatePlan(updatedPlan, editingContact ? t('contacts.contactUpdated') : t('contacts.contactAdded'));
    closeModal();
  };

  const handleDelete = async (id: string) => {
    const contact = plan?.contacts.find(c => c.id === id);
    if (!contact) return;

    const references = findContactReferences(id);

    if (references.length > 0) {
      setDeleteWarning({ id, name: contact.name, references });
    } else {
      if (!confirm(t('contacts.deleteConfirm'))) return;
      await performDelete(id);
    }
  };

  const performDelete = async (id: string) => {
    if (!plan) return;

    const updatedContacts = plan.contacts.filter(c => c.id !== id);
    const orderedContactIds = updatedContacts.map(c => c.id);
    const updatedPlan = {
      ...plan,
      contacts: updatedContacts,
      notificationPlan: { ...plan.notificationPlan, orderedContactIds }
    };

    await updatePlan(updatedPlan, t('contacts.contactDeleted'));
    setDeleteWarning(null);
  };

  const handleConfirmDelete = async () => {
    if (deleteWarning) {
      await performDelete(deleteWarning.id);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0 || !plan) return;

    const updatedContacts = [...plan.contacts];
    [updatedContacts[index - 1], updatedContacts[index]] = [updatedContacts[index], updatedContacts[index - 1]];
    updatedContacts.forEach((c, i) => c.order = i);

    const orderedContactIds = updatedContacts.map(c => c.id);
    const updatedPlan = {
      ...plan,
      contacts: updatedContacts,
      notificationPlan: { ...plan.notificationPlan, orderedContactIds }
    };

    await updatePlan(updatedPlan);
  };

  const handleMoveDown = async (index: number) => {
    if (!plan || index === plan.contacts.length - 1) return;

    const updatedContacts = [...plan.contacts];
    [updatedContacts[index], updatedContacts[index + 1]] = [updatedContacts[index + 1], updatedContacts[index]];
    updatedContacts.forEach((c, i) => c.order = i);

    const orderedContactIds = updatedContacts.map(c => c.id);
    const updatedPlan = {
      ...plan,
      contacts: updatedContacts,
      notificationPlan: { ...plan.notificationPlan, orderedContactIds }
    };

    await updatePlan(updatedPlan);
  };

  return (
    <AppLayout>
      {plan && (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('contacts.title')}</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">{t('contacts.description')}</p>
          </div>
          <Button onClick={() => openModal()} className="sm:flex-shrink-0">{t('contacts.addContact')}</Button>
        </div>

        <WarningBanner>
          {t('contacts.warningBanner')}
        </WarningBanner>

        {plan.contacts.length === 0 ? (
          <Card>
            <EmptyState
              title={t('contacts.noContactsYet')}
              description={t('contacts.noContactsDescription')}
              actionLabel={t('contacts.addContact')}
              onAction={() => openModal()}
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {plan.contacts.map((contact, index) => {
              const associations = getContactAssociations(contact.id);
              return (
                <div
                  key={contact.id}
                  className={`rounded-lg border shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col ${
                    contact.notifyBeforeSocial
                      ? 'border-blue-300 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-700 text-xs font-bold">
                            {index + 1}
                          </span>
                          {contact.notifyBeforeSocial && (
                            <Star className="w-4 h-4 text-blue-600 fill-blue-600" />
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 text-lg truncate">{contact.name}</h3>
                        {contact.relationship && (
                          <p className="text-sm text-gray-600 mt-1">
                            <User className="w-3 h-3 inline mr-1" />
                            {contact.relationship}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 ml-2">
                        <button
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title={t('contacts.moveUp')}
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMoveDown(index)}
                          disabled={index === plan.contacts.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title={t('contacts.moveDown')}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 flex-1 text-sm">
                      {contact.phone && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="truncate">{contact.phone}</span>
                        </div>
                      )}
                      {contact.email && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="truncate">{contact.email}</span>
                        </div>
                      )}
                      {contact.notes && (
                        <p className="text-xs text-gray-500 mt-2 line-clamp-2">{contact.notes}</p>
                      )}
                    </div>

                    {associations.totalCount > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => setDetailContact(contact)}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                        >
                          <Info className="w-3 h-3" />
                          <span>{t('contacts.usedInPlaces', { count: associations.totalCount, places: associations.totalCount === 1 ? t('contacts.place') : t('contacts.places') })}</span>
                        </button>
                      </div>
                    )}

                    <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">
                      <button
                        onClick={() => openModal(contact)}
                        className="flex-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        onClick={() => handleDelete(contact.id)}
                        className="flex-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        {t('common.delete')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={editingContact ? t('contacts.editContact') : t('contacts.addContact')}
          footer={
            <>
              <Button variant="secondary" onClick={closeModal}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleSave} disabled={!formData.name?.trim()}>
                {t('common.save')}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input
              label={t('contacts.name')}
              value={formData.name || ''}
              onChange={(e) => updateField('name', e.target.value)}
              required
            />
            <Input
              label={t('contacts.relationship')}
              value={formData.relationship || ''}
              onChange={(e) => updateField('relationship', e.target.value)}
              placeholder={t('contacts.relationshipPlaceholder')}
            />
            <Input
              label={t('contacts.phone')}
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => updateField('phone', e.target.value)}
            />
            <Input
              label={t('contacts.email')}
              type="email"
              value={formData.email || ''}
              onChange={(e) => updateField('email', e.target.value)}
            />
            <TextArea
              label={t('contacts.notes')}
              value={formData.notes || ''}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder={t('contacts.notesPlaceholder')}
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="notifyBeforeSocial"
                checked={formData.notifyBeforeSocial || false}
                onChange={(e) => updateField('notifyBeforeSocial', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="notifyBeforeSocial" className="text-sm text-gray-700">
                {t('contacts.notifyBeforeSocial')}
              </label>
            </div>
          </div>
        </Modal>

        {deleteWarning && (
          <Modal
            isOpen={true}
            onClose={() => setDeleteWarning(null)}
            title={t('contacts.cannotDeleteContact')}
            footer={
              <>
                <Button variant="secondary" onClick={() => setDeleteWarning(null)}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
                  {t('contacts.deleteAnyway')}
                </Button>
              </>
            }
          >
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex gap-3">
                  <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-yellow-900">{t('contacts.contactReferencedElsewhere')}</p>
                    <p className="text-sm text-yellow-800 mt-1">
                      <strong>{deleteWarning.name}</strong> {t('contacts.contactUsedIn')}
                    </p>
                  </div>
                </div>
              </div>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 pl-4">
                {deleteWarning.references?.map((ref, i) => (
                  <li key={i}>{ref}</li>
                ))}
              </ul>
              <p className="text-sm text-gray-600">
                {t('contacts.updateReferencesFirst')}
              </p>
            </div>
          </Modal>
        )}

        {detailContact && (
          <Modal
            isOpen={true}
            onClose={() => setDetailContact(null)}
            title={`Contact Details: ${detailContact.name}`}
            footer={
              <Button variant="secondary" onClick={() => setDetailContact(null)}>
                Close
              </Button>
            }
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Contact Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <span className="text-gray-500">Name:</span>{' '}
                      <span className="text-gray-900 font-medium">{detailContact.name}</span>
                    </div>
                  </div>
                  {detailContact.relationship && (
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <span className="text-gray-500">Relationship:</span>{' '}
                        <span className="text-gray-900">{detailContact.relationship}</span>
                      </div>
                    </div>
                  )}
                  {detailContact.phone && (
                    <div className="flex items-start gap-2">
                      <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <span className="text-gray-500">Phone:</span>{' '}
                        <span className="text-gray-900">{detailContact.phone}</span>
                      </div>
                    </div>
                  )}
                  {detailContact.email && (
                    <div className="flex items-start gap-2">
                      <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <span className="text-gray-500">Email:</span>{' '}
                        <span className="text-gray-900">{detailContact.email}</span>
                      </div>
                    </div>
                  )}
                  {detailContact.notifyBeforeSocial && (
                    <div className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-blue-600 fill-blue-600 mt-0.5" />
                      <span className="text-blue-900 font-medium">Priority contact - notify before social media</span>
                    </div>
                  )}
                  {detailContact.notes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded text-gray-700">
                      <span className="text-gray-500 font-medium">Notes:</span>
                      <p className="mt-1">{detailContact.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {(() => {
                const associations = getContactAssociations(detailContact.id);
                if (associations.totalCount === 0) {
                  return (
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <p className="text-sm text-gray-600">This contact is not currently referenced in any estate planning documents.</p>
                    </div>
                  );
                }

                return (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Associated Resources</h3>
                    <div className="space-y-3">
                      {associations.executorRole && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm font-medium text-green-900">Executor/Trustee Role</p>
                          <p className="text-xs text-green-700 mt-1">Listed as an executor or trustee in Estate Planning</p>
                        </div>
                      )}
                      {associations.assetBeneficiaries.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">Asset Beneficiary ({associations.assetBeneficiaries.length})</p>
                          {associations.assetBeneficiaries.map((asset, idx) => (
                            <div key={idx} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <p className="text-sm font-medium text-blue-900">{asset.assetName}</p>
                              {asset.percentage && (
                                <p className="text-xs text-blue-700 mt-1">Beneficiary share: {asset.percentage}%</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </Modal>
        )}
      </div>
      )}
    </AppLayout>
  );
}
