import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AuditLogView from '~/routes/audit';

// Mock dependencies
vi.mock('~/components/AppLayout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="layout">{children}</div>
}));

vi.mock('~/lib/language-context', () => ({
  useLanguage: () => ({
    t: (key: string) => key // Just return the translation key for assertions
  })
}));

const mockLogs = [
  { id: '1', action: 'user_update', details: 'Updated contacts', timestamp: '2026-03-09T10:00:00.000Z', changes: ['contacts: added 1'] },
  { id: '2', action: 'system_encrypt', details: 'Encrypted vault', timestamp: '2026-03-09T11:00:00.000Z' },
  { id: '3', action: 'unlock', details: 'Unlocked binder', timestamp: '2026-03-09T12:00:00.000Z' }
];

vi.mock('~/lib/session-context', () => ({
  useSession: () => ({
    plan: {
      version: 1,
      id: 'test',
      auditLogs: mockLogs
    }
  })
}));

describe('AuditLogView Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all audit logs initially', () => {
    render(<AuditLogView />);
    
    // Sort order in component is newest first (descending timestamp)
    // So order should be Unlocked binder, Encrypted vault, Updated contacts
    expect(screen.getByText('Unlocked binder')).toBeInTheDocument();
    expect(screen.getByText('Encrypted vault')).toBeInTheDocument();
    expect(screen.getByText('Updated contacts')).toBeInTheDocument();
  });

  it('filters logs by search query', () => {
    render(<AuditLogView />);
    
    const searchInput = screen.getByPlaceholderText('auditLog.searchPlaceholder');
    fireEvent.change(searchInput, { target: { value: 'contacts' } });

    // "Updated contacts" should be visible
    expect(screen.getByText('Updated contacts')).toBeInTheDocument();
    // "Unlocked binder" should be hidden
    expect(screen.queryByText('Unlocked binder')).not.toBeInTheDocument();
  });

  it('filters logs by action dropdown', () => {
    render(<AuditLogView />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'system_encrypt' } });

    expect(screen.getByText('Encrypted vault')).toBeInTheDocument();
    expect(screen.queryByText('Unlocked binder')).not.toBeInTheDocument();
    expect(screen.queryByText('Updated contacts')).not.toBeInTheDocument();
  });

  it('renders changes array as bullets', () => {
    render(<AuditLogView />);
    expect(screen.getByText('contacts: added 1')).toBeInTheDocument();
  });
});
