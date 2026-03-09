import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Settings from '~/routes/settings';

// Mock heavy dependencies so we only test the component logic
vi.mock('~/components/AppLayout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="layout">{children}</div>
}));

vi.mock('react-router', () => ({
  useNavigate: () => vi.fn()
}));

const mockSetLanguage = vi.fn();

vi.mock('~/lib/language-context', () => ({
  useLanguage: () => ({
    language: 'en',
    setLanguage: mockSetLanguage,
    t: (key: string) => key
  })
}));

vi.mock('~/lib/session-context', () => ({
  useSession: () => ({
    plan: {
      version: 1,
      id: 'test',
      preferences: {
        showEncryptionWarning: true,
        auditLogRetention: 'all'
      }
    },
    isEncrypted: false,
    addEncryption: vi.fn(),
    resetPlan: vi.fn()
  })
}));

vi.mock('~/hooks/usePlanUpdater', () => ({
  usePlanUpdater: () => ({
    updatePlan: vi.fn()
  })
}));

vi.mock('~/lib/toast-context', () => ({
  useToast: () => ({
    showToast: vi.fn()
  })
}));

describe('Settings Language Selection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders language buttons', () => {
    render(<Settings />);
    
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Français')).toBeInTheDocument();
    expect(screen.getByText('Español')).toBeInTheDocument();
    expect(screen.getByText('Deutsch')).toBeInTheDocument();
  });

  it('calls setLanguage when a language button is clicked', () => {
    render(<Settings />);
    
    const frenchButton = screen.getByText('Français');
    fireEvent.click(frenchButton);

    expect(mockSetLanguage).toHaveBeenCalledWith('fr');
    expect(mockSetLanguage).toHaveBeenCalledTimes(1);
  });
});
