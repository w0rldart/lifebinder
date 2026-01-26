import { useState } from 'react';
import { AppLayout } from '~/components/AppLayout';
import { Card } from '~/components/Card';
import { Button } from '~/components/Button';
import { Modal } from '~/components/Modal';
import { Input } from '~/components/Input';
import { TextArea } from '~/components/TextArea';
import { Select } from '~/components/Select';
import { EmptyState } from '~/components/EmptyState';
import { WarningBanner } from '~/components/WarningBanner';
import { useSession } from '~/lib/session-context';
import { useLanguage } from '~/lib/language-context';
import { useModalForm } from '~/hooks/useModalForm';
import { usePlanUpdater } from '~/hooks/usePlanUpdater';
import type { EstateContact, Asset, Beneficiary, SensitivityLevel, AssetInputMode, EstateContactType } from '~/types';
import { Edit2, Trash2 } from 'lucide-react';

export default function WillTestaments() {
  const { plan } = useSession();
  const { updatePlan } = usePlanUpdater();
  const { t } = useLanguage();

  const contactForm = useModalForm<Partial<EstateContact>>({
    type: 'new',
    name: '',
    relationship: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });

  const assetForm = useModalForm<Partial<Asset>>({
    name: '',
    type: '',
    inputMode: 'simple',
    simpleDistribution: '',
    beneficiaries: [],
    location: '',
    estimatedValue: '',
    notes: '',
  });

  const [beneficiaryForm, setBeneficiaryForm] = useState<Partial<Beneficiary>>({
    contactId: '',
    percentage: undefined,
    specificItems: '',
    notes: '',
  });
  const [showBeneficiaryModal, setShowBeneficiaryModal] = useState(false);
  const [editingBeneficiaryIndex, setEditingBeneficiaryIndex] = useState<number | null>(null);

  const estateContacts = plan?.willTestaments?.estateContacts || [];
  const assets = plan?.willTestaments?.assets || [];

  const sensitivityOptions = [
    { value: 'normal', label: t('willTestaments.sensitivityOptions.normal') },
    { value: 'high', label: t('willTestaments.sensitivityOptions.high') },
  ];

  const contactTypeOptions = [
    { value: 'existing', label: t('willTestaments.contactTypeOptions.existing') },
    { value: 'new', label: t('willTestaments.contactTypeOptions.new') },
  ];

  const assetModeOptions = [
    { value: 'simple', label: t('willTestaments.assetModeOptions.simple') },
    { value: 'structured', label: t('willTestaments.assetModeOptions.structured') },
  ];

  const handleSensitivityChange = async (sensitivity: SensitivityLevel) => {
    if (!plan) return;
    const updatedPlan = {
      ...plan,
      willTestaments: { ...plan.willTestaments, sensitivity },
    };
    await updatePlan(updatedPlan, 'Sensitivity level updated');
  };

  const handleFieldUpdate = async (field: string, value: any) => {
    if (!plan) return;
    const updatedPlan = {
      ...plan,
      willTestaments: { ...plan.willTestaments, [field]: value },
    };
    await updatePlan(updatedPlan, 'Information updated');
  };

  const handleSaveContact = async () => {
    if (!plan || !contactForm.formData.name) return;

    const existingContactData = contactForm.formData.type === 'existing' && contactForm.formData.existingContactId
      ? plan.contacts.find(c => c.id === contactForm.formData.existingContactId)
      : null;

    const contactToSave: EstateContact = {
      id: contactForm.editingItem?.id || crypto.randomUUID(),
      type: contactForm.formData.type || 'new',
      existingContactId: contactForm.formData.existingContactId,
      name: existingContactData?.name || contactForm.formData.name || '',
      relationship: existingContactData?.relationship || contactForm.formData.relationship || '',
      phone: existingContactData?.phone || contactForm.formData.phone || '',
      email: existingContactData?.email || contactForm.formData.email || '',
      address: contactForm.formData.address || '',
      notes: contactForm.formData.notes || '',
    };

    const updated = contactForm.editingItem
      ? estateContacts.map(c => c.id === contactForm.editingItem!.id ? contactToSave : c)
      : [...estateContacts, contactToSave];

    const updatedPlan = {
      ...plan,
      willTestaments: { ...plan.willTestaments, estateContacts: updated },
    };
    await updatePlan(updatedPlan, contactForm.editingItem ? t('willTestaments.contactUpdated') : t('willTestaments.contactAdded'));
    contactForm.closeModal();
  };

  const handleDeleteContact = async (id: string) => {
    if (!plan || !confirm(t('willTestaments.deleteContact'))) return;
    const updated = estateContacts.filter(c => c.id !== id);
    const updatedPlan = {
      ...plan,
      willTestaments: { ...plan.willTestaments, estateContacts: updated },
    };
    await updatePlan(updatedPlan, t('willTestaments.contactDeleted'));
  };

  const handleSaveAsset = async () => {
    if (!plan || !assetForm.formData.name) return;

    const assetToSave: Asset = {
      id: assetForm.editingItem?.id || crypto.randomUUID(),
      name: assetForm.formData.name || '',
      type: assetForm.formData.type || '',
      inputMode: assetForm.formData.inputMode || 'simple',
      simpleDistribution: assetForm.formData.simpleDistribution || '',
      beneficiaries: assetForm.formData.beneficiaries || [],
      location: assetForm.formData.location || '',
      estimatedValue: assetForm.formData.estimatedValue || '',
      notes: assetForm.formData.notes || '',
    };

    const updated = assetForm.editingItem
      ? assets.map(a => a.id === assetForm.editingItem!.id ? assetToSave : a)
      : [...assets, assetToSave];

    const updatedPlan = {
      ...plan,
      willTestaments: { ...plan.willTestaments, assets: updated },
    };
    await updatePlan(updatedPlan, assetForm.editingItem ? t('willTestaments.assetUpdated') : t('willTestaments.assetAdded'));
    assetForm.closeModal();
  };

  const handleDeleteAsset = async (id: string) => {
    if (!plan || !confirm(t('willTestaments.deleteAsset'))) return;
    const updated = assets.filter(a => a.id !== id);
    const updatedPlan = {
      ...plan,
      willTestaments: { ...plan.willTestaments, assets: updated },
    };
    await updatePlan(updatedPlan, t('willTestaments.assetDeleted'));
  };

  const handleAddBeneficiary = () => {
    const newBeneficiary: Beneficiary = {
      id: crypto.randomUUID(),
      contactId: beneficiaryForm.contactId || '',
      percentage: beneficiaryForm.percentage,
      specificItems: beneficiaryForm.specificItems || '',
      notes: beneficiaryForm.notes || '',
    };

    const updatedBeneficiaries = editingBeneficiaryIndex !== null
      ? (assetForm.formData.beneficiaries || []).map((b, i) => i === editingBeneficiaryIndex ? newBeneficiary : b)
      : [...(assetForm.formData.beneficiaries || []), newBeneficiary];

    assetForm.updateField('beneficiaries', updatedBeneficiaries);
    setShowBeneficiaryModal(false);
    setBeneficiaryForm({ contactId: '', percentage: undefined, specificItems: '', notes: '' });
    setEditingBeneficiaryIndex(null);
  };

  const handleDeleteBeneficiary = (index: number) => {
    const updatedBeneficiaries = (assetForm.formData.beneficiaries || []).filter((_, i) => i !== index);
    assetForm.updateField('beneficiaries', updatedBeneficiaries);
  };

  const getContactName = (contactId: string) => {
    const estateContact = estateContacts.find(c => c.id === contactId);
    if (estateContact) return estateContact.name;
    const regularContact = plan?.contacts.find(c => c.id === contactId);
    return regularContact?.name || 'Unknown';
  };

  const allContactsForSelection = [
    ...(plan?.contacts || []).map(c => ({ value: c.id, label: `${c.name} (${c.relationship})` })),
    ...estateContacts.map(c => ({ value: c.id, label: `${c.name} (${c.relationship})` })),
  ];

  return (
    <AppLayout>
      {plan && (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t('willTestaments.title')}</h1>
          <p className="text-sm sm:text-base text-gray-600">
            {t('willTestaments.description')}
          </p>
        </div>

        <Card title={t('willTestaments.sensitivityLevel')}>
          <div className="space-y-3">
            <Select
              label={t('willTestaments.dataSensitivity')}
              value={plan.willTestaments.sensitivity}
              onChange={(e) => handleSensitivityChange(e.target.value as SensitivityLevel)}
              options={sensitivityOptions}
            />
            <WarningBanner type={plan.willTestaments.sensitivity === 'high' ? 'warning' : 'info'}>
              {plan.willTestaments.sensitivity === 'high' ? (
                <span><strong>{t('willTestaments.highSensitivity')}</strong> {t('willTestaments.highSensitivityText')}</span>
              ) : (
                <span><strong>{t('willTestaments.normalSensitivity')}</strong> {t('willTestaments.normalSensitivityText')}</span>
              )}
            </WarningBanner>
          </div>
        </Card>

        <Card title={t('willTestaments.keyDocsProfessionals')}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Input
              label={t('willTestaments.willLocation')}
              value={plan.willTestaments.willLocation}
              onChange={(e) => handleFieldUpdate('willLocation', e.target.value)}
              placeholder={t('willTestaments.willLocationPlaceholder')}
            />
            <Input
              label={t('willTestaments.trustLocation')}
              value={plan.willTestaments.trustLocation}
              onChange={(e) => handleFieldUpdate('trustLocation', e.target.value)}
              placeholder={t('willTestaments.trustLocationPlaceholder')}
            />
            <Input
              label={t('willTestaments.executorName')}
              value={plan.willTestaments.executor}
              onChange={(e) => handleFieldUpdate('executor', e.target.value)}
              placeholder={t('willTestaments.executorPlaceholder')}
            />
            <Input
              label={t('willTestaments.executorContact')}
              value={plan.willTestaments.executorContact}
              onChange={(e) => handleFieldUpdate('executorContact', e.target.value)}
              placeholder={t('willTestaments.executorContactPlaceholder')}
            />
            <Input
              label={t('willTestaments.estateAttorney')}
              value={plan.willTestaments.attorney}
              onChange={(e) => handleFieldUpdate('attorney', e.target.value)}
              placeholder={t('willTestaments.attorneyPlaceholder')}
            />
            <Input
              label={t('willTestaments.attorneyContact')}
              value={plan.willTestaments.attorneyContact}
              onChange={(e) => handleFieldUpdate('attorneyContact', e.target.value)}
              placeholder={t('willTestaments.attorneyContactPlaceholder')}
            />
            <Input
              label={t('willTestaments.accountant')}
              value={plan.willTestaments.accountant}
              onChange={(e) => handleFieldUpdate('accountant', e.target.value)}
              placeholder={t('willTestaments.accountantPlaceholder')}
            />
            <Input
              label={t('willTestaments.accountantContact')}
              value={plan.willTestaments.accountantContact}
              onChange={(e) => handleFieldUpdate('accountantContact', e.target.value)}
              placeholder={t('willTestaments.accountantContactPlaceholder')}
            />
          </div>
        </Card>

        <Card
          title={t('willTestaments.estateContacts')}
          action={
            <Button onClick={() => contactForm.openModal()}>
              {t('willTestaments.addContact')}
            </Button>
          }
        >
          <p className="text-sm text-gray-600 mb-4">
            {t('willTestaments.beneficiariesDescription')}
          </p>
          {estateContacts.length === 0 ? (
            <EmptyState
              title={t('willTestaments.noEstateContactsYet')}
              description={t('willTestaments.estateContactsDescription')}
              actionLabel={t('willTestaments.addContact')}
              onAction={() => contactForm.openModal()}
            />
          ) : (
            <div className="space-y-3">
              {estateContacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                      {contact.type === 'existing' && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {t('willTestaments.linked')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{contact.relationship}</p>
                    <div className="text-sm text-gray-500 mt-1 space-y-0.5">
                      {contact.phone && <div>📞 {contact.phone}</div>}
                      {contact.email && <div>✉️ {contact.email}</div>}
                      {contact.address && <div>📍 {contact.address}</div>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => contactForm.openModal(contact)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card
          title={t('willTestaments.assetsDistribution')}
          action={
            <Button onClick={() => assetForm.openModal()}>
              {t('willTestaments.addAsset')}
            </Button>
          }
        >
          <p className="text-sm text-gray-600 mb-4">
            {t('willTestaments.assetsDescriptionFull')}
          </p>
          {assets.length === 0 ? (
            <EmptyState
              title={t('willTestaments.noAssetsYet')}
              description={t('willTestaments.assetsDescription')}
              actionLabel={t('willTestaments.addAsset')}
              onAction={() => assetForm.openModal()}
            />
          ) : (
            <div className="space-y-3">
              {assets.map((asset) => (
                <div key={asset.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{asset.name}</h3>
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                          {asset.type}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          asset.inputMode === 'simple'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {asset.inputMode === 'simple' ? t('willTestaments.simple') : t('willTestaments.structured')}
                        </span>
                      </div>
                      {asset.location && (
                        <p className="text-sm text-gray-600 mt-1">📍 {asset.location}</p>
                      )}
                      {asset.estimatedValue && (
                        <p className="text-sm text-gray-600">💰 {asset.estimatedValue}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => assetForm.openModal(asset)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAsset(asset.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {asset.inputMode === 'simple' ? (
                    <div className="mt-2 p-3 bg-white rounded border border-gray-200">
                      <p className="text-sm text-gray-700">{asset.simpleDistribution || 'No distribution notes'}</p>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-600 mb-2">Beneficiaries:</p>
                      {asset.beneficiaries.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">{t('willTestaments.noBeneficiariesAdded')}</p>
                      ) : (
                        <div className="space-y-2">
                          {asset.beneficiaries.map((ben) => (
                            <div key={ben.id} className="p-2 bg-white rounded border border-gray-200 text-sm">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-900">{getContactName(ben.contactId)}</span>
                                {ben.percentage && <span className="text-gray-600">{ben.percentage}%</span>}
                              </div>
                              {ben.specificItems && (
                                <p className="text-gray-600 mt-1">Items: {ben.specificItems}</p>
                              )}
                              {ben.notes && (
                                <p className="text-gray-500 mt-1 text-xs">{ben.notes}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {asset.notes && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-sm text-gray-500">{asset.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title={t('willTestaments.additionalInstructions')}>
          <div className="space-y-4">
            <TextArea
              label={t('willTestaments.funeralPreferences')}
              value={plan.willTestaments.funeralPreferences}
              onChange={(e) => handleFieldUpdate('funeralPreferences', e.target.value)}
              placeholder={t('willTestaments.funeralPreferencesPlaceholder')}
              rows={4}
            />
            <TextArea
              label={t('willTestaments.specialInstructions')}
              value={plan.willTestaments.specialInstructions}
              onChange={(e) => handleFieldUpdate('specialInstructions', e.target.value)}
              placeholder={t('willTestaments.specialInstructionsPlaceholder')}
              rows={4}
            />
            <TextArea
              label={t('willTestaments.generalNotes')}
              value={plan.willTestaments.generalNotes}
              onChange={(e) => handleFieldUpdate('generalNotes', e.target.value)}
              placeholder={t('willTestaments.generalNotesPlaceholder')}
              rows={4}
            />
          </div>
        </Card>

        <Modal
          isOpen={contactForm.isModalOpen}
          onClose={contactForm.closeModal}
          title={contactForm.editingItem ? t('willTestaments.editContact') : t('willTestaments.addContact')}
          footer={
            <>
              <Button variant="secondary" onClick={contactForm.closeModal}>
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleSaveContact}
                disabled={contactForm.formData.type === 'existing' ? !contactForm.formData.existingContactId : !contactForm.formData.name?.trim()}
              >
                {t('common.save')}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Select
              label={t('willTestaments.contactType')}
              value={contactForm.formData.type || 'new'}
              onChange={(e) => contactForm.updateField('type', e.target.value as EstateContactType)}
              options={contactTypeOptions}
            />

            {contactForm.formData.type === 'existing' ? (
              <>
                <Select
                  label={t('willTestaments.selectExistingContact')}
                  value={contactForm.formData.existingContactId || ''}
                  onChange={(e) => {
                    const selectedContact = plan.contacts.find(c => c.id === e.target.value);
                    if (selectedContact) {
                      contactForm.setFormData({
                        ...contactForm.formData,
                        existingContactId: e.target.value,
                        name: selectedContact.name,
                        relationship: selectedContact.relationship,
                        phone: selectedContact.phone,
                        email: selectedContact.email,
                      });
                    }
                  }}
                  options={[
                    { value: '', label: t('willTestaments.selectContact') },
                    ...plan.contacts.map(c => ({ value: c.id, label: `${c.name} (${c.relationship})` })),
                  ]}
                />
                <Input
                  label={t('willTestaments.addressEstateSpecific')}
                  value={contactForm.formData.address || ''}
                  onChange={(e) => contactForm.updateField('address', e.target.value)}
                  placeholder={t('willTestaments.addressEstatePlaceholder')}
                />
              </>
            ) : (
              <>
                <Input
                  label={t('willTestaments.name')}
                  value={contactForm.formData.name || ''}
                  onChange={(e) => contactForm.updateField('name', e.target.value)}
                  required
                />
                <Input
                  label={t('willTestaments.relationship')}
                  value={contactForm.formData.relationship || ''}
                  onChange={(e) => contactForm.updateField('relationship', e.target.value)}
                  placeholder={t('contacts.relationshipPlaceholder')}
                />
                <Input
                  label={t('willTestaments.phone')}
                  type="tel"
                  value={contactForm.formData.phone || ''}
                  onChange={(e) => contactForm.updateField('phone', e.target.value)}
                />
                <Input
                  label={t('willTestaments.email')}
                  type="email"
                  value={contactForm.formData.email || ''}
                  onChange={(e) => contactForm.updateField('email', e.target.value)}
                />
                <Input
                  label={t('willTestaments.address')}
                  value={contactForm.formData.address || ''}
                  onChange={(e) => contactForm.updateField('address', e.target.value)}
                  placeholder={t('willTestaments.addressPlaceholder')}
                />
              </>
            )}

            <TextArea
              label={t('willTestaments.notes')}
              value={contactForm.formData.notes || ''}
              onChange={(e) => contactForm.updateField('notes', e.target.value)}
              placeholder={t('willTestaments.notesPlaceholder')}
            />
          </div>
        </Modal>

        <Modal
          isOpen={assetForm.isModalOpen}
          onClose={assetForm.closeModal}
          title={assetForm.editingItem ? t('willTestaments.editAsset') : t('willTestaments.addAsset')}
          footer={
            <>
              <Button variant="secondary" onClick={assetForm.closeModal}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleSaveAsset} disabled={!assetForm.formData.name?.trim()}>{t('common.save')}</Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input
              label={t('willTestaments.assetName')}
              value={assetForm.formData.name || ''}
              onChange={(e) => assetForm.updateField('name', e.target.value)}
              placeholder={t('willTestaments.assetTypePlaceholder')}
              required
            />
            <Input
              label={t('willTestaments.assetType')}
              value={assetForm.formData.type || ''}
              onChange={(e) => assetForm.updateField('type', e.target.value)}
              placeholder={t('willTestaments.assetTypePlaceholder')}
            />
            <Input
              label={t('willTestaments.location')}
              value={assetForm.formData.location || ''}
              onChange={(e) => assetForm.updateField('location', e.target.value)}
              placeholder={t('willTestaments.locationPlaceholder')}
            />
            <Input
              label={t('willTestaments.estimatedValue')}
              value={assetForm.formData.estimatedValue || ''}
              onChange={(e) => assetForm.updateField('estimatedValue', e.target.value)}
              placeholder="e.g., $500,000"
            />

            <Select
              label={t('willTestaments.distributionMethod')}
              value={assetForm.formData.inputMode || 'simple'}
              onChange={(e) => assetForm.updateField('inputMode', e.target.value as AssetInputMode)}
              options={assetModeOptions}
            />

            {assetForm.formData.inputMode === 'simple' ? (
              <TextArea
                label={t('willTestaments.distributionInstructions')}
                value={assetForm.formData.simpleDistribution || ''}
                onChange={(e) => assetForm.updateField('simpleDistribution', e.target.value)}
                placeholder={t('willTestaments.distributionInstructionsPlaceholder')}
                rows={4}
              />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">{t('willTestaments.beneficiaries')}</label>
                  <Button
                    onClick={() => {
                      setBeneficiaryForm({ contactId: '', percentage: undefined, specificItems: '', notes: '' });
                      setEditingBeneficiaryIndex(null);
                      setShowBeneficiaryModal(true);
                    }}
                    className="text-sm py-1 px-3"
                  >
                    {t('willTestaments.addBeneficiary')}
                  </Button>
                </div>
                {(assetForm.formData.beneficiaries || []).length === 0 ? (
                  <p className="text-sm text-gray-500 italic">{t('willTestaments.noBeneficiariesAdded')}</p>
                ) : (
                  <div className="space-y-2">
                    {(assetForm.formData.beneficiaries || []).map((ben: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-900">{getContactName(ben.contactId)}</p>
                          {ben.percentage && <p className="text-xs text-gray-600">{ben.percentage}%</p>}
                          {ben.specificItems && <p className="text-xs text-gray-600">Items: {ben.specificItems}</p>}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setBeneficiaryForm(ben);
                              setEditingBeneficiaryIndex(index);
                              setShowBeneficiaryModal(true);
                            }}
                            className="text-blue-600 hover:bg-blue-50 rounded p-1"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBeneficiary(index)}
                            className="text-red-600 hover:bg-red-50 rounded p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <TextArea
              label={t('willTestaments.additionalNotes')}
              value={assetForm.formData.notes || ''}
              onChange={(e) => assetForm.updateField('notes', e.target.value)}
              placeholder={t('willTestaments.additionalNotesPlaceholder')}
              rows={3}
            />
          </div>
        </Modal>

        <Modal
          isOpen={showBeneficiaryModal}
          onClose={() => {
            setShowBeneficiaryModal(false);
            setEditingBeneficiaryIndex(null);
          }}
          title={editingBeneficiaryIndex !== null ? t('willTestaments.editBeneficiary') : t('willTestaments.addBeneficiary')}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowBeneficiaryModal(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleAddBeneficiary}>{t('common.save')}</Button>
            </>
          }
        >
          <div className="space-y-4">
            <Select
              label={t('willTestaments.selectContactBeneficiary')}
              value={beneficiaryForm.contactId || ''}
              onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, contactId: e.target.value })}
              options={[
                { value: '', label: t('willTestaments.selectContact') },
                ...allContactsForSelection,
              ]}
            />
            <Input
              label={t('willTestaments.percentage')}
              type="number"
              value={beneficiaryForm.percentage || ''}
              onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, percentage: parseFloat(e.target.value) || undefined })}
              placeholder="e.g., 50"
            />
            <Input
              label={t('willTestaments.specificItems')}
              value={beneficiaryForm.specificItems || ''}
              onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, specificItems: e.target.value })}
              placeholder={t('willTestaments.specificItemsPlaceholder')}
            />
            <TextArea
              label={t('willTestaments.beneficiaryNotes')}
              value={beneficiaryForm.notes || ''}
              onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, notes: e.target.value })}
              placeholder={t('willTestaments.beneficiaryNotesPlaceholder')}
              rows={3}
            />
          </div>
        </Modal>
      </div>
      )}
    </AppLayout>
  );
}
