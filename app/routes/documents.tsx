import { AppLayout } from '~/components/AppLayout';
import { Card } from '~/components/Card';
import { Button } from '~/components/Button';
import { Modal } from '~/components/Modal';
import { Input } from '~/components/Input';
import { TextArea } from '~/components/TextArea';
import { Select } from '~/components/Select';
import { WarningBanner } from '~/components/WarningBanner';
import { useSession } from '~/lib/session-context';
import { useLanguage } from '~/lib/language-context';
import { useModalForm } from '~/hooks/useModalForm';
import { usePlanUpdater } from '~/hooks/usePlanUpdater';
import type { Document, LocationType, SensitivityLevel } from '~/types';
import { Edit2, Trash2 } from 'lucide-react';

export default function Documents() {
  const { plan } = useSession();
  const { t } = useLanguage();
  const { updatePlan } = usePlanUpdater();

  const documentForm = useModalForm<Partial<Document>>({
    title: '',
    locationType: 'physical',
    location: '',
    details: '',
    notes: '',
    sensitivity: 'normal',
  });

  const handleSave = async () => {
    if (!plan || !documentForm.formData.title) return;

    const updatedDocs = documentForm.editingItem
      ? plan.documents.map(d => d.id === documentForm.editingItem!.id ? { ...documentForm.formData, id: d.id } as Document : d)
      : [...plan.documents, { ...documentForm.formData, id: crypto.randomUUID() } as Document];

    const updatedPlan = { ...plan, documents: updatedDocs };
    await updatePlan(updatedPlan, documentForm.editingItem ? t('documents.documentUpdated') : t('documents.documentAdded'));
    documentForm.closeModal();
  };

  const handleDelete = async (id: string) => {
    if (!plan || !confirm(t('documents.deleteDocument'))) return;

    const updatedDocs = plan.documents.filter(d => d.id !== id);
    const updatedPlan = { ...plan, documents: updatedDocs };
    await updatePlan(updatedPlan, t('documents.documentDeleted'));
  };

  const locationOptions = [
    { value: 'physical', label: t('documents.fields.locationTypePhysical') },
    { value: 'digital', label: t('documents.fields.locationTypeDigital') },
    { value: 'both', label: t('documents.fields.locationTypeBoth') },
  ];

  const sensitivityOptions = [
    { value: 'normal', label: t('documents.fields.sensitivityNormal') },
    { value: 'high', label: t('documents.fields.sensitivityHigh') },
  ];

  return (
    <AppLayout>
      {plan && (() => {
        const normalDocs = plan.documents.filter(d => d.sensitivity === 'normal');
        const highSensitivityDocs = plan.documents.filter(d => d.sensitivity === 'high');

        return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t('documents.title')}</h1>
          <p className="text-sm sm:text-base text-gray-600">{t('documents.description')}</p>
        </div>

        <WarningBanner type="warning">
          <strong>{t('documents.securityReminder')}</strong> {t('documents.securityReminderText')}
        </WarningBanner>

        <Card title={t('documents.title')} action={<Button onClick={() => documentForm.openModal()}>{t('documents.addDocument')}</Button>}>
          {plan.documents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">{t('documents.noDocumentsYet')}</p>
              <Button onClick={() => documentForm.openModal()}>{t('documents.addFirstDocument')}</Button>
            </div>
          ) : (
            <div className="space-y-6">
              {normalDocs.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('documents.normalDocuments')}</h3>
                  <div className="space-y-3">
                    {normalDocs.map(doc => (
                      <div key={doc.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{doc.title}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            <span className="inline-flex items-center gap-1">
                              {doc.locationType === 'physical' && '📄'}
                              {doc.locationType === 'digital' && '💾'}
                              {doc.locationType === 'both' && '📄💾'}
                              <span className="capitalize">{doc.locationType}</span>
                            </span>
                          </div>
                          <div className="text-sm text-gray-700 mt-1">{doc.location}</div>
                          {doc.details && <div className="text-sm text-gray-600 mt-1">{doc.details}</div>}
                          {doc.notes && <div className="text-sm text-gray-500 mt-1">{doc.notes}</div>}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button onClick={() => documentForm.openModal(doc)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleDelete(doc.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {highSensitivityDocs.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">{t('documents.highSensitivityDocuments')}</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3 text-sm text-yellow-800">
                    <strong>{t('documents.highSensitivityNote')}</strong> {t('documents.highSensitivityNoteText')}
                  </div>
                  <div className="space-y-3">
                    {highSensitivityDocs.map(doc => (
                      <div key={doc.id} className="flex items-start justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-medium text-gray-900">{doc.title}</div>
                            <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">{t('documents.highSensitivity')}</span>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            <span className="inline-flex items-center gap-1">
                              {doc.locationType === 'physical' && '📄'}
                              {doc.locationType === 'digital' && '💾'}
                              {doc.locationType === 'both' && '📄💾'}
                              <span className="capitalize">{doc.locationType}</span>
                            </span>
                          </div>
                          <div className="text-sm text-gray-700 mt-1">{doc.location}</div>
                          {doc.details && <div className="text-sm text-gray-600 mt-1">{doc.details}</div>}
                          {doc.notes && <div className="text-sm text-gray-500 mt-1">{doc.notes}</div>}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button onClick={() => documentForm.openModal(doc)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleDelete(doc.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        <Modal
          isOpen={documentForm.isModalOpen}
          onClose={documentForm.closeModal}
          title={documentForm.editingItem ? t('documents.editDocument') : t('documents.addDocument')}
          footer={
            <>
              <Button variant="secondary" onClick={documentForm.closeModal}>{t('common.cancel')}</Button>
              <Button onClick={handleSave} disabled={!documentForm.formData.title?.trim()}>{t('common.save')}</Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input
              label={t('documents.fields.documentTitle')}
              value={documentForm.formData.title || ''}
              onChange={(e) => documentForm.updateField('title', e.target.value)}
              placeholder={t('documents.fields.documentTitlePlaceholder')}
              required
            />

            <Select
              label={t('documents.fields.locationType')}
              value={documentForm.formData.locationType || 'physical'}
              onChange={(e) => documentForm.updateField('locationType', e.target.value as LocationType)}
              options={locationOptions}
            />

            <Input
              label={t('documents.fields.location')}
              value={documentForm.formData.location || ''}
              onChange={(e) => documentForm.updateField('location', e.target.value)}
              placeholder={t('documents.fields.locationPlaceholder')}
            />

            <TextArea
              label={t('documents.fields.details')}
              value={documentForm.formData.details || ''}
              onChange={(e) => documentForm.updateField('details', e.target.value)}
              placeholder={t('documents.fields.detailsPlaceholder')}
            />

            <TextArea
              label={t('documents.fields.notes')}
              value={documentForm.formData.notes || ''}
              onChange={(e) => documentForm.updateField('notes', e.target.value)}
              placeholder={t('documents.fields.notesPlaceholder')}
            />

            <div>
              <Select
                label={t('documents.fields.sensitivityLevel')}
                value={documentForm.formData.sensitivity || 'normal'}
                onChange={(e) => documentForm.updateField('sensitivity', e.target.value as SensitivityLevel)}
                options={sensitivityOptions}
              />
              {documentForm.formData.sensitivity === 'high' && (
                <div className="mt-2 text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-2">
                  {t('documents.excludedFromExport')}
                </div>
              )}
            </div>
          </div>
        </Modal>
      </div>
        );
      })()}
    </AppLayout>
  );
}
