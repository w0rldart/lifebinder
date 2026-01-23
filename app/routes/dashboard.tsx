import { AppLayout } from '~/components/AppLayout';
import { Card } from '~/components/Card';
import { useSession } from '~/lib/session-context';
import { useLanguage } from '~/lib/language-context';
import { Link } from 'react-router';
import { ExternalLink } from 'lucide-react';

export default function Dashboard() {
  const { plan } = useSession();
  const { t } = useLanguage();

  return (
    <AppLayout>
      {plan && (() => {
        const completeness = calculateCompleteness(plan, t);
        const warnings = getWarnings(plan, t);
        const first24Hours = getFirst24HoursChecklist(plan, t);

        return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{plan.title}</h1>
          <p className="text-sm sm:text-base text-gray-600">
            {t('dashboard.lastUpdated')}: {new Date(plan.updatedAt).toLocaleDateString()}
          </p>
        </div>

        <Card title={t('dashboard.overallCompleteness')}>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {completeness.overall}% {t('dashboard.complete')}
                </span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all"
                  style={{ width: `${completeness.overall}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
              {completeness.sections.map((section) => (
                <div key={section.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900 text-sm sm:text-base">{section.name}</div>
                    <div className="text-xs sm:text-sm text-gray-600">{section.count} {t('dashboard.items')}</div>
                  </div>
                  <div className={`text-xl sm:text-2xl flex-shrink-0 ml-2 ${section.complete ? 'text-green-600' : 'text-gray-300'}`}>
                    {section.complete ? '✓' : '○'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {warnings.length > 0 && (
          <Card title={`⚠️ ${t('dashboard.attentionNeeded')}`}>
            <ul className="space-y-2">
              {warnings.map((warning, i) => (
                <li key={i} className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                  <span className="text-yellow-600 mt-0.5">⚠️</span>
                  <span className="text-sm text-gray-800">{warning}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <Card title={t('dashboard.first24Hours')}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {t('dashboard.first24HoursDescription')}
            </p>
            <ol className="space-y-3">
              {first24Hours.map((item, i) => (
                <li key={i} className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-semibold">
                    {i + 1}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <div className="font-medium text-gray-900">{item.title}</div>
                    <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                  </div>
                </li>
              ))}
            </ol>
            {first24Hours.length === 0 && (
              <p className="text-sm text-gray-500 italic">
                {t('dashboard.noRunbookPreview')}
              </p>
            )}
          </div>
        </Card>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">{t('dashboard.keepUpdated')}</h3>
          <p className="text-sm text-blue-800 mb-4">
            {t('dashboard.keepUpdatedDescription')}
          </p>
          <Link
            to="/export"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-800"
          >
            {t('dashboard.exportBinder')}
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
        );
      })()}
    </AppLayout>
  );
}

function calculateCompleteness(plan: any, t: any) {
  const sections = [
    { name: t('dashboard.sections.contacts'), count: plan.contacts.length, complete: plan.contacts.length > 0 },
    { name: t('dashboard.sections.notificationPlan'), count: plan.notificationPlan.orderedContactIds.length, complete: plan.notificationPlan.orderedContactIds.length > 0 },
    {
      name: t('dashboard.sections.accessInfo'),
      count: plan.access.primaryEmails.length +
             (plan.access.passwordManagerNotes ? 1 : 0) +
             (plan.access.networkInfrastructure?.length || 0) +
             (plan.access.iotDevices?.length || 0),
      complete: plan.access.primaryEmails.length > 0
    },
    {
      name: t('dashboard.sections.accounts'),
      count: plan.accounts.subscriptions.length +
             plan.accounts.cloudServices.length +
             plan.accounts.domains.length +
             plan.accounts.hosting.length +
             (plan.accounts.socialMedia?.length || 0),
      complete: (plan.accounts.subscriptions.length + plan.accounts.cloudServices.length) > 0
    },
    { name: t('dashboard.sections.documents'), count: plan.documents.length, complete: plan.documents.length > 0 },
    { name: t('dashboard.sections.willTestaments'), count: plan.willTestaments.assets.length + (plan.willTestaments.executor ? 1 : 0), complete: plan.willTestaments.executor || plan.willTestaments.assets.length > 0 },
    {
      name: t('dashboard.sections.financial'),
      count: plan.financial.bankAccounts.length +
             plan.financial.investments.length +
             plan.financial.retirementAccounts.length +
             plan.financial.insurancePolicies.length +
             (plan.financial.accountants?.length || 0) +
             (plan.financial.residualIncome?.length || 0) +
             (plan.financial.cryptocurrency?.length || 0),
      complete: plan.financial.bankAccounts.length >= 2 || plan.financial.insurancePolicies.length > 0
    },
    { name: t('dashboard.sections.emergencyPlan'), count: plan.emergency.meetingLocations.length + plan.emergency.emergencyContacts.length, complete: plan.emergency.emergencyContacts.length > 0 },
    {
      name: t('dashboard.sections.physicalSecurity'),
      count: (plan.physicalSecurity?.safes?.length || 0) +
             (plan.physicalSecurity?.securityCabinets?.length || 0) +
             (plan.physicalSecurity?.securitySystems?.length || 0) +
             (plan.physicalSecurity?.physicalKeys?.length || 0),
      complete: (plan.physicalSecurity?.safes?.length || 0) > 0 || (plan.physicalSecurity?.physicalKeys?.length || 0) > 0
    },
    {
      name: t('dashboard.sections.securityRecovery'),
      count: (plan.securityRecovery?.securityQuestions?.length || 0) +
             (plan.securityRecovery?.backupCodes ? 1 : 0),
      complete: (plan.securityRecovery?.securityQuestions?.length || 0) > 0
    },
    { name: t('dashboard.sections.notes'), count: plan.notes.length, complete: plan.notes.length > 0 },
  ];

  const completeSections = sections.filter(s => s.complete).length;
  const overall = Math.round((completeSections / sections.length) * 100);

  return { overall, sections };
}

function getWarnings(plan: any, t: any) {
  const warnings: string[] = [];

  if (plan.contacts.length === 0) {
    warnings.push(t('dashboard.warnings.noContacts'));
  }

  if (plan.notificationPlan.orderedContactIds.length === 0) {
    warnings.push(t('dashboard.warnings.noNotificationOrder'));
  }

  if (plan.access.primaryEmails.length === 0) {
    warnings.push(t('dashboard.warnings.noEmails'));
  }

  if (!plan.access.passwordManagerNotes) {
    warnings.push(t('dashboard.warnings.noPasswordManager'));
  }

  if (plan.documents.filter((d: any) => d.sensitivity === 'high').length > 0) {
    const highSensCount = plan.documents.filter((d: any) => d.sensitivity === 'high').length;
    warnings.push(`${highSensCount} ${t('dashboard.warnings.highSensitivityDocs')}`);
  }

  if (plan.emergency.emergencyContacts.length === 0) {
    warnings.push(t('dashboard.warnings.noEmergencyContacts'));
  }

  return warnings;
}

function getFirst24HoursChecklist(plan: any, t: any) {
  const checklist: { title: string; description: string }[] = [];

  const beforeSocialContacts = plan.contacts.filter((c: any) =>
    plan.notificationPlan.orderedContactIds.includes(c.id) && c.notifyBeforeSocial
  );

  if (beforeSocialContacts.length > 0) {
    checklist.push({
      title: t('dashboard.checklist.notifyPriority'),
      description: t('dashboard.checklist.notifyPriorityDesc', { count: beforeSocialContacts.length, names: beforeSocialContacts.map((c: any) => c.name).join(', ') }),
    });
  }

  if (plan.access.primaryEmails.length > 0) {
    checklist.push({
      title: t('dashboard.checklist.secureEmail'),
      description: t('dashboard.checklist.secureEmailDesc', { count: plan.access.primaryEmails.length }),
    });
  }

  if (plan.access.passwordManagerNotes) {
    checklist.push({
      title: t('dashboard.checklist.locatePasswordManager'),
      description: plan.access.passwordManagerNotes,
    });
  }

  if (plan.accounts.cloudServices.some((s: any) => s.billingWarning)) {
    checklist.push({
      title: t('dashboard.checklist.reviewCloudBilling'),
      description: t('dashboard.checklist.reviewCloudBillingDesc'),
    });
  }

  if (plan.emergency.meetingLocations.length > 0) {
    checklist.push({
      title: t('dashboard.checklist.familyMeetingPoint'),
      description: t('dashboard.checklist.familyMeetingPointDesc', { location: plan.emergency.meetingLocations[0].name }),
    });
  }

  if (plan.documents.length > 0) {
    checklist.push({
      title: t('dashboard.checklist.locateDocuments'),
      description: t('dashboard.checklist.locateDocumentsDesc', { count: plan.documents.length }),
    });
  }

  return checklist;
}
