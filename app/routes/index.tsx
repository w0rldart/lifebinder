import { useSession } from '~/lib/session-context';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { calculatePassphraseStrength } from '~/lib/crypto';

export default function Index() {
  const { isLocked, isFirstRun, isEncrypted, unlock, createNewPlan, createDemoPlan, error, clearError } = useSession();
  const navigate = useNavigate();

  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [planTitle, setPlanTitle] = useState('My Life Binder');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [showDemoConfirm, setShowDemoConfirm] = useState(false);
  const [skipEncryption, setSkipEncryption] = useState(false);

  useEffect(() => {
    if (error) {
      setLoading(false);
    }
  }, [error]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLocalError('');
    clearError();

    try {
      await unlock(isEncrypted ? passphrase : undefined);
      navigate('/dashboard');
    } catch (err) {
      setLoading(false);
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!skipEncryption && passphrase) {
      if (passphrase !== confirmPassphrase) {
        setLocalError('Passphrases do not match');
        return;
      }

      if (passphrase.length < 8) {
        setLocalError('Passphrase must be at least 8 characters');
        return;
      }
    }

    if (skipEncryption && passphrase) {
      setLocalError('Cannot set passphrase when skipping encryption. Clear passphrase or uncheck "Skip encryption".');
      return;
    }

    setLoading(true);

    try {
      await createNewPlan(planTitle, skipEncryption ? undefined : passphrase || undefined);
      navigate('/dashboard');
    } catch (err) {
      setLoading(false);
    }
  };

  const handleLoadDemo = async () => {
    if (!showDemoConfirm) {
      setShowDemoConfirm(true);
      return;
    }

    setLocalError('');
    clearError();

    if (!skipEncryption && passphrase && passphrase.length < 8) {
      setLocalError('Passphrase must be at least 8 characters for demo data');
      return;
    }

    if (skipEncryption && passphrase) {
      setLocalError('Cannot set passphrase when skipping encryption. Clear passphrase or uncheck "Skip encryption".');
      return;
    }

    setLoading(true);

    try {
      await createDemoPlan(skipEncryption ? undefined : passphrase || undefined);
      navigate('/dashboard');
    } catch (err) {
      setLoading(false);
    }
  };

  if (isFirstRun === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  const strength = isFirstRun && passphrase ? calculatePassphraseStrength(passphrase) : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="/lifebinder.png"
            alt="Life Binder"
            className="w-64 mx-auto mb-4"
          />
          <p className="text-gray-600">
            {isFirstRun ? 'Create your secure life runbook' : 'Welcome back'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {isFirstRun ? (
            <form onSubmit={handleSetup} className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Create Your Binder
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Your data will be stored locally in your browser.
                </p>
              </div>

              <Input
                label="Binder Title"
                type="text"
                value={planTitle}
                onChange={(e) => setPlanTitle(e.target.value)}
                placeholder="My Life Binder"
                required
              />

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="skipEncryption"
                    checked={skipEncryption}
                    onChange={(e) => {
                      setSkipEncryption(e.target.checked);
                      if (e.target.checked) {
                        setPassphrase('');
                        setConfirmPassphrase('');
                      }
                    }}
                    className="mt-1"
                  />
                  <label htmlFor="skipEncryption" className="text-sm text-gray-700 cursor-pointer flex-1">
                    <span className="font-medium">Skip encryption (not recommended)</span>
                    <p className="text-xs text-gray-600 mt-1">
                      Your data will be stored in plaintext. You can add encryption later.
                    </p>
                  </label>
                </div>

                {skipEncryption && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                    <p className="font-medium mb-1">Warning: No Encryption</p>
                    <p>
                      Your data will be stored without encryption. Anyone with access to your browser storage can read it.
                      It is strongly recommended to add encryption from the settings after setup.
                    </p>
                  </div>
                )}
              </div>

              {!skipEncryption && (
                <>
                  <div>
                    <Input
                      label="Passphrase (Recommended)"
                      type="password"
                      value={passphrase}
                      onChange={(e) => setPassphrase(e.target.value)}
                      placeholder="Enter a strong passphrase"
                    />
                    {strength && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                strength.score <= 3
                                  ? 'bg-red-500'
                                  : strength.score <= 5
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                              }`}
                              style={{ width: `${(strength.score / 7) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {strength.label}
                          </span>
                        </div>
                        {strength.feedback.length > 0 && (
                          <ul className="text-xs text-gray-600 space-y-1 mt-2">
                            {strength.feedback.map((fb, i) => (
                              <li key={i}>• {fb}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>

                  {passphrase && (
                    <Input
                      label="Confirm Passphrase"
                      type="password"
                      value={confirmPassphrase}
                      onChange={(e) => setConfirmPassphrase(e.target.value)}
                      placeholder="Re-enter your passphrase"
                    />
                  )}
                </>
              )}

              {(localError || error) && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {localError || error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Binder'}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">OR</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  type="button"
                  onClick={handleLoadDemo}
                  className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300"
                  disabled={loading}
                >
                  Load Demo Data
                </Button>

                {showDemoConfirm && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                    <p className="font-medium mb-1">Confirm Demo Data</p>
                    <p className="mb-2">
                      This will create a binder pre-filled with example data for testing.
                      You can edit or delete this data later.
                    </p>
                    <p className="text-xs">
                      Make sure you've entered a passphrase above, then click "Load Demo Data" again to confirm.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                <strong>Important:</strong> Your passphrase cannot be recovered if lost. Store it securely.
              </div>
            </form>
          ) : (
            <form onSubmit={handleUnlock} className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Unlock Your Binder
                </h2>
                <p className="text-sm text-gray-600">
                  {isEncrypted
                    ? 'Enter your passphrase to access your encrypted data.'
                    : 'Your binder is not encrypted. Click unlock to access your data.'}
                </p>
              </div>

              {isEncrypted && (
                <Input
                  label="Passphrase"
                  type="password"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Enter your passphrase"
                  autoFocus
                  required
                />
              )}

              {!isEncrypted && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                  <p className="font-medium mb-1">Warning: No Encryption</p>
                  <p>
                    Your data is not encrypted. Consider adding encryption from the settings after unlocking.
                  </p>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Unlocking...' : 'Unlock'}
              </Button>
            </form>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Your data is encrypted and stored locally in your browser.
          </p>
          <p className="mt-1">
            No data is sent to any server.
          </p>
        </div>
      </div>
    </div>
  );
}
