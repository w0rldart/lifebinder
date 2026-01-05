import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Plan } from '~/types';
import { encryptPlan, decryptPlan } from './crypto';
import { saveEncryptedPlan, loadEncryptedPlan, savePlainPlan, loadPlainPlan, hasExistingPlan, clearAllData } from './storage';
import { generateDemoData } from './demo-data';

interface SessionContextType {
  plan: Plan | null;
  isLocked: boolean;
  isFirstRun: boolean | null;
  isEncrypted: boolean;
  unlock: (passphrase?: string) => Promise<void>;
  lock: () => void;
  savePlan: (plan: Plan) => Promise<void>;
  createNewPlan: (title: string, passphrase?: string) => Promise<void>;
  createDemoPlan: (passphrase?: string) => Promise<void>;
  addEncryption: (passphrase: string) => Promise<void>;
  resetPlan: () => Promise<void>;
  error: string | null;
  clearError: () => void;
  timeUntilAutoLock: number;
}

const SessionContext = createContext<SessionContextType | null>(null);

const AUTO_LOCK_TIMEOUT = 10 * 60 * 1000;
const COUNTDOWN_START = 60 * 1000;
const ACTIVITY_CHANNEL_NAME = 'lifebinder-activity';

let currentPassphrase: string | null = null;
let activityChannel: BroadcastChannel | null = null;

function createEmptyPlan(title: string, isEncrypted: boolean): Plan {
  return {
    id: crypto.randomUUID(),
    title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isEncrypted,
    preferences: {
      showEncryptionWarning: true,
      autoLockMinutes: 10,
    },
    contacts: [],
    notificationPlan: {
      orderedContactIds: [],
      socialMediaDrafts: [],
      privateMessageDraft: '',
    },
    access: {
      primaryEmails: [],
      passwordManagerNotes: '',
      twoFANotes: '',
      devices: [],
      networkInfrastructure: [],
      iotDevices: [],
    },
    accounts: {
      subscriptions: [],
      cloudServices: [],
      domains: [],
      hosting: [],
      socialMedia: [],
    },
    documents: [],
    physicalSecurity: {
      safes: [],
      cabinets: [],
      securitySystems: [],
      keys: [],
    },
    emergency: {
      meetingLocations: [],
      utilityShutoffNotes: '',
      emergencyContacts: [],
      grabList: [],
      generalNotes: '',
    },
    securityRecovery: {
      securityQuestions: [],
    },
    willTestaments: {
      sensitivity: 'normal',
      willLocation: '',
      trustLocation: '',
      executor: '',
      executorContact: '',
      attorney: '',
      attorneyContact: '',
      accountant: '',
      accountantContact: '',
      estateContacts: [],
      assets: [],
      funeralPreferences: '',
      specialInstructions: '',
      generalNotes: '',
    },
    financial: {
      bankAccounts: [],
      investments: [],
      retirementAccounts: [],
      insurancePolicies: [],
      loansDebts: [],
      creditCards: [],
      safeDepositBoxes: [],
      financialAdvisors: [],
      accountants: [],
      residualIncome: [],
      cryptocurrency: [],
      taxDocuments: [],
    },
    notes: [],
  };
}

