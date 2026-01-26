import { useState } from 'react';
import type { ReactElement } from 'react';
import { AppLayout } from '~/components/AppLayout';
import { Card } from '~/components/Card';
import { useLanguage } from '~/lib/language-context';
import { Search, ChevronDown } from 'lucide-react';

interface Section {
  id: string;
  title: string;
  content: ReactElement;
}

export default function Help() {
  const { t } = useLanguage();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['what-is']));
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSection = (id: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSections(newExpanded);
  };

  const sections: Section[] = [
    {
      id: 'what-is',
      title: t('help.sections.whatIs.title'),
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            {t('help.sections.whatIs.description')}
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 font-medium mb-2">{t('help.sections.whatIs.whyTitle')}</p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• {t('help.sections.whatIs.why1')}</li>
              <li>• {t('help.sections.whatIs.why2')}</li>
              <li>• {t('help.sections.whatIs.why3')}</li>
              <li>• {t('help.sections.whatIs.why4')}</li>
              <li>• {t('help.sections.whatIs.why5')}</li>
            </ul>
          </div>
          <p className="text-gray-700">
            {t('help.sections.whatIs.closing')}
          </p>
        </div>
      ),
    },
    {
      id: 'getting-started',
      title: t('help.sections.gettingStarted.title'),
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('help.sections.gettingStarted.creatingPlanTitle')}</h3>
            <ol className="text-gray-700 space-y-2 list-decimal list-inside">
              <li>{t('help.sections.gettingStarted.creatingPlan1')}</li>
              <li>{t('help.sections.gettingStarted.creatingPlan2')}</li>
              <li>{t('help.sections.gettingStarted.creatingPlan3')}</li>
              <li>{t('help.sections.gettingStarted.creatingPlan4')}</li>
            </ol>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800 font-medium mb-2">{t('help.sections.gettingStarted.securityTitle')}</p>
            <p className="text-sm text-yellow-700">
              {t('help.sections.gettingStarted.securityText')}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('help.sections.gettingStarted.autoLockTitle')}</h3>
            <p className="text-gray-700 mb-2">
              {t('help.sections.gettingStarted.autoLockDescription')}
            </p>
            <ul className="text-gray-700 space-y-1 list-disc list-inside ml-4">
              <li>{t('help.sections.gettingStarted.autoLock1')}</li>
              <li>{t('help.sections.gettingStarted.autoLock2')}</li>
              <li>{t('help.sections.gettingStarted.autoLock3')}</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'dashboard',
      title: t('help.sections.dashboard.title'),
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">{t('help.sections.dashboard.description')}</p>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('help.sections.dashboard.completenessTitle')}</h3>
            <p className="text-gray-700 mb-2">{t('help.sections.dashboard.completenessDescription')}</p>
            <ul className="text-gray-700 space-y-1 list-disc list-inside ml-4">
              <li><strong>{t('help.sections.dashboard.completeness1')}</strong></li>
              <li><strong>{t('help.sections.dashboard.completeness2')}</strong></li>
              <li><strong>{t('help.sections.dashboard.completeness3')}</strong></li>
              <li><strong>{t('help.sections.dashboard.completeness4')}</strong></li>
              <li><strong>{t('help.sections.dashboard.completeness5')}</strong></li>
              <li><strong>{t('help.sections.dashboard.completeness6')}</strong></li>
              <li><strong>{t('help.sections.dashboard.completeness7')}</strong></li>
            </ul>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800 font-medium mb-1">{t('help.sections.dashboard.quickTipTitle')}</p>
            <p className="text-sm text-green-700">{t('help.sections.dashboard.quickTipText')}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'contacts',
      title: t('help.sections.contacts.title'),
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">{t('help.sections.contacts.description')}</p>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('help.sections.contacts.includeTitle')}</h3>
            <ul className="text-gray-700 space-y-2 list-disc list-inside ml-4">
              <li><strong>{t('help.sections.contacts.include1')}</strong></li>
              <li><strong>{t('help.sections.contacts.include2')}</strong></li>
              <li><strong>{t('help.sections.contacts.include3')}</strong></li>
              <li><strong>{t('help.sections.contacts.include4')}</strong></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('help.sections.contacts.notificationTitle')}</h3>
            <p className="text-gray-700 mb-2">{t('help.sections.contacts.notificationDescription')}</p>
            <ul className="text-gray-700 space-y-1 list-disc list-inside ml-4">
              <li><strong>{t('help.sections.contacts.notification1')}</strong></li>
              <li><strong>{t('help.sections.contacts.notification2')}</strong></li>
              <li><strong>{t('help.sections.contacts.notification3')}</strong></li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'access',
      title: t('help.sections.access.title'),
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">{t('help.sections.access.description')}</p>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('help.sections.access.passwordManagersTitle')}</h3>
            <p className="text-gray-700 mb-2">{t('help.sections.access.passwordManagersDescription')}</p>
            <ul className="text-gray-700 space-y-1 list-disc list-inside ml-4">
              <li>{t('help.sections.access.passwordManagers1')}</li>
              <li>{t('help.sections.access.passwordManagers2')}</li>
              <li>{t('help.sections.access.passwordManagers3')}</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('help.sections.access.emailAccountsTitle')}</h3>
            <p className="text-gray-700 mb-2">{t('help.sections.access.emailAccountsDescription')}</p>
            <ul className="text-gray-700 space-y-1 list-disc list-inside ml-4">
              <li>{t('help.sections.access.emailAccounts1')}</li>
              <li>{t('help.sections.access.emailAccounts2')}</li>
              <li>{t('help.sections.access.emailAccounts3')}</li>
              <li>{t('help.sections.access.emailAccounts4')}</li>
            </ul>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800 font-medium mb-1">{t('help.sections.access.securityNoteTitle')}</p>
            <p className="text-sm text-yellow-700">{t('help.sections.access.securityNoteText')}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'accounts',
      title: t('help.sections.accounts.title'),
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">{t('help.sections.accounts.description')}</p>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('help.sections.accounts.typesTitle')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="font-medium text-gray-900">{t('help.sections.accounts.subscriptionsTitle')}</p>
                <ul className="text-sm text-gray-600 list-disc list-inside ml-2">
                  <li>{t('help.sections.accounts.subscriptions1')}</li>
                  <li>{t('help.sections.accounts.subscriptions2')}</li>
                  <li>{t('help.sections.accounts.subscriptions3')}</li>
                  <li>{t('help.sections.accounts.subscriptions4')}</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-gray-900">{t('help.sections.accounts.cloudTitle')}</p>
                <ul className="text-sm text-gray-600 list-disc list-inside ml-2">
                  <li>{t('help.sections.accounts.cloud1')}</li>
                  <li>{t('help.sections.accounts.cloud2')}</li>
                  <li>{t('help.sections.accounts.cloud3')}</li>
                  <li>{t('help.sections.accounts.cloud4')}</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-gray-900">{t('help.sections.accounts.domainTitle')}</p>
                <ul className="text-sm text-gray-600 list-disc list-inside ml-2">
                  <li>{t('help.sections.accounts.domain1')}</li>
                  <li>{t('help.sections.accounts.domain2')}</li>
                  <li>{t('help.sections.accounts.domain3')}</li>
                  <li>{t('help.sections.accounts.domain4')}</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-gray-900">{t('help.sections.accounts.otherTitle')}</p>
                <ul className="text-sm text-gray-600 list-disc list-inside ml-2">
                  <li>{t('help.sections.accounts.other1')}</li>
                  <li>{t('help.sections.accounts.other2')}</li>
                  <li>{t('help.sections.accounts.other3')}</li>
                  <li>{t('help.sections.accounts.other4')}</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800 font-medium mb-1">{t('help.sections.accounts.bestPracticeTitle')}</p>
            <p className="text-sm text-green-700">{t('help.sections.accounts.bestPracticeText')}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'documents',
      title: t('help.sections.documents.title'),
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">{t('help.sections.documents.description')}</p>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('help.sections.documents.importantTitle')}</h3>
            <div className="space-y-2">
              <div>
                <p className="font-medium text-gray-900">{t('help.sections.documents.legalTitle')}</p>
                <p className="text-sm text-gray-600">{t('help.sections.documents.legalText')}</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">{t('help.sections.documents.financialTitle')}</p>
                <p className="text-sm text-gray-600">{t('help.sections.documents.financialText')}</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">{t('help.sections.documents.propertyTitle')}</p>
                <p className="text-sm text-gray-600">{t('help.sections.documents.propertyText')}</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">{t('help.sections.documents.medicalTitle')}</p>
                <p className="text-sm text-gray-600">{t('help.sections.documents.medicalText')}</p>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('help.sections.documents.locationsTitle')}</h3>
            <p className="text-gray-700">{t('help.sections.documents.locationsText')}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'estate',
      title: t('help.sections.estate.title'),
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">{t('help.sections.estate.description')}</p>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('help.sections.estate.keyInfoTitle')}</h3>
            <ul className="text-gray-700 space-y-2 list-disc list-inside ml-4">
              <li><strong>{t('help.sections.estate.keyInfo1')}</strong></li>
              <li><strong>{t('help.sections.estate.keyInfo2')}</strong></li>
              <li><strong>{t('help.sections.estate.keyInfo3')}</strong></li>
              <li><strong>{t('help.sections.estate.keyInfo4')}</strong></li>
              <li><strong>{t('help.sections.estate.keyInfo5')}</strong></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('help.sections.estate.distributionTitle')}</h3>
            <p className="text-gray-700 mb-2">{t('help.sections.estate.distributionDescription')}</p>
            <ul className="text-gray-700 space-y-1 list-disc list-inside ml-4">
              <li><strong>{t('help.sections.estate.distribution1')}</strong></li>
              <li><strong>{t('help.sections.estate.distribution2')}</strong></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('help.sections.estate.funeralTitle')}</h3>
            <p className="text-gray-700">{t('help.sections.estate.funeralText')}</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800 font-medium mb-1">{t('help.sections.estate.legalReminderTitle')}</p>
            <p className="text-sm text-yellow-700">{t('help.sections.estate.legalReminderText')}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'emergency',
      title: t('help.sections.emergency.title'),
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">{t('help.sections.emergency.description')}</p>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('help.sections.emergency.meetingLocationsTitle')}</h3>
            <p className="text-gray-700 mb-2">{t('help.sections.emergency.meetingLocationsDescription')}</p>
            <ul className="text-gray-700 space-y-1 list-disc list-inside ml-4">
              <li><strong>{t('help.sections.emergency.meetingLocations1')}</strong></li>
              <li><strong>{t('help.sections.emergency.meetingLocations2')}</strong></li>
              <li><strong>{t('help.sections.emergency.meetingLocations3')}</strong></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('help.sections.emergency.utilityShutoffsTitle')}</h3>
            <p className="text-gray-700">{t('help.sections.emergency.utilityShutoffsText')}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('help.sections.emergency.grabListTitle')}</h3>
            <p className="text-gray-700 mb-2">{t('help.sections.emergency.grabListDescription')}</p>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside ml-4">
              <li>{t('help.sections.emergency.grabList1')}</li>
              <li>{t('help.sections.emergency.grabList2')}</li>
              <li>{t('help.sections.emergency.grabList3')}</li>
              <li>{t('help.sections.emergency.grabList4')}</li>
              <li>{t('help.sections.emergency.grabList5')}</li>
              <li>{t('help.sections.emergency.grabList6')}</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('help.sections.emergency.emergencyContactsTitle')}</h3>
            <p className="text-gray-700">{t('help.sections.emergency.emergencyContactsText')}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'export',
      title: t('help.sections.exportModule.title'),
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">{t('help.sections.exportModule.description')}</p>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('help.sections.exportModule.pdfTitle')}</h3>
            <p className="text-gray-700 mb-2">{t('help.sections.exportModule.pdfDescription')}</p>
            <ul className="text-gray-700 space-y-1 list-disc list-inside ml-4">
              <li>{t('help.sections.exportModule.pdf1')}</li>
              <li>{t('help.sections.exportModule.pdf2')}</li>
              <li>{t('help.sections.exportModule.pdf3')}</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('help.sections.exportModule.encryptedTitle')}</h3>
            <p className="text-gray-700 mb-2">{t('help.sections.exportModule.encryptedDescription')}</p>
            <ul className="text-gray-700 space-y-1 list-disc list-inside ml-4">
              <li>{t('help.sections.exportModule.encrypted1')}</li>
              <li>{t('help.sections.exportModule.encrypted2')}</li>
              <li>{t('help.sections.exportModule.encrypted3')}</li>
              <li>{t('help.sections.exportModule.encrypted4')}</li>
            </ul>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800 font-medium mb-1">{t('help.sections.exportModule.backupStrategyTitle')}</p>
            <p className="text-sm text-green-700">{t('help.sections.exportModule.backupStrategyText')}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'security',
      title: t('help.sections.security.title'),
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('help.sections.security.protectedTitle')}</h3>
            <p className="text-gray-700 mb-2">{t('help.sections.security.protectedDescription')}</p>
            <ul className="text-gray-700 space-y-2 list-disc list-inside ml-4">
              <li><strong>{t('help.sections.security.protected1')}</strong></li>
              <li><strong>{t('help.sections.security.protected2')}</strong></li>
              <li><strong>{t('help.sections.security.protected3')}</strong></li>
              <li><strong>{t('help.sections.security.protected4')}</strong></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('help.sections.security.encryptionTitle')}</h3>
            <p className="text-gray-700 mb-2">{t('help.sections.security.encryptionDescription')}</p>
            <ul className="text-gray-700 space-y-1 list-disc list-inside ml-4">
              <li>{t('help.sections.security.encryption1')}</li>
              <li>{t('help.sections.security.encryption2')}</li>
              <li>{t('help.sections.security.encryption3')}</li>
              <li>{t('help.sections.security.encryption4')}</li>
            </ul>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800 font-medium mb-2">{t('help.sections.security.passphraseRecoveryTitle')}</p>
            <p className="text-sm text-red-700">{t('help.sections.security.passphraseRecoveryText')}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('help.sections.security.sensitivityTitle')}</h3>
            <p className="text-gray-700 mb-2">{t('help.sections.security.sensitivityDescription')}</p>
            <ul className="text-gray-700 space-y-1 list-disc list-inside ml-4">
              <li>{t('help.sections.security.sensitivity1')}</li>
              <li>{t('help.sections.security.sensitivity2')}</li>
              <li>{t('help.sections.security.sensitivity3')}</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'best-practices',
      title: t('help.sections.bestPractices.title'),
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('help.sections.bestPractices.updatesTitle')}</h3>
            <ul className="text-gray-700 space-y-2 list-disc list-inside ml-4">
              <li><strong>{t('help.sections.bestPractices.updates1')}</strong></li>
              <li><strong>{t('help.sections.bestPractices.updates2')}</strong></li>
              <li><strong>{t('help.sections.bestPractices.updates3')}</strong></li>
              <li><strong>{t('help.sections.bestPractices.updates4')}</strong></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('help.sections.bestPractices.sharingTitle')}</h3>
            <p className="text-gray-700 mb-2">{t('help.sections.bestPractices.sharingDescription')}</p>
            <ul className="text-gray-700 space-y-2 list-disc list-inside ml-4">
              <li><strong>{t('help.sections.bestPractices.sharing1')}</strong></li>
              <li><strong>{t('help.sections.bestPractices.sharing2')}</strong></li>
              <li><strong>{t('help.sections.bestPractices.sharing3')}</strong></li>
              <li><strong>{t('help.sections.bestPractices.sharing4')}</strong></li>
            </ul>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 font-medium mb-2">{t('help.sections.bestPractices.communicationTitle')}</p>
            <p className="text-sm text-blue-700">{t('help.sections.bestPractices.communicationText')}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('help.sections.bestPractices.incrementalTitle')}</h3>
            <p className="text-gray-700">{t('help.sections.bestPractices.incrementalText')}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'faq',
      title: t('help.sections.faq.title'),
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('help.sections.faq.dataQ')}</h3>
            <p className="text-gray-700">{t('help.sections.faq.dataA')}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('help.sections.faq.multipleDevicesQ')}</h3>
            <p className="text-gray-700">{t('help.sections.faq.multipleDevicesA')}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('help.sections.faq.legallyBindingQ')}</h3>
            <p className="text-gray-700">{t('help.sections.faq.legallyBindingA')}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('help.sections.faq.clearBrowserQ')}</h3>
            <p className="text-gray-700">{t('help.sections.faq.clearBrowserA')}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('help.sections.faq.passwordsQ')}</h3>
            <p className="text-gray-700">{t('help.sections.faq.passwordsA')}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('help.sections.faq.percentageQ')}</h3>
            <p className="text-gray-700">{t('help.sections.faq.percentageA')}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('help.sections.faq.customizeQ')}</h3>
            <p className="text-gray-700">{t('help.sections.faq.customizeA')}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('help.sections.faq.contactsDifferenceQ')}</h3>
            <p className="text-gray-700">{t('help.sections.faq.contactsDifferenceA')}</p>
          </div>
        </div>
      ),
    },
  ];

  const filteredSections = sections.filter(
    (section) => {
      if (searchQuery === '') return true;
      const query = searchQuery.toLowerCase();
      const titleMatch = section.title.toLowerCase().includes(query);

      try {
        const contentText = JSON.stringify(section.content).toLowerCase();
        return titleMatch || contentText.includes(query);
      } catch {
        return titleMatch;
      }
    }
  );

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t('help.title')}</h1>
          <p className="text-sm sm:text-base text-gray-600">
            {t('help.description')}
          </p>
        </div>

        <Card>
          <div className="relative">
            <input
              type="text"
              placeholder={t('help.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          </div>
        </Card>

        <div className="space-y-3">
          {filteredSections.map((section) => (
            <Card key={section.id}>
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between text-left"
              >
                <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
                <ChevronDown
                  className={`w-6 h-6 text-gray-500 transition-transform ${
                    expandedSections.has(section.id) ? 'transform rotate-180' : ''
                  }`}
                />
              </button>
              {expandedSections.has(section.id) && (
                <div className="mt-4 pt-4 border-t border-gray-200">{section.content}</div>
              )}
            </Card>
          ))}
        </div>

        {filteredSections.length === 0 && (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-500">{t('help.noResults', { query: searchQuery })}</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                {t('help.clearSearch')}
              </button>
            </div>
          </Card>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">{t('help.needMoreHelp')}</h3>
          <p className="text-blue-800 text-sm">
            {t('help.needMoreHelpText')}
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
