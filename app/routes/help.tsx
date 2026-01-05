import { useState } from 'react';
import type { ReactElement } from 'react';
import { AppLayout } from '~/components/AppLayout';
import { Card } from '~/components/Card';
import { Search, ChevronDown } from 'lucide-react';

interface Section {
  id: string;
  title: string;
  content: ReactElement;
}

export default function Help() {
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
      title: 'What is Life Binder?',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Life Binder is a secure, client-side application designed to help you organize and document critical information for end-of-life planning. It ensures your loved ones have access to everything they need when the time comes.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 font-medium mb-2">Why Life Binder?</p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Organize passwords, accounts, and important documents in one secure place</li>
              <li>• Create a clear notification plan so the right people are informed</li>
              <li>• Document estate details, assets, and beneficiaries</li>
              <li>• Prepare emergency information for your family</li>
              <li>• Export everything to encrypted files or PDFs for safekeeping</li>
            </ul>
          </div>
          <p className="text-gray-700">
            All your data is stored locally in your browser or can be encrypted and exported. Nothing is sent to external servers unless you choose to back it up.
          </p>
        </div>
      ),
    },
    {
      id: 'getting-started',
      title: 'Getting Started',
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Creating Your First Plan</h3>
            <ol className="text-gray-700 space-y-2 list-decimal list-inside">
              <li>From the welcome screen, choose to create a new plan or explore with demo data</li>
              <li>If using demo data, review the examples to understand each section</li>
              <li>Replace demo data with your real information when ready</li>
              <li>Use the "Reset Plan" button to start fresh if needed</li>
            </ol>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800 font-medium mb-2">Security First</p>
            <p className="text-sm text-yellow-700">
              We strongly recommend adding encryption immediately after creating your plan. Go to Settings → Add Encryption to protect your data with a passphrase. Store this passphrase securely - it cannot be recovered if lost.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Understanding Auto-Lock</h3>
            <p className="text-gray-700 mb-2">
              Life Binder automatically locks after a period of inactivity (default: 30 minutes). You can adjust this in Settings. When locked:
            </p>
            <ul className="text-gray-700 space-y-1 list-disc list-inside ml-4">
              <li>Encrypted plans require your passphrase to unlock</li>
              <li>Unencrypted plans unlock instantly</li>
              <li>You'll see a warning before auto-lock occurs</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'dashboard',
      title: 'Dashboard Module',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            The Dashboard provides an at-a-glance view of your Life Binder's completeness and guides you on what to fill out next.
          </p>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Completeness Tracking</h3>
            <p className="text-gray-700 mb-2">Each section shows a percentage based on:</p>
            <ul className="text-gray-700 space-y-1 list-disc list-inside ml-4">
              <li><strong>Contacts:</strong> At least 3 contacts added</li>
              <li><strong>Notification Plan:</strong> Primary and secondary contacts assigned</li>
              <li><strong>Access:</strong> Password managers and email accounts documented</li>
              <li><strong>Accounts:</strong> At least 3 accounts added</li>
              <li><strong>Documents:</strong> At least 3 documents added</li>
              <li><strong>Estate Planning:</strong> Executor and attorney information provided</li>
              <li><strong>Emergency:</strong> Meeting locations and emergency contacts added</li>
            </ul>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800 font-medium mb-1">Quick Tip</p>
            <p className="text-sm text-green-700">
              Don't worry about achieving 100% completion. Focus on the sections most relevant to your situation. The dashboard helps identify gaps but isn't meant to be a checklist.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'contacts',
      title: 'Contacts Module',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Contacts are the people who matter most in your life - those who should be notified and who might need access to your information.
          </p>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">What to Include</h3>
            <ul className="text-gray-700 space-y-2 list-disc list-inside ml-4">
              <li><strong>Name and relationship:</strong> Make it clear who this person is</li>
              <li><strong>Multiple contact methods:</strong> Phone and email when possible</li>
              <li><strong>Physical address:</strong> Especially for legal or estate matters</li>
              <li><strong>Notes:</strong> Any context your other contacts might need</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Notification Order</h3>
            <p className="text-gray-700 mb-2">
              After adding contacts, assign them to notification tiers in the Access module. This creates a clear chain of communication:
            </p>
            <ul className="text-gray-700 space-y-1 list-disc list-inside ml-4">
              <li><strong>Primary:</strong> First person to be notified (executor, spouse, etc.)</li>
              <li><strong>Secondary:</strong> Notified if primary is unavailable</li>
              <li><strong>Tertiary:</strong> Additional backup contacts</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'access',
      title: 'Access Module',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            The Access module is the heart of Life Binder - it documents how to access your digital life and who should be notified when the time comes.
          </p>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Password Managers</h3>
            <p className="text-gray-700 mb-2">
              Document your password manager details (LastPass, 1Password, Bitwarden, etc.):
            </p>
            <ul className="text-gray-700 space-y-1 list-disc list-inside ml-4">
              <li>Master password location or recovery instructions</li>
              <li>Two-factor authentication backup codes</li>
              <li>Recovery email or security questions</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Email Accounts</h3>
            <p className="text-gray-700 mb-2">
              Primary email accounts are gateways to everything else. Document:
            </p>
            <ul className="text-gray-700 space-y-1 list-disc list-inside ml-4">
              <li>Email address and provider</li>
              <li>Password or recovery method</li>
              <li>Two-factor authentication details</li>
              <li>Recovery email or phone number</li>
            </ul>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800 font-medium mb-1">Security Note</p>
            <p className="text-sm text-yellow-700">
              This is highly sensitive information. Always enable encryption and use a strong passphrase. Consider storing master passwords separately and referencing their location here instead.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'accounts',
      title: 'Accounts Module',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Track subscriptions, services, and online accounts that need to be managed or canceled.
          </p>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Account Types to Include</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="font-medium text-gray-900">Subscriptions</p>
                <ul className="text-sm text-gray-600 list-disc list-inside ml-2">
                  <li>Streaming services</li>
                  <li>Software licenses</li>
                  <li>Membership sites</li>
                  <li>Recurring donations</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-gray-900">Cloud Services</p>
                <ul className="text-sm text-gray-600 list-disc list-inside ml-2">
                  <li>Cloud storage (Google Drive, Dropbox)</li>
                  <li>Photo services</li>
                  <li>Backup services</li>
                  <li>Development platforms</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-gray-900">Domain & Hosting</p>
                <ul className="text-sm text-gray-600 list-disc list-inside ml-2">
                  <li>Domain registrars</li>
                  <li>Web hosting</li>
                  <li>Email hosting</li>
                  <li>CDN services</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-gray-900">Other</p>
                <ul className="text-sm text-gray-600 list-disc list-inside ml-2">
                  <li>Social media</li>
                  <li>Gaming accounts</li>
                  <li>Professional networks</li>
                  <li>Forums and communities</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800 font-medium mb-1">Best Practice</p>
            <p className="text-sm text-green-700">
              Include account URLs, usernames, and renewal dates. For accounts with ongoing costs, note whether they should be canceled or maintained.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'documents',
      title: 'Documents Module',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Track physical and digital documents that your loved ones will need to locate.
          </p>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Important Documents</h3>
            <div className="space-y-2">
              <div>
                <p className="font-medium text-gray-900">Legal Documents</p>
                <p className="text-sm text-gray-600">Birth certificate, marriage license, passport, social security card, driver's license</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Financial Documents</p>
                <p className="text-sm text-gray-600">Tax returns, bank statements, investment accounts, retirement accounts, life insurance policies</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Property Documents</p>
                <p className="text-sm text-gray-600">Deeds, titles, mortgage papers, rental agreements, vehicle titles</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Medical Documents</p>
                <p className="text-sm text-gray-600">Medical records, prescriptions, advance directives, living will, DNR orders</p>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Document Locations</h3>
            <p className="text-gray-700">
              For each document, specify exactly where it can be found: safe deposit box number and bank, home safe location, filing cabinet drawer, cloud storage path, or attorney's office.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'estate',
      title: 'Estate Planning Module',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Document your estate plan, asset distribution wishes, and end-of-life preferences.
          </p>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Key Information to Include</h3>
            <ul className="text-gray-700 space-y-2 list-disc list-inside ml-4">
              <li><strong>Executor:</strong> The person responsible for carrying out your will</li>
              <li><strong>Will & Trust Locations:</strong> Where these documents are stored</li>
              <li><strong>Attorney & Accountant:</strong> Professional contacts for estate matters</li>
              <li><strong>Assets:</strong> Property, investments, valuables with distribution instructions</li>
              <li><strong>Beneficiaries:</strong> Who receives what, with percentage allocations</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Asset Distribution Options</h3>
            <p className="text-gray-700 mb-2">
              For each asset, choose how to document distribution:
            </p>
            <ul className="text-gray-700 space-y-1 list-disc list-inside ml-4">
              <li><strong>Simple:</strong> Quick text description (e.g., "Split equally among children")</li>
              <li><strong>Structured:</strong> Detailed breakdown with percentages per beneficiary</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Funeral & Memorial Preferences</h3>
            <p className="text-gray-700">
              Document your wishes for burial or cremation, service preferences, memorial donations, and any specific instructions for your loved ones.
            </p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800 font-medium mb-1">Legal Reminder</p>
            <p className="text-sm text-yellow-700">
              Life Binder is not a legal document and doesn't replace a properly executed will. Use it to document and communicate your wishes, but ensure legal documents are filed appropriately.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'emergency',
      title: 'Emergency Module',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Prepare your family for emergencies with meeting locations, evacuation plans, and critical information.
          </p>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Meeting Locations</h3>
            <p className="text-gray-700 mb-2">
              Designate places where family should meet if separated during an emergency:
            </p>
            <ul className="text-gray-700 space-y-1 list-disc list-inside ml-4">
              <li><strong>Primary:</strong> Nearby location (e.g., neighbor's house, park)</li>
              <li><strong>Secondary:</strong> Outside neighborhood (e.g., library, school)</li>
              <li><strong>Tertiary:</strong> Out-of-area location (e.g., relative's home)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Utility Shutoffs</h3>
            <p className="text-gray-700">
              Document how to shut off gas, water, and electricity in case of emergency. Include valve locations, required tools, and any special instructions.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Grab List</h3>
            <p className="text-gray-700 mb-2">
              Items to grab if you need to evacuate quickly. Assign priorities (1 = highest):
            </p>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside ml-4">
              <li>Important documents and IDs</li>
              <li>Medications and medical supplies</li>
              <li>Cash and credit cards</li>
              <li>Phone chargers and portable batteries</li>
              <li>Photos and irreplaceable items</li>
              <li>Pet supplies and carriers</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Emergency Contacts</h3>
            <p className="text-gray-700">
              List local emergency contacts beyond 911: doctors, veterinarians, insurance agents, utility companies, and neighbors who can help.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'export',
      title: 'Export Module',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Export your Life Binder as a PDF or encrypted backup file to store securely or share with trusted contacts.
          </p>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">PDF Export</h3>
            <p className="text-gray-700 mb-2">
              Creates a comprehensive PDF document with all your information formatted for easy reading. Perfect for:
            </p>
            <ul className="text-gray-700 space-y-1 list-disc list-inside ml-4">
              <li>Printing and storing in a safe location</li>
              <li>Sharing with your executor or family</li>
              <li>Keeping an offline backup</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Encrypted JSON Export</h3>
            <p className="text-gray-700 mb-2">
              Exports your entire plan as an encrypted JSON file. This is your digital backup:
            </p>
            <ul className="text-gray-700 space-y-1 list-disc list-inside ml-4">
              <li>Can be imported back into Life Binder later</li>
              <li>Encrypted with your passphrase (if encryption is enabled)</li>
              <li>Includes all data and settings</li>
              <li>Store in cloud storage or external drive</li>
            </ul>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800 font-medium mb-1">Backup Strategy</p>
            <p className="text-sm text-green-700">
              Export regularly and store backups in multiple locations: one with your executor, one in a safe deposit box, and one in secure cloud storage. Update whenever you make significant changes.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">How Your Data is Protected</h3>
            <p className="text-gray-700 mb-2">
              Life Binder is designed with privacy and security as top priorities:
            </p>
            <ul className="text-gray-700 space-y-2 list-disc list-inside ml-4">
              <li><strong>Client-Side Storage:</strong> All data is stored locally in your browser (unless you choose Supabase)</li>
              <li><strong>No Cloud Sync:</strong> Nothing is automatically uploaded to external servers</li>
              <li><strong>Encryption:</strong> Optional AES-256 encryption with your chosen passphrase</li>
              <li><strong>Auto-Lock:</strong> Automatically locks after inactivity to prevent unauthorized access</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Encryption Explained</h3>
            <p className="text-gray-700 mb-2">
              When you enable encryption:
            </p>
            <ul className="text-gray-700 space-y-1 list-disc list-inside ml-4">
              <li>Your data is encrypted with AES-256 before being stored</li>
              <li>Only your passphrase can decrypt it</li>
              <li>Even if someone accesses your browser, they can't read your data</li>
              <li>Your passphrase is never stored - only you know it</li>
            </ul>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800 font-medium mb-2">Critical: Passphrase Recovery</p>
            <p className="text-sm text-red-700">
              If you lose your passphrase, your data CANNOT be recovered. There is no "forgot password" option. Write down your passphrase and store it in a secure location your executor can access.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Sensitivity Levels</h3>
            <p className="text-gray-700 mb-2">
              Some modules (like Estate Planning and Access) allow you to mark data as "High Sensitivity":
            </p>
            <ul className="text-gray-700 space-y-1 list-disc list-inside ml-4">
              <li>Visual warning reminders about the sensitive nature</li>
              <li>Helps you remember to be extra careful with this information</li>
              <li>Consider additional security measures for high-sensitivity data</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'best-practices',
      title: 'Best Practices',
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Regular Updates</h3>
            <ul className="text-gray-700 space-y-2 list-disc list-inside ml-4">
              <li><strong>Annually:</strong> Review all information for accuracy</li>
              <li><strong>After major life events:</strong> Marriage, divorce, birth, death, moving</li>
              <li><strong>After password changes:</strong> Update access information immediately</li>
              <li><strong>After new accounts:</strong> Add subscriptions and services as you create them</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Sharing Guidelines</h3>
            <p className="text-gray-700 mb-2">
              Think carefully about who should have access:
            </p>
            <ul className="text-gray-700 space-y-2 list-disc list-inside ml-4">
              <li><strong>Your Executor:</strong> Should have full access or know where to find your Life Binder</li>
              <li><strong>Trusted Family:</strong> May need PDF exports of relevant sections</li>
              <li><strong>Attorney:</strong> Consider sharing estate planning sections</li>
              <li><strong>Digital Heir:</strong> Someone tech-savvy to handle online accounts</li>
            </ul>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 font-medium mb-2">Communication is Key</p>
            <p className="text-sm text-blue-700">
              Tell your executor where your Life Binder backup is stored and provide them with your passphrase in a secure manner (sealed envelope, password manager emergency access, etc.).
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Incremental Approach</h3>
            <p className="text-gray-700">
              Don't try to complete everything at once. Start with the most critical information (contacts, notification plan, password manager access) and build from there. Even a partially completed Life Binder is valuable.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'faq',
      title: 'Frequently Asked Questions',
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">What happens to my data?</h3>
            <p className="text-gray-700">
              Your data stays on your device unless you export it. By default, it's stored in your browser's localStorage. If you choose to use Supabase storage, you control that instance.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Can I use Life Binder on multiple devices?</h3>
            <p className="text-gray-700">
              Life Binder stores data locally per device. To sync across devices, export from one device and import to another, or use cloud storage for your exported backups.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Is Life Binder legally binding?</h3>
            <p className="text-gray-700">
              No. Life Binder is a personal organizational tool, not a legal document. Always work with an attorney for legally binding wills, trusts, and estate documents.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">What if I clear my browser data?</h3>
            <p className="text-gray-700">
              If you clear browser storage, your Life Binder data will be deleted. This is why regular encrypted exports are crucial - they allow you to restore your data.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Should I include actual passwords?</h3>
            <p className="text-gray-700">
              For highly sensitive passwords (like your master password), consider storing them separately and referencing their location in Life Binder. For less critical passwords, encryption provides strong protection.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">How do I know what percentage complete is "enough"?</h3>
            <p className="text-gray-700">
              There's no magic number. Focus on documenting what matters most to your situation. If you live alone, emergency contacts might be more important than estate details. Tailor it to your needs.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Can I customize categories or add custom fields?</h3>
            <p className="text-gray-700">
              Currently, Life Binder has fixed categories, but most sections have notes fields for additional information. Use these for custom details that don't fit standard fields.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">What's the difference between Contacts and Emergency Contacts?</h3>
            <p className="text-gray-700">
              Contacts are people in your life (family, friends, professionals). Emergency Contacts in the Emergency module are specific to disaster scenarios (e.g., neighbors, local services). There may be overlap.
            </p>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Help & Guide</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Everything you need to know about using Life Binder effectively
          </p>
        </div>

        <Card>
          <div className="relative">
            <input
              type="text"
              placeholder="Search help topics..."
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
              <p className="text-gray-500">No help topics found matching "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear search
              </button>
            </div>
          </Card>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Need More Help?</h3>
          <p className="text-blue-800 text-sm">
            Life Binder is designed to be intuitive, but everyone's situation is unique. Take your time exploring each module and don't hesitate to use the notes fields for information that doesn't fit standard categories. Remember: the best Life Binder is one that's started, even if it's not perfect.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
