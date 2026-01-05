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
import type { SecurityQuestion } from '~/types';
import { Edit2, Trash2 } from 'lucide-react';

export default function SecurityRecovery() {
  const { plan } = useSession();
  const { updatePlan } = usePlanUpdater();

  const questionForm = useModalForm<Partial<SecurityQuestion>>({ question: '', answer: '', notes: '' });

  const handleSaveQuestion = async () => {
    if (!plan || !questionForm.formData.question) return;
    const updated = questionForm.editingItem
      ? plan.securityRecovery.securityQuestions.map(q => q.id === questionForm.editingItem!.id ? { ...questionForm.formData, id: q.id } as SecurityQuestion : q)
      : [...plan.securityRecovery.securityQuestions, { ...questionForm.formData, id: crypto.randomUUID() } as SecurityQuestion];
    await updatePlan({ ...plan, securityRecovery: { ...plan.securityRecovery, securityQuestions: updated } }, 'Security question saved');
    questionForm.closeModal();
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!plan || !confirm('Delete this security question?')) return;
    const updated = plan.securityRecovery.securityQuestions.filter(q => q.id !== id);
    await updatePlan({ ...plan, securityRecovery: { ...plan.securityRecovery, securityQuestions: updated } }, 'Security question deleted');
  };

  return (
    <AppLayout>
      {plan && (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Security Recovery</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Account recovery security questions and answers
          </p>
        </div>

        <WarningBanner type="warning">
          <strong>High Sensitivity:</strong> This information can be used to access your accounts. Store this section securely and consider excluding it from exports shared with others.
        </WarningBanner>

        <Card title="Security Questions" action={<Button onClick={() => questionForm.openModal()}>Add Question</Button>}>
          <p className="text-sm text-gray-600 mb-4">
            Document security questions and answers used for account recovery
          </p>
          <div className="space-y-3">
            {plan.securityRecovery.securityQuestions.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No security questions added yet</p>
            ) : (
              plan.securityRecovery.securityQuestions.map(question => (
                <div key={question.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{question.question}</div>
                    <div className="text-sm text-gray-600 mt-1">Answer: {question.answer}</div>
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

        <Modal isOpen={questionForm.isModalOpen} onClose={questionForm.closeModal} title={questionForm.editingItem ? 'Edit Security Question' : 'Add Security Question'} footer={<><Button variant="secondary" onClick={questionForm.closeModal}>Cancel</Button><Button onClick={handleSaveQuestion} disabled={!questionForm.formData.question?.trim()}>Save</Button></>}>
          <div className="space-y-4">
            <Input label="Security Question" value={questionForm.formData.question || ''} onChange={(e) => questionForm.updateField('question', e.target.value)} placeholder="e.g., What is your mother's maiden name?" required />
            <Input label="Answer" value={questionForm.formData.answer || ''} onChange={(e) => questionForm.updateField('answer', e.target.value)} placeholder="Your answer" />
            <TextArea label="Notes" value={questionForm.formData.notes || ''} onChange={(e) => questionForm.updateField('notes', e.target.value)} placeholder="Which accounts use this question" rows={2} />
          </div>
        </Modal>
      </div>
      )}
    </AppLayout>
  );
}
