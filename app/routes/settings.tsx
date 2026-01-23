import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AppLayout } from '~/components/AppLayout';
import { Card } from '~/components/Card';
import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { Modal } from '~/components/Modal';
import { useSession } from '~/lib/session-context';
import { useToast } from '~/lib/toast-context';
import { useLanguage } from '~/lib/language-context';
import { calculatePassphraseStrength } from '~/lib/crypto';
import { CheckCircle2, AlertTriangle, XCircle, Github, Heart } from 'lucide-react';
import { usePlanUpdater } from '~/hooks/usePlanUpdater';

export default function Settings() {
  const { plan, isEncrypted, addEncryption, resetPlan } = useSession();
  const { updatePlan } = usePlanUpdater();
  const { showToast } = useToast();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const [showEncryptionModal, setShowEncryptionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!plan) return null;

  const strength = passphrase ? calculatePassphraseStrength(passphrase) : null;

  const handleAddEncryption = async () => {
    if (passphrase !== confirmPassphrase) {
      setError(t('settings.passphraseMismatch'));
      return;
    }

    if (passphrase.length < 8) {
      setError(t('settings.passphraseMinLength'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      await addEncryption(passphrase);
      setShowEncryptionModal(false);
      setPassphrase('');
      setConfirmPassphrase('');
      showToast(t('settings.encryptionSuccess'), 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('settings.encryptionError'));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEncryptionWarning = async () => {
    const updatedPlan = {
      ...plan,
      preferences: {
        ...plan.preferences,
        showEncryptionWarning: !plan.preferences.showEncryptionWarning,
      },
    };
    await updatePlan(updatedPlan, 'Preference updated');
  };

  const handleDeletePlan = async () => {
    try {
      await resetPlan();
      setShowDeleteModal(false);
      navigate('/');
    } catch (err) {
      showToast(t('settings.deleteFailure'), 'error');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('settings.title')}</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">{t('settings.description')}</p>
        </div>

        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('settings.encryption')}</h2>
          <div className="space-y-4">
            {isEncrypted ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-green-900">{t('settings.encryptionEnabled')}</p>
                    <p className="text-sm text-green-800 mt-1">
                      {t('settings.encryptionEnabledDesc')}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-yellow-900">{t('settings.encryptionDisabled')}</p>
                      <p className="text-sm text-yellow-800 mt-1">
                        {t('settings.encryptionDisabledDesc')}
                      </p>
                    </div>
                  </div>
                </div>
                <Button onClick={() => setShowEncryptionModal(true)} className="bg-green-600 hover:bg-green-700">
                  {t('settings.enableEncryption')}
                </Button>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('settings.preferences')}</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="mb-3">
                <p className="font-medium text-gray-900">{t('settings.language')}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {t('settings.languageDescription')}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setLanguage('en')}
                  className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                    language === 'en'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('es')}
                  className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                    language === 'es'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  Español
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{t('settings.showEncryptionWarning')}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {t('settings.showEncryptionWarningDesc')}
                </p>
              </div>
              <button
                onClick={handleToggleEncryptionWarning}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  plan.preferences.showEncryptionWarning ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    plan.preferences.showEncryptionWarning ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('settings.aboutSupport')}</h2>
          <div className="space-y-4">
            <p className="text-gray-700">
              {t('settings.aboutDescription')}
            </p>

            <div className="space-y-3">
              <a
                href="https://github.com/w0rldart/lifebinder"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
              >
                <Github className="w-6 h-6 text-gray-700" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{t('settings.viewOnGitHub')}</p>
                  <p className="text-sm text-gray-600">{t('settings.viewOnGitHubDesc')}</p>
                </div>
              </a>

              <a
                href="https://github.com/sponsors/w0rldart"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors border border-pink-200"
              >
                <Heart className="w-6 h-6 text-pink-700" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{t('settings.sponsorOnGitHub')}</p>
                  <p className="text-sm text-gray-600">{t('settings.sponsorOnGitHubDesc')}</p>
                </div>
              </a>
            </div>
          </div>
        </Card>

        <Card>
          <div className="border-2 border-red-200 rounded-lg p-6 bg-red-50">
            <h3 className="font-semibold text-red-900 mb-2">{t('settings.dangerZone')}</h3>
            <p className="text-sm text-red-800 mb-4">
              {t('settings.dangerZoneDesc')}
            </p>
            <Button
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {t('settings.deletePlan')}
            </Button>
          </div>
        </Card>
      </div>

      <Modal
        isOpen={showEncryptionModal}
        onClose={() => {
          setShowEncryptionModal(false);
          setPassphrase('');
          setConfirmPassphrase('');
          setError('');
        }}
        title={t('settings.enableEncryptionTitle')}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowEncryptionModal(false);
                setPassphrase('');
                setConfirmPassphrase('');
                setError('');
              }}
            >
              {t('settings.cancel')}
            </Button>
            <Button onClick={handleAddEncryption} disabled={loading}>
              {loading ? t('common.loading') : t('settings.enableEncryption')}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            {t('settings.createPassphrase')}
          </p>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              {error}
            </div>
          )}

          <Input
            label={t('settings.enterPassphrase')}
            type="password"
            value={passphrase}
            onChange={e => setPassphrase(e.target.value)}
            placeholder={t('settings.passphraseHint')}
          />

          {strength && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{t('settings.passphraseStrength')}</span>
                <span className={`font-medium ${
                  strength.score >= 4 ? 'text-green-600' :
                  strength.score >= 3 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {strength.score >= 4 ? t('settings.strengthVeryStrong') :
                   strength.score >= 3 ? t('settings.strengthStrong') :
                   strength.score >= 2 ? t('settings.strengthMedium') :
                   t('settings.strengthWeak')}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    strength.score >= 4 ? 'bg-green-600' :
                    strength.score >= 3 ? 'bg-yellow-600' :
                    'bg-red-600'
                  }`}
                  style={{ width: `${(strength.score / 5) * 100}%` }}
                />
              </div>
            </div>
          )}

          <Input
            label={t('settings.confirmPassphrase')}
            type="password"
            value={confirmPassphrase}
            onChange={e => setConfirmPassphrase(e.target.value)}
            placeholder={t('settings.passphraseHint')}
          />

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 font-medium">
              {t('settings.passphraseWarning')}
            </p>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t('settings.deletePlanTitle')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              {t('settings.cancel')}
            </Button>
            <Button onClick={handleDeletePlan} className="bg-red-600 hover:bg-red-700 text-white">
              {t('settings.deletePlanButton')}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-900">{t('common.warning')}</p>
                <p className="text-sm text-red-800 mt-1">
                  {t('settings.deletePlanConfirm')}
                </p>
              </div>
            </div>
          </div>

          <div className="pl-3">
            <ul className="space-y-1 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">•</span>
                <span>{t('settings.deleteItems.allContactsNotifications')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">•</span>
                <span>{t('settings.deleteItems.accessDevices')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">•</span>
                <span>{t('settings.deleteItems.accountsSubscriptions')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">•</span>
                <span>{t('settings.deleteItems.documentLocations')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">•</span>
                <span>{t('settings.deleteItems.estatePlanning')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">•</span>
                <span>{t('settings.deleteItems.emergencyInfo')}</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 font-medium">
              {t('settings.deleteFinalWarning')}
            </p>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
