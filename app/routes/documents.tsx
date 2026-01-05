import { AppLayout } from '~/components/AppLayout';
import { Card } from '~/components/Card';
import { Button } from '~/components/Button';
import { Modal } from '~/components/Modal';
import { Input } from '~/components/Input';
import { TextArea } from '~/components/TextArea';
import { Select } from '~/components/Select';
import { WarningBanner } from '~/components/WarningBanner';
import { useSession } from '~/lib/session-context';
import { useModalForm } from '~/hooks/useModalForm';
import { usePlanUpdater } from '~/hooks/usePlanUpdater';
import type { Document, LocationType, SensitivityLevel } from '~/types';
import { Edit2, Trash2 } from 'lucide-react';

export default function Documents() {
  const { plan } = useSession();
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
    await updatePlan(updatedPlan, documentForm.editingItem ? 'Document updated successfully' : 'Document added successfully');
    documentForm.closeModal();
  };

  const handleDelete = async (id: string) => {
    if (!plan || !confirm('Delete this document entry?')) return;

    const updatedDocs = plan.documents.filter(d => d.id !== id);
    const updatedPlan = { ...plan, documents: updatedDocs };
    await updatePlan(updatedPlan, 'Document deleted successfully');
  };

  const locationOptions = [
    { value: 'physical', label: 'Physical' },
    { value: 'digital', label: 'Digital' },
    { value: 'both', label: 'Both' },
  ];

  const sensitivityOptions = [
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High Sensitivity' },
  ];

  return (
    <AppLayout>
      {plan && (() => {
        const normalDocs = plan.documents.filter(d => d.sensitivity === 'normal');
        const highSensitivityDocs = plan.documents.filter(d => d.sensitivity === 'high');

        return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Documents</h1>
          <p className="text-sm sm:text-base text-gray-600">Track important document locations</p>
        </div>

        <WarningBanner type="warning">
          <strong>Security Reminder:</strong> Avoid storing actual passwords or safe combinations here. Just note the location of documents. High sensitivity documents are excluded from PDF exports by default.
        </WarningBanner>

        <Card title="Documents" action={<Button onClick={() => documentForm.openModal()}>Add Document</Button>}>
          {plan.documents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No documents added yet</p>
              <Button onClick={() => documentForm.openModal()}>Add Your First Document</Button>
            </div>
          ) : (
            <div className="space-y-6">
              {normalDocs.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Normal Documents</h3>
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
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">High Sensitivity Documents</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3 text-sm text-yellow-800">
                    <strong>Note:</strong> These documents will be excluded from PDF exports by default
                  </div>
                  <div className="space-y-3">
                    {highSensitivityDocs.map(doc => (
                      <div key={doc.id} className="flex items-start justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-medium text-gray-900">{doc.title}</div>
                            <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">High Sensitivity</span>
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
          title={documentForm.editingItem ? 'Edit Document' : 'Add Document'}
          footer={
            <>
              <Button variant="secondary" onClick={documentForm.closeModal}>Cancel</Button>
              <Button onClick={handleSave} disabled={!documentForm.formData.title?.trim()}>Save</Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input
              label="Document Title"
              value={documentForm.formData.title || ''}
              onChange={(e) => documentForm.updateField('title', e.target.value)}
              placeholder="e.g., Will, Birth Certificate, Property Deed"
              required
            />

            <Select
              label="Location Type"
              value={documentForm.formData.locationType || 'physical'}
              onChange={(e) => documentForm.updateField('locationType', e.target.value as LocationType)}
              options={locationOptions}
            />

            <Input
              label="Location"
              value={documentForm.formData.location || ''}
              onChange={(e) => documentForm.updateField('location', e.target.value)}
              placeholder="e.g., Safe in bedroom closet, Google Drive folder"
            />

            <TextArea
              label="Details"
              value={documentForm.formData.details || ''}
              onChange={(e) => documentForm.updateField('details', e.target.value)}
              placeholder="Additional location details or instructions..."
            />

            <TextArea
              label="Notes"
              value={documentForm.formData.notes || ''}
              onChange={(e) => documentForm.updateField('notes', e.target.value)}
              placeholder="Any other important information..."
            />

            <div>
              <Select
                label="Sensitivity Level"
                value={documentForm.formData.sensitivity || 'normal'}
                onChange={(e) => documentForm.updateField('sensitivity', e.target.value as SensitivityLevel)}
                options={sensitivityOptions}
              />
              {documentForm.formData.sensitivity === 'high' && (
                <div className="mt-2 text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-2">
                  This document will be excluded from PDF exports by default
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