function ensurePlanStructure(plan: Plan): Plan {
  const defaults = createEmptyPlan(plan.title || 'My Plan', plan.isEncrypted || false);

  return {
    ...defaults,
    ...plan,
    preferences: {
      ...defaults.preferences,
      ...plan.preferences,
    },
    contacts: plan.contacts || defaults.contacts,
    notificationPlan: {
      ...defaults.notificationPlan,
      ...plan.notificationPlan,
    },
    access: {
      ...defaults.access,
      ...plan.access,
    },
    accounts: {
      ...defaults.accounts,
      ...plan.accounts,
    },
    documents: plan.documents || defaults.documents,
    physicalSecurity: {
      ...defaults.physicalSecurity,
      ...plan.physicalSecurity,
      keys: plan.physicalSecurity?.keys || defaults.physicalSecurity.keys,
    },
    emergency: {
      ...defaults.emergency,
      ...plan.emergency,
    },
    securityRecovery: {
      ...defaults.securityRecovery,
      ...plan.securityRecovery,
    },
    willTestaments: {
      ...defaults.willTestaments,
      ...plan.willTestaments,
    },
    financial: {
      ...defaults.financial,
      ...plan.financial,
    },
    notes: plan.notes || defaults.notes,
  };
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [isLocked, setIsLocked] = useState(true);
  const [isFirstRun, setIsFirstRun] = useState<boolean | null>(null);
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [timeUntilAutoLock, setTimeUntilAutoLock] = useState(AUTO_LOCK_TIMEOUT);

  useEffect(() => {
    checkFirstRun();

    const timeout = setTimeout(() => {
      if (isFirstRun === null) {
        console.warn('checkFirstRun timeout - defaulting to first run');
        setIsFirstRun(true);
        setIsEncrypted(false);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [isFirstRun]);

  const checkFirstRun = async () => {
    try {
      const { exists, isEncrypted: encrypted } = await hasExistingPlan();
      setIsFirstRun(!exists);
      setIsEncrypted(encrypted);
    } catch (error) {
      console.error('Failed to check for existing plan:', error);
      setIsFirstRun(true);
      setIsEncrypted(false);
    }
  };

  const resetActivity = useCallback(() => {
    const now = Date.now();
    setLastActivity(now);

    if (activityChannel) {
      try {
        activityChannel.postMessage({ type: 'activity', timestamp: now });
      } catch (error) {
        console.error('Failed to broadcast activity:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (!isLocked && typeof BroadcastChannel !== 'undefined') {
      try {
        activityChannel = new BroadcastChannel(ACTIVITY_CHANNEL_NAME);

        activityChannel.onmessage = (event) => {
          if (event.data.type === 'activity' && event.data.timestamp) {
            setLastActivity(event.data.timestamp);
          }
        };

        return () => {
          if (activityChannel) {
            activityChannel.close();
            activityChannel = null;
          }
        };
      } catch (error) {
        console.error('Failed to initialize BroadcastChannel:', error);
      }
    }
  }, [isLocked]);

  useEffect(() => {
    if (!isLocked) {
      const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
      events.forEach(event => window.addEventListener(event, resetActivity));
      return () => {
        events.forEach(event => window.removeEventListener(event, resetActivity));
      };
    }
  }, [isLocked, resetActivity]);

  useEffect(() => {
    if (!isLocked) {
      const interval = setInterval(() => {
        const elapsed = Date.now() - lastActivity;
        const remaining = AUTO_LOCK_TIMEOUT - elapsed;

        if (remaining <= 0) {
          lock();
        } else {
          setTimeUntilAutoLock(remaining);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isLocked, lastActivity]);

  const unlock = async (passphrase?: string) => {
    try {
      setError(null);

      if (isEncrypted) {
        if (!passphrase) {
          throw new Error('Passphrase required for encrypted plan');
        }
        const encryptedData = await loadEncryptedPlan();
        if (!encryptedData) {
          throw new Error('No saved plan found');
        }
        const decryptedPlan = await decryptPlan(encryptedData, passphrase);
        const normalizedPlan = ensurePlanStructure(decryptedPlan);
        currentPassphrase = passphrase;
        setPlan(normalizedPlan);
      } else {
        const plainPlan = await loadPlainPlan();
        if (!plainPlan) {
          throw new Error('No saved plan found');
        }
        const normalizedPlan = ensurePlanStructure(plainPlan);
        currentPassphrase = null;
        setPlan(normalizedPlan);
      }

      setIsLocked(false);
      setLastActivity(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlock');
      throw err;
    }
  };

  const lock = () => {
    currentPassphrase = null;
    setPlan(null);
    setIsLocked(true);
    setTimeUntilAutoLock(AUTO_LOCK_TIMEOUT);
  };

  const savePlan = async (updatedPlan: Plan) => {
    try {
      setError(null);
      updatedPlan.updatedAt = new Date().toISOString();

      if (updatedPlan.isEncrypted) {
        if (!currentPassphrase) {
          throw new Error('No passphrase available');
        }
        const encryptedData = await encryptPlan(updatedPlan, currentPassphrase);
        await saveEncryptedPlan(encryptedData);
      } else {
        await savePlainPlan(updatedPlan);
      }

      setPlan(updatedPlan);
      resetActivity();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save plan');
      throw err;
    }
  };

  const createNewPlan = async (title: string, passphrase?: string) => {
    try {
      setError(null);
      const encrypted = !!passphrase;
      const newPlan = createEmptyPlan(title, encrypted);

      if (encrypted && passphrase) {
        const encryptedData = await encryptPlan(newPlan, passphrase);
        await saveEncryptedPlan(encryptedData);
        currentPassphrase = passphrase;
      } else {
        await savePlainPlan(newPlan);
        currentPassphrase = null;
      }

      setPlan(newPlan);
      setIsLocked(false);
      setIsFirstRun(false);
      setIsEncrypted(encrypted);
      setLastActivity(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create plan');
      throw err;
    }
  };

  const createDemoPlan = async (passphrase?: string) => {
    try {
      setError(null);
      const encrypted = !!passphrase;
      const demoPlan = generateDemoData();
      demoPlan.isEncrypted = encrypted;

      if (encrypted && passphrase) {
        const encryptedData = await encryptPlan(demoPlan, passphrase);
        await saveEncryptedPlan(encryptedData);
        currentPassphrase = passphrase;
      } else {
        await savePlainPlan(demoPlan);
        currentPassphrase = null;
      }

      setPlan(demoPlan);
      setIsLocked(false);
      setIsFirstRun(false);
      setIsEncrypted(encrypted);
      setLastActivity(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create demo plan');
      throw err;
    }
  };

  const addEncryption = async (passphrase: string) => {
    try {
      setError(null);
      if (!plan) {
        throw new Error('No plan loaded');
      }
      if (plan.isEncrypted) {
        throw new Error('Plan is already encrypted');
      }

      const updatedPlan = { ...plan, isEncrypted: true };
      const encryptedData = await encryptPlan(updatedPlan, passphrase);
      await saveEncryptedPlan(encryptedData);

      currentPassphrase = passphrase;
      setPlan(updatedPlan);
      setIsEncrypted(true);
      resetActivity();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add encryption');
      throw err;
    }
  };

  const resetPlan = async () => {
    try {
      await clearAllData();
      currentPassphrase = null;
      setPlan(null);
      setIsLocked(true);
      setIsFirstRun(true);
      setIsEncrypted(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset plan');
      throw err;
    }
  };

  const clearError = () => setError(null);

  return (
    <SessionContext.Provider
      value={{
        plan,
        isLocked,
        isFirstRun,
        isEncrypted,
        unlock,
        lock,
        savePlan,
        createNewPlan,
        createDemoPlan,
        addEncryption,
        resetPlan,
        error,
        clearError,
        timeUntilAutoLock,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
