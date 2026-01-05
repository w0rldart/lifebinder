import { Link, useLocation, useNavigate } from 'react-router';
import { useSession } from '~/lib/session-context';
import { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { calculatePassphraseStrength } from '~/lib/crypto';
import { Lock, AlertTriangle, Info, LayoutDashboard, Users, Key, CreditCard, FileText, Shield, KeyRound, Scale, DollarSign, AlertCircle, StickyNote, Package, BookOpen, Settings, Menu, X } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isLocked, lock, timeUntilAutoLock, plan, isEncrypted, addEncryption, resetPlan } = useSession();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showEncryptionModal, setShowEncryptionModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLocked || !plan) {
      navigate('/');
    }
  }, [isLocked, plan, navigate]);

  const handleLock = () => {
    lock();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/contacts', label: 'Contacts', icon: Users },
    { path: '/access', label: 'Access', icon: Key },
    { path: '/accounts', label: 'Accounts', icon: CreditCard },
    { path: '/documents', label: 'Documents', icon: FileText },
    { path: '/physical-security', label: 'Physical Security', icon: Shield },
    { path: '/security-recovery', label: 'Security Recovery', icon: KeyRound },
    { path: '/will-testaments', label: 'Will & Testaments', icon: Scale },
    { path: '/financial', label: 'Financial', icon: DollarSign },
    { path: '/emergency', label: 'Emergency', icon: AlertCircle },
    { path: '/notes', label: 'Notes', icon: StickyNote },
    { path: '/export', label: 'Export', icon: Package },
    { path: '/help', label: 'Help & Guide', icon: BookOpen },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const minutesRemaining = Math.ceil(timeUntilAutoLock / 1000 / 60);
  const showWarning = timeUntilAutoLock < 60000;

  const handleAddEncryption = async () => {
    if (passphrase !== confirmPassphrase) {
      setError('Passphrases do not match');
      return;
    }

    if (passphrase.length < 8) {
      setError('Passphrase must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await addEncryption(passphrase);
      setShowEncryptionModal(false);
      setPassphrase('');
      setConfirmPassphrase('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add encryption');
    } finally {
      setLoading(false);
    }
  };

  const strength = passphrase ? calculatePassphraseStrength(passphrase) : null;

  const handleResetPlan = async () => {
    try {
      await resetPlan();
      setShowResetModal(false);
      navigate('/');
    } catch (err) {
      console.error('Failed to reset plan:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
              <img
                src="/lifebinder-without-text.png"
                alt="Life Binder"
                className="h-8 sm:h-10 w-auto flex-shrink-0"
              />
              <span className="text-lg sm:text-xl font-bold text-gray-900 truncate">Life Binder</span>
              {showWarning && (
                <span className="hidden sm:inline text-sm text-yellow-600 font-medium whitespace-nowrap">
                  Auto-lock in {minutesRemaining} min
                </span>
              )}
            </div>
            <button
              onClick={handleLock}
              className="px-3 py-2 sm:px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 flex-shrink-0"
            >
              <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Lock</span>
            </button>
          </div>
        </div>
      </header>

      {!isEncrypted && plan?.preferences.showEncryptionWarning && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
              <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-yellow-800">
                    Your data is not encrypted
                  </p>
                  <p className="text-xs text-yellow-700 mt-1 hidden sm:block">
                    Anyone with access to your browser storage can read your data. Go to Settings to enable encryption.
                  </p>
                </div>
              </div>
              <Link
                to="/settings"
                className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-center sm:text-left"
              >
                Settings
              </Link>
            </div>
          </div>
        </div>
      )}

      {plan?.title.includes('Demo') && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
              <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-800">
                    You are viewing demo data
                  </p>
                  <p className="text-xs text-blue-700 mt-1 hidden sm:block">
                    This is sample data for testing purposes. Replace it with your real information.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setShowResetModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 whitespace-nowrap"
              >
                Reset Plan
              </Button>
            </div>
          </div>
        </div>
      )}

      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <nav className="fixed top-0 left-0 bottom-0 w-64 bg-white shadow-xl z-40 lg:hidden overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <span className="font-semibold text-gray-900">Menu</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <ul className="p-4 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <>
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                    {item.path === '/notes' && (
                      <li key="separator" className="py-2">
                        <div className="border-t border-gray-200" />
                      </li>
                    )}
                  </>
                );
              })}
            </ul>
          </nav>
        </>
      )}

      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex gap-8">
          <nav className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow p-4 sticky top-24">
              <ul className="space-y-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <>
                      <li key={item.path}>
                        <Link
                          to={item.path}
                          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                            isActive
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </Link>
                      </li>
                      {item.path === '/notes' && (
                        <li key="separator" className="py-2">
                          <div className="border-t border-gray-200" />
                        </li>
                      )}
                    </>
                  );
                })}
              </ul>
            </div>
          </nav>

          <main className="flex-1 min-w-0 w-full lg:w-auto">
            {children}
          </main>
        </div>
      </div>

      <Modal
        isOpen={showEncryptionModal}
        onClose={() => {
          setShowEncryptionModal(false);
          setPassphrase('');
          setConfirmPassphrase('');
          setError('');
        }}
        title="Add Encryption"
      >
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            <p className="font-medium mb-2">Protect Your Data</p>
            <p>
              Adding encryption will secure your data with a passphrase. Once encrypted, you'll need to enter your passphrase each time you unlock the binder.
            </p>
            <p className="mt-2 font-medium">
              Important: Your passphrase cannot be recovered if lost. Store it securely.
            </p>
          </div>

          <div>
            <Input
              label="New Passphrase"
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

          <Input
            label="Confirm Passphrase"
            type="password"
            value={confirmPassphrase}
            onChange={(e) => setConfirmPassphrase(e.target.value)}
            placeholder="Re-enter your passphrase"
          />

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              onClick={() => {
                setShowEncryptionModal(false);
                setPassphrase('');
                setConfirmPassphrase('');
                setError('');
              }}
              className="bg-gray-200 text-gray-700 hover:bg-gray-300"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddEncryption}
              disabled={loading || !passphrase || !confirmPassphrase}
            >
              {loading ? 'Adding Encryption...' : 'Add Encryption'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Reset Plan"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            <p className="font-medium mb-2">Warning: This cannot be undone</p>
            <p>
              This will permanently delete all your data and return you to the welcome screen. You will need to create a new plan or import an existing one.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              onClick={() => setShowResetModal(false)}
              className="bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleResetPlan}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Reset Plan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
