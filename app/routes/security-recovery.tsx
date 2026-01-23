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
import type { SecurityQuestion } from '~/types';
import { Edit2, Trash2 } from 'lucide-react';

export default function SecurityRecovery() {
  const { plan } = useSession();
  const { updatePlan } = usePlanUpdater();
  const { t } = useLanguage();

  const questionForm = useModalForm<Partial<SecurityQuestion>>({ question: '', answer: '', notes: '' });

  const handleSaveQuestion = async () => {
    if (!plan || !questionForm.formData.question) return;
    const updated = questionForm.editingItem
      ? plan.securityRecovery.securityQuestions.map(q => q.id === questionForm.editingItem!.id ? { ...questionForm.formData, id: q.id } as SecurityQuestion : q)
      : [...plan.securityRecovery.securityQuestions, { ...questionForm.formData, id: crypto.randomUUID() } as SecurityQuestion];
    await updatePlan({ ...plan, securityRecovery: { ...plan.securityRecovery, securityQuestions: updated } }, t('securityRecovery.questionSaved'));
    questionForm.closeModal();
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!plan || !confirm(t('securityRecovery.deleteConfirm'))) return;
    const updated = plan.securityRecovery.securityQuestions.filter(q => q.id !== id);
    await updatePlan({ ...plan, securityRecovery: { ...plan.securityRecovery, securityQuestions: updated } }, t('securityRecovery.questionDeleted'));
  };

  return (
    <AppLayout>
      {plan && (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t('securityRecovery.title')}</h1>
          <p className="text-sm sm:text-base text-gray-600">
            {t('securityRecovery.description')}
          </p>
        </div>

        <WarningBanner type="warning">
          <strong>{t('securityRecovery.highSensitivity')}</strong> {t('securityRecovery.highSensitivityText')}
        </WarningBanner>

        <Card title={t('securityRecovery.securityQuestions')} action={<Button onClick={() => questionForm.openModal()}>{t('securityRecovery.addQuestion')}</Button>}>
          <p className="text-sm text-gray-600 mb-4">
            {t('securityRecovery.securityQuestionsDescription')}
          </p>
          <div className="space-y-3">
            {plan.securityRecovery.securityQuestions.length === 0 ? (
              <p className="text-gray-500 text-sm italic">{t('securityRecovery.noQuestionsYet')}</p>
            ) : (
              plan.securityRecovery.securityQuestions.map(question => (
                <div key={question.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{question.question}</div>
                    <div className="text-sm text-gray-600 mt-1">{t('securityRecovery.answerLabel')} {question.answer}</div>
                    {question.notes && <div className="text-sm text-gray-500 mt-1">{question.notes}</div>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => questionForm.openModal(question)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDeleteQuestion(question.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Modal
          isOpen={questionForm.isModalOpen}
          onClose={questionForm.closeModal}
          title={questionForm.editingItem ? t('securityRecovery.editQuestion') : t('securityRecovery.addQuestion')}
          footer={
            <>
              <Button variant="secondary" onClick={questionForm.closeModal}>{t('common.cancel')}</Button>
              <Button onClick={handleSaveQuestion} disabled={!questionForm.formData.question?.trim()}>{t('common.save')}</Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input
              label={t('securityRecovery.fields.securityQuestion')}
              value={questionForm.formData.question || ''}
              onChange={(e) => questionForm.updateField('question', e.target.value)}
              placeholder={t('securityRecovery.fields.questionPlaceholder')}
              required
            />
            <Input
              label={t('securityRecovery.fields.answer')}
              value={questionForm.formData.answer || ''}
              onChange={(e) => questionForm.updateField('answer', e.target.value)}
              placeholder={t('securityRecovery.fields.answerPlaceholder')}
            />
            <TextArea
              label={t('contacts.notes')}
              value={questionForm.formData.notes || ''}
              onChange={(e) => questionForm.updateField('notes', e.target.value)}
              placeholder={t('securityRecovery.fields.notesPlaceholder')}
              rows={2}
            />
          </div>
        </Modal>
      </div>
      )}
    </AppLayout>
  );
}
