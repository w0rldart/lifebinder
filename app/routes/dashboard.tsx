import { AppLayout } from '~/components/AppLayout';
import { Card } from '~/components/Card';
import { useSession } from '~/lib/session-context';
import { Link } from 'react-router';
import { ExternalLink } from 'lucide-react';

export default function Dashboard() {
  const { plan } = useSession();

  return (
    <AppLayout>
      {plan && (() => {
        const completeness = calculateCompleteness(plan);
        const warnings = getWarnings(plan);
        const first24Hours = getFirst24HoursChecklist(plan);

        return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{plan.title}</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Last updated: {new Date(plan.updatedAt).toLocaleDateString()}
          </p>
        </div>

        <Card title="Overall Completeness">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {completeness.overall}% Complete
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
                    <div className="text-xs sm:text-sm text-gray-600">{section.count} items</div>
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
          <Card title="⚠️ Attention Needed">
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

        <Card title="First 24 Hours Runbook Preview">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              This is what your trusted contacts will need to do first.
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
                Add contacts and notification plans to see your runbook preview.
              </p>
            )}
          </div>
        </Card>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Keep Your Binder Updated</h3>
          <p className="text-sm text-blue-800 mb-4">
            Review and update your information regularly, especially after major life changes.
          </p>
          <Link
            to="/export"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-800"
          >
            Export your binder
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
        );
      })()}
    </AppLayout>
  );
}

function calculateCompleteness(plan: any) {
  const sections = [
    { name: 'Contacts', count: plan.contacts.length, complete: plan.contacts.length > 0 },
    { name: 'Notification Plan', count: plan.notificationPlan.orderedContactIds.length, complete: plan.notificationPlan.orderedContactIds.length > 0 },
    {
      name: 'Access Info',
      count: plan.access.primaryEmails.length +
             (plan.access.passwordManagerNotes ? 1 : 0) +
             (plan.access.networkInfrastructure?.length || 0) +
             (plan.access.iotDevices?.length || 0),
      complete: plan.access.primaryEmails.length > 0
    },
    {
      name: 'Accounts',
      count: plan.accounts.subscriptions.length +
             plan.accounts.cloudServices.length +
             plan.accounts.domains.length +
             plan.accounts.hosting.length +
             (plan.accounts.socialMedia?.length || 0),
      complete: (plan.accounts.subscriptions.length + plan.accounts.cloudServices.length) > 0
    },
    { name: 'Documents', count: plan.documents.length, complete: plan.documents.length > 0 },
    { name: 'Will & Testaments', count: plan.willTestaments.assets.length + (plan.willTestaments.executor ? 1 : 0), complete: plan.willTestaments.executor || plan.willTestaments.assets.length > 0 },
    {
      name: 'Financial',
      count: plan.financial.bankAccounts.length +
             plan.financial.investments.length +
             plan.financial.retirementAccounts.length +
             plan.financial.insurancePolicies.length +
             (plan.financial.accountants?.length || 0) +
             (plan.financial.residualIncome?.length || 0) +
             (plan.financial.cryptocurrency?.length || 0),
      complete: plan.financial.bankAccounts.length >= 2 || plan.financial.insurancePolicies.length > 0
    },
    { name: 'Emergency Plan', count: plan.emergency.meetingLocations.length + plan.emergency.emergencyContacts.length, complete: plan.emergency.emergencyContacts.length > 0 },
    {
      name: 'Physical Security',
      count: (plan.physicalSecurity?.safes?.length || 0) +
             (plan.physicalSecurity?.securityCabinets?.length || 0) +
             (plan.physicalSecurity?.securitySystems?.length || 0) +
             (plan.physicalSecurity?.physicalKeys?.length || 0),
      complete: (plan.physicalSecurity?.safes?.length || 0) > 0 || (plan.physicalSecurity?.physicalKeys?.length || 0) > 0
    },
    {
      name: 'Security Recovery',
      count: (plan.securityRecovery?.securityQuestions?.length || 0) +
             (plan.securityRecovery?.backupCodes ? 1 : 0),
      complete: (plan.securityRecovery?.securityQuestions?.length || 0) > 0
    },
    { name: 'Notes', count: plan.notes.length, complete: plan.notes.length > 0 },
  ];

  const completeSections = sections.filter(s => s.complete).length;
  const overall = Math.round((completeSections / sections.length) * 100);

  return { overall, sections };
}

function getWarnings(plan: any) {
  const warnings: string[] = [];

  if (plan.contacts.length === 0) {
    warnings.push('No emergency contacts added yet');
  }

  if (plan.notificationPlan.orderedContactIds.length === 0) {
    warnings.push('No notification order set up');
  }

  if (plan.access.primaryEmails.length === 0) {
    warnings.push('No primary email accounts listed');
  }

  if (!plan.access.passwordManagerNotes) {
    warnings.push('Password manager location not documented');
  }

  if (plan.documents.filter((d: any) => d.sensitivity === 'high').length > 0) {
    const highSensCount = plan.documents.filter((d: any) => d.sensitivity === 'high').length;
    warnings.push(`${highSensCount} high-sensitivity documents (will be excluded from PDF export by default)`);
  }

  if (plan.emergency.emergencyContacts.length === 0) {
    warnings.push('No emergency contacts listed');
  }

  return warnings;
}

function getFirst24HoursChecklist(plan: any) {
  const checklist: { title: string; description: string }[] = [];

  const beforeSocialContacts = plan.contacts.filter((c: any) =>
    plan.notificationPlan.orderedContactIds.includes(c.id) && c.notifyBeforeSocial
  );

  if (beforeSocialContacts.length > 0) {
    checklist.push({
      title: 'Notify Priority Contacts',
      description: `Contact ${beforeSocialContacts.length} people privately before any public announcement: ${beforeSocialContacts.map((c: any) => c.name).join(', ')}`,
    });
  }

  if (plan.access.primaryEmails.length > 0) {
    checklist.push({
      title: 'Secure Email Accounts',
      description: `Check for important messages in primary email accounts (${plan.access.primaryEmails.length} listed)`,
    });
  }

  if (plan.access.passwordManagerNotes) {
    checklist.push({
      title: 'Locate Password Manager',
      description: plan.access.passwordManagerNotes,
    });
  }

  if (plan.accounts.cloudServices.some((s: any) => s.billingWarning)) {
    checklist.push({
      title: 'Review Cloud Billing',
      description: 'Check cloud services to prevent unexpected charges',
    });
  }

  if (plan.emergency.meetingLocations.length > 0) {
    checklist.push({
      title: 'Family Meeting Point',
      description: `Gather at: ${plan.emergency.meetingLocations[0].name}`,
    });
  }

  if (plan.documents.length > 0) {
    checklist.push({
      title: 'Locate Important Documents',
      description: `${plan.documents.length} documents catalogued with locations`,
    });
  }

  return checklist;
}
