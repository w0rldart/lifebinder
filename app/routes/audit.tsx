import { useState } from 'react';
import { AppLayout } from '~/components/AppLayout';
import { Card } from '~/components/Card';
import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { useSession } from '~/lib/session-context';
import { useLanguage } from '~/lib/language-context';
import { Clock, Upload, FileText, Settings, Database, Activity, Key, Search, Download } from 'lucide-react';

export default function AuditLogView() {
  const { plan } = useSession();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  if (!plan) return null;

  const logs = [...(plan.auditLogs || [])].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const uniqueActions = Array.from(new Set(logs.map(log => log.action)));

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.details?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.changes?.some(change => change.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filterAction === 'all' || log.action === filterAction;
    return matchesSearch && matchesFilter;
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'unlock':
      case 'system_encrypt':
        return <Key className="w-5 h-5 text-blue-500" />;
      case 'export_pdf':
      case 'export_json':
        return <Upload className="w-5 h-5 text-green-500" />;
      case 'import_json':
        return <Database className="w-5 h-5 text-purple-500" />;
      case 'user_update':
        return <FileText className="w-5 h-5 text-gray-500" />;
      case 'system_create':
      case 'system_demo':
        return <Settings className="w-5 h-5 text-indigo-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTimestamp = (isoString: string) => {
    return new Date(isoString).toLocaleString();
  };

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Action', 'Details', 'Changes'];
    const csvContent = [
      headers.join(','),
      ...logs.map(log => {
        const date = new Date(log.timestamp).toISOString();
        const action = `"${log.action.replace(/"/g, '""')}"`;
        const details = `"${(log.details || '').replace(/"/g, '""')}"`;
        const changes = `"${(log.changes || []).join('; ').replace(/"/g, '""')}"`;
        return `${date},${action},${details},${changes}`;
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'life-binder-audit-log.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t('auditLog.title')}</h1>
            <p className="text-sm sm:text-base text-gray-600">
              {t('auditLog.description')}
            </p>
          </div>
          <Button onClick={handleExportCSV} variant="secondary" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            {t('auditLog.exportCsv')}
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder={t('auditLog.searchPlaceholder')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          <div className="sm:w-64">
            <select
              value={filterAction}
              onChange={e => setFilterAction(e.target.value)}
              className="w-full h-full min-h-[42px] px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">{t('auditLog.allActions')}</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>
        </div>

        <Card>
          {filteredLogs.length === 0 ? (
            <div className="py-8 text-center text-gray-500 flex flex-col items-center">
              <Clock className="w-12 h-12 text-gray-300 mb-3" />
              <p>{logs.length === 0 ? t('auditLog.noActivity') : t('auditLog.noMatch')}</p>
            </div>
          ) : (
            <div className="flow-root">
              <ul className="-mb-8">
                {filteredLogs.map((log, logIdx) => (
                  <li key={log.id}>
                    <div className="relative pb-8">
                      {logIdx !== filteredLogs.length - 1 ? (
                        <span className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                      ) : null}
                      <div className="relative flex items-start space-x-3">
                        <div className="relative">
                          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-50 flex items-center justify-center ring-8 ring-white">
                            {getActionIcon(log.action)}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-4">
                          <div className="flex-1">
                            <p className="text-sm text-gray-800 font-medium break-words">
                              {log.details || log.action}
                            </p>
                            <p className="mt-1 text-xs text-gray-500 font-mono bg-gray-50 inline-block px-1 rounded break-all">
                              {t('auditLog.actionLabel')} {log.action}
                            </p>
                            {log.changes && log.changes.length > 0 && (
                              <ul className="mt-2 space-y-1">
                                {log.changes.map((change, idx) => (
                                  <li key={idx} className="text-xs text-gray-600 bg-gray-50 px-2 py-1.5 rounded border border-gray-100 font-mono break-words">
                                    <span className="text-gray-400 mr-2">-</span>
                                    {change}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                          <div className="text-left sm:text-right text-sm whitespace-nowrap text-gray-500 flex flex-row sm:flex-col sm:items-end items-center gap-2 sm:gap-0">
                            <span className="font-medium text-gray-900">{formatTimestamp(log.timestamp).split(',')[0]}</span>
                            <span className="text-xs">{formatTimestamp(log.timestamp).split(',')[1]}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
