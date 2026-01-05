import { useState } from 'react';
import { AppLayout } from '~/components/AppLayout';
import { Card } from '~/components/Card';
import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { Modal } from '~/components/Modal';
import { WarningBanner } from '~/components/WarningBanner';
import { useSession } from '~/lib/session-context';
import { encryptPlan, decryptPlan } from '~/lib/crypto';
import { generatePDF } from '~/lib/pdf-generator';
import type { EncryptedData, Plan } from '~/types';

import { AlertTriangle } from 'lucide-react';

export default function Export() {
  const { plan, savePlan } = useSession();
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
      setError('Passphrase is required');
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

      setSuccess('Encrypted backup exported successfully');
      setIsExportModalOpen(false);
      setExportPassphrase('');
    } catch (err) {
      setError('Failed to export encrypted backup');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    try {
      if (!plan) return;
      generatePDF(plan, includeHighSensitivity);
      setSuccess('PDF exported successfully');
    } catch (err) {
      setError('Failed to generate PDF');
    }
  };

  const handleImport = async () => {
    if (!importFile || !importPassphrase) {
      setError('Please select a file and enter the passphrase');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const fileContent = await importFile.text();
      const jsonData = JSON.parse(fileContent);

      if (!jsonData.data || !jsonData.data.encrypted) {
        throw new Error('Invalid backup file format. This does not appear to be a valid Life Binder backup.');
      }

      const encryptedData: EncryptedData = jsonData.data;
      const importedPlan = await decryptPlan(encryptedData, importPassphrase);

      const validation = validatePlanSchema(importedPlan);
      if (!validation.valid) {
        throw new Error(`Invalid plan data:\n${validation.errors.join('\n')}`);
      }

      if (!confirm('This will replace your current plan. Are you sure?')) {
        setLoading(false);
        return;
      }

      await savePlan(importedPlan as Plan);
      setSuccess('Plan imported successfully');
      setIsImportModalOpen(false);
      setImportPassphrase('');
      setImportFile(null);
    } catch (err) {
      if (err instanceof Error && err.message.includes('Invalid plan data')) {
        setError(err.message);
      } else if (err instanceof Error && err.message.includes('Invalid backup file format')) {
        setError(err.message);
      } else if (err instanceof SyntaxError) {
        setError('Invalid JSON file. The file appears to be corrupted or not a valid backup.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to import. Check your passphrase and try again.');
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Export & Backup</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Export your binder for backup or sharing
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

        <Card title="PDF Export">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Generate a print-friendly PDF of your Life Binder runbook. Perfect for sharing with trusted individuals.
            </p>

            <WarningBanner type="info">
              <strong>What's included:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>First 24 Hours action checklist</li>
                <li>Priority contacts to notify</li>
                <li>Access information (emails, password manager location, 2FA notes)</li>
                <li>Critical accounts and billing warnings</li>
                <li>Document locations</li>
                <li>Emergency plan and contacts</li>
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
                      <strong>{highSensitivityCount}</strong> high-sensitivity document{highSensitivityCount !== 1 ? 's' : ''} will be excluded by default
                    </p>
                    <label className="flex items-center gap-2 mt-3">
                      <input
                        type="checkbox"
                        checked={includeHighSensitivity}
                        onChange={(e) => setIncludeHighSensitivity(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">
                        Include high-sensitivity documents in PDF
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            <Button onClick={handleExportPDF} className="w-full">
              Generate PDF
            </Button>
          </div>
        </Card>

        <Card title="Encrypted JSON Backup">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Export an encrypted backup of your entire plan. Use this for secure backups or to transfer between devices.
            </p>

            <WarningBanner type="warning">
              <strong>Important:</strong> The exported file is encrypted with a passphrase. You can use the same passphrase as your main binder or create a different one for additional security.
            </WarningBanner>

            <Button onClick={() => { setIsExportModalOpen(true); setExportPassphrase(''); setError(''); setSuccess(''); }} className="w-full">
              Export Encrypted Backup
            </Button>
          </div>
        </Card>

        <Card title="Import Backup">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Restore your binder from an encrypted backup file.
            </p>

            <WarningBanner type="error">
              <strong>Warning:</strong> Importing will replace your current plan with the backup. Make sure to export your current plan first if needed.
            </WarningBanner>

            <Button onClick={() => { setIsImportModalOpen(true); setImportPassphrase(''); setImportFile(null); setError(''); setSuccess(''); }} variant="secondary" className="w-full">
              Import from Backup
            </Button>
          </div>
        </Card>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Backup Recommendations</h3>
          <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
            <li>Export encrypted backups regularly (at least monthly)</li>
            <li>Store backups in multiple secure locations (cloud storage, USB drive, etc.)</li>
            <li>Generate PDF exports to share with trusted individuals</li>
            <li>Keep your passphrases secure and accessible to trusted contacts</li>
            <li>Review and update your binder after major life changes</li>
          </ul>
        </div>

        <Modal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          title="Export Encrypted Backup"
          footer={
            <>
              <Button variant="secondary" onClick={() => setIsExportModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleExportEncryptedJSON} disabled={loading}>
                {loading ? 'Exporting...' : 'Export'}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Enter a passphrase to encrypt the backup. You'll need this passphrase to import the backup later.
            </p>

            <Input
              label="Export Passphrase"
              type="password"
              value={exportPassphrase}
              onChange={(e) => setExportPassphrase(e.target.value)}
              placeholder="Enter a strong passphrase"
              helpText="Can be the same or different from your main binder passphrase"
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
          title="Import from Backup"
          footer={
            <>
              <Button variant="secondary" onClick={() => setIsImportModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={loading || !importFile}>
                {loading ? 'Importing...' : 'Import'}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Backup File
              </label>
              <input
                type="file"
                accept=".json"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <Input
              label="Passphrase"
              type="password"
              value={importPassphrase}
              onChange={(e) => setImportPassphrase(e.target.value)}
              placeholder="Enter the backup passphrase"
              required
            />

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <WarningBanner type="error">
              <strong>Warning:</strong> This will replace your current plan. This action cannot be undone.
            </WarningBanner>
          </div>
        </Modal>
      </div>
      )}
    </AppLayout>
  );
}
