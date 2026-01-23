import { useState } from 'react';
import { AppLayout } from '~/components/AppLayout';
import { Card } from '~/components/Card';
import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { Modal } from '~/components/Modal';
import { WarningBanner } from '~/components/WarningBanner';
import { useSession } from '~/lib/session-context';
import { useLanguage } from '~/lib/language-context';
import { encryptPlan, decryptPlan } from '~/lib/crypto';
import { generatePDF } from '~/lib/pdf-generator';
import type { EncryptedData, Plan } from '~/types';

import { AlertTriangle } from 'lucide-react';

export default function Export() {
  const { plan, savePlan } = useSession();
  const { t } = useLanguage();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [exportPassphrase, setExportPassphrase] = useState('');
  const [importPassphrase, setImportPassphrase] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [includeHighSensitivity, setIncludeHighSensitivity] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validatePlanSchema = (data: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!data || typeof data !== 'object') {
      return { valid: false, errors: ['Invalid plan data: not an object'] };
    }

    const requiredFields = ['id', 'title', 'createdAt', 'updatedAt', 'contacts', 'notificationPlan', 'access', 'accounts', 'documents', 'emergency'];

    for (const field of requiredFields) {
      if (!(field in data)) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    if (!('willTestaments' in data) && !('estatePlanning' in data)) {
      errors.push('Missing required field: willTestaments or estatePlanning');
    }

    if (data.contacts && !Array.isArray(data.contacts)) {
      errors.push('Invalid contacts: must be an array');
    }

    if (data.notificationPlan && typeof data.notificationPlan !== 'object') {
      errors.push('Invalid notificationPlan: must be an object');
    }

    if (data.notificationPlan && !('orderedContactIds' in data.notificationPlan)) {
      errors.push('Invalid notificationPlan: missing orderedContactIds');
    }

    if (data.access && typeof data.access !== 'object') {
      errors.push('Invalid access: must be an object');
    }

    if (data.accounts && typeof data.accounts !== 'object') {
      errors.push('Invalid accounts: must be an object');
    }

    if (data.documents && !Array.isArray(data.documents)) {
      errors.push('Invalid documents: must be an array');
    }

    if (data.emergency && typeof data.emergency !== 'object') {
      errors.push('Invalid emergency: must be an object');
    }

    if (data.willTestaments && typeof data.willTestaments !== 'object') {
      errors.push('Invalid willTestaments: must be an object');
    }

    if (data.estatePlanning && typeof data.estatePlanning !== 'object') {
      errors.push('Invalid estatePlanning: must be an object');
    }

    return { valid: errors.length === 0, errors };
  };

  const handleExportEncryptedJSON = async () => {
    if (!exportPassphrase) {
      setError(t('export.errors.passphraseRequired'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (!plan) return;
      const encryptedData = await encryptPlan(plan, exportPassphrase);
      const jsonData = JSON.stringify({
        version: 1,
        exportedAt: new Date().toISOString(),
        data: encryptedData,
      }, null, 2);

      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const timestamp = new Date().toISOString().split('T')[0];
      a.download = `lifebinder-encrypted-${timestamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccess(t('export.success.encryptedExported'));
      setIsExportModalOpen(false);
      setExportPassphrase('');
    } catch (err) {
      setError(t('export.errors.exportFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    try {
      if (!plan) return;
      generatePDF(plan, includeHighSensitivity);
      setSuccess(t('export.success.pdfExported'));
    } catch (err) {
      setError(t('export.errors.pdfFailed'));
    }
  };

  const handleImport = async () => {
    if (!importFile || !importPassphrase) {
      setError(t('export.errors.importFileMissing'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const fileContent = await importFile.text();
      const jsonData = JSON.parse(fileContent);

      if (!jsonData.data || !jsonData.data.encrypted) {
        throw new Error(t('export.errors.invalidBackupFormat'));
      }

      const encryptedData: EncryptedData = jsonData.data;
      const importedPlan = await decryptPlan(encryptedData, importPassphrase);

      const validation = validatePlanSchema(importedPlan);
      if (!validation.valid) {
        throw new Error(`Invalid plan data:\n${validation.errors.join('\n')}`);
      }

      if (!confirm(t('export.replaceConfirm'))) {
        setLoading(false);
        return;
      }

      await savePlan(importedPlan as Plan);
      setSuccess(t('export.importSuccess'));
      setIsImportModalOpen(false);
      setImportPassphrase('');
      setImportFile(null);
    } catch (err) {
      if (err instanceof Error && err.message.includes('Invalid plan data')) {
        setError(err.message);
      } else if (err instanceof Error && err.message.includes(t('export.errors.invalidBackupFormat'))) {
        setError(err.message);
      } else if (err instanceof SyntaxError) {
        setError(t('export.errors.invalidJSON'));
      } else {
        setError(err instanceof Error ? err.message : t('export.errors.importError'));
      }
    } finally {
      setLoading(false);
    }
  };

  const highSensitivityCount = plan?.documents.filter(d => d.sensitivity === 'high').length || 0;

  return (
    <AppLayout>
      {plan && (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t('export.title')}</h1>
          <p className="text-sm sm:text-base text-gray-600">
            {t('export.description')}
          </p>
        </div>

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            {success}
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        <Card title={t('export.pdfExport')}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {t('export.pdfDescription')}
            </p>

            <WarningBanner type="info">
              <strong>{t('export.whatsIncluded')}</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>{t('export.includeItem1')}</li>
                <li>{t('export.includeItem2')}</li>
                <li>{t('export.includeItem3')}</li>
                <li>{t('export.includeItem4')}</li>
                <li>{t('export.includeItem5')}</li>
                <li>{t('export.includeItem6')}</li>
              </ul>
            </WarningBanner>

            {highSensitivityCount > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-yellow-800">
                      <strong>{highSensitivityCount}</strong> {highSensitivityCount !== 1 ? t('export.highSensitivityDocsPlural') : t('export.highSensitivityDocs')} {t('export.willBeExcluded')}
                    </p>
                    <label className="flex items-center gap-2 mt-3">
                      <input
                        type="checkbox"
                        checked={includeHighSensitivity}
                        onChange={(e) => setIncludeHighSensitivity(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">
                        {t('export.includeHighSensitivity')}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            <Button onClick={handleExportPDF} className="w-full">
              {t('export.generatePDF')}
            </Button>
          </div>
        </Card>

        <Card title={t('export.encryptedBackup')}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {t('export.encryptedDescription')}
            </p>

            <WarningBanner type="warning">
              <strong>{t('export.encryptedFileWarning')}</strong> {t('export.encryptedFileWarningText')}
            </WarningBanner>

            <Button onClick={() => { setIsExportModalOpen(true); setExportPassphrase(''); setError(''); setSuccess(''); }} className="w-full">
              {t('export.createBackup')}
            </Button>
          </div>
        </Card>

        <Card title={t('export.importBackup')}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {t('export.importDescription')}
            </p>

            <WarningBanner type="error">
              <strong>{t('export.importWarningShort')}</strong> {t('export.importWarningTextShort')}
            </WarningBanner>

            <Button onClick={() => { setIsImportModalOpen(true); setImportPassphrase(''); setImportFile(null); setError(''); setSuccess(''); }} variant="secondary" className="w-full">
              {t('export.selectBackupFile')}
            </Button>
          </div>
        </Card>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">{t('export.recommendations.title')}</h3>
          <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
            <li>{t('export.recommendations.item1')}</li>
            <li>{t('export.recommendations.item2')}</li>
            <li>{t('export.recommendations.item3')}</li>
            <li>{t('export.recommendations.item4')}</li>
            <li>{t('export.recommendations.item5')}</li>
          </ul>
        </div>

        <Modal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          title={t('export.modal.exportTitle')}
          footer={
            <>
              <Button variant="secondary" onClick={() => setIsExportModalOpen(false)}>
                {t('export.modal.cancel')}
              </Button>
              <Button onClick={handleExportEncryptedJSON} disabled={loading}>
                {loading ? t('export.modal.exporting') : t('export.modal.export')}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {t('export.modal.exportDescription')}
            </p>

            <Input
              label={t('export.modal.exportPassphraseLabel')}
              type="password"
              value={exportPassphrase}
              onChange={(e) => setExportPassphrase(e.target.value)}
              placeholder={t('export.modal.exportPassphrasePlaceholder')}
              helpText={t('export.modal.exportPassphraseHelp')}
              required
            />

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}
          </div>
        </Modal>

        <Modal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          title={t('export.modal.importTitle')}
          footer={
            <>
              <Button variant="secondary" onClick={() => setIsImportModalOpen(false)}>
                {t('export.modal.cancel')}
              </Button>
              <Button onClick={handleImport} disabled={loading || !importFile}>
                {loading ? t('export.modal.importing') : t('export.modal.import')}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('export.modal.backupFileLabel')}
              </label>
              <input
                type="file"
                accept=".json"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <Input
              label={t('export.modal.passphraseLabel')}
              type="password"
              value={importPassphrase}
              onChange={(e) => setImportPassphrase(e.target.value)}
              placeholder={t('export.modal.passphrasePlaceholder')}
              required
            />

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <WarningBanner type="error">
              <strong>{t('export.modal.importWarning')}</strong> {t('export.modal.importWarningText')}
            </WarningBanner>
          </div>
        </Modal>
      </div>
      )}
    </AppLayout>
  );
}
