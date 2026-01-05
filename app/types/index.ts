export type SensitivityLevel = 'normal' | 'high';

export type AccountStatus = 'keep' | 'cancel' | 'review';

export type LocationType = 'physical' | 'digital' | 'both';

export type SocialMediaDisposition = 'keep' | 'close' | 'export_first' | 'memorialize';

export interface Contact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  notes: string;
  notifyBeforeSocial: boolean;
  order: number;
}

export interface NotificationPlan {
  orderedContactIds: string[];
  socialMediaDrafts: string[];
  privateMessageDraft: string;
}

export interface PrimaryEmail {
  id: string;
  email: string;
  provider: string;
  notes: string;
}

export interface Device {
  id: string;
  type: string;
  name: string;
  retentionNotes: string;
  intendedRecipient?: string;
  disposalInstructions?: string;
  disposalPlan?: string;
  requiresDataWipe?: boolean;
}

export interface NetworkInfrastructure {
  id: string;
  type?: string;
  name?: string;
  location?: string;
  accessInfo?: string;
  routerModemModel?: string;
  wifiNetworkName?: string;
  wifiCredentialsLocation?: string;
  adminPanelUrl?: string;
  adminCredentialsLocation?: string;
  restartProcedures?: string;
  technicalSupportContact?: string;
  notes: string;
}

export interface IoTDevice {
  id: string;
  type?: string;
  deviceType?: string;
  name: string;
  location?: string;
  accountInfo?: string;
  hubController?: string;
  credentialsLocation?: string;
  recipientDisposition?: string;
  notes: string;
}

export interface AccessInfo {
  primaryEmails: PrimaryEmail[];
  passwordManagerNotes: string;
  twoFANotes: string;
  devices: Device[];
  networkInfrastructure: NetworkInfrastructure[];
  iotDevices: IoTDevice[];
}

export interface Subscription {
  id: string;
  name: string;
  type: string;
  status: AccountStatus;
  notes: string;
  autoPayEnabled?: boolean;
  contractEndDate?: string;
  cancellationNoticeDays?: number;
  paymentMethod?: string;
  monthlyFee?: string;
}

export interface CloudService {
  id: string;
  name: string;
  provider: string;
  status: AccountStatus;
  billingWarning: boolean;
  notes: string;
  autoPayEnabled?: boolean;
}

export interface SocialMediaAccount {
  id: string;
  platform: string;
  username: string;
  status?: AccountStatus;
  disposition: SocialMediaDisposition;
  exportInstructions: string;
  notes: string;
}

export interface Domain {
  id: string;
  name: string;
  registrar: string;
  expirationDate: string;
  notes: string;
}

export interface HostingAccount {
  id: string;
  provider: string;
  accountName: string;
  renewalDate: string;
  notes: string;
}

export interface AccountsInfo {
  subscriptions: Subscription[];
  cloudServices: CloudService[];
  domains: Domain[];
  hosting: HostingAccount[];
  socialMedia: SocialMediaAccount[];
}

export interface Document {
  id: string;
  title: string;
  locationType: LocationType;
  location: string;
  details: string;
  notes: string;
  sensitivity: SensitivityLevel;
}

export interface MeetingLocation {
  id: string;
  name: string;
  address: string;
  notes: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  notes: string;
}

export interface GrabListItem {
  id: string;
  item: string;
  location: string;
  priority: number;
}

export interface EmergencyInfo {
  meetingLocations: MeetingLocation[];
  utilityShutoffNotes: string;
  emergencyContacts: EmergencyContact[];
  grabList: GrabListItem[];
  generalNotes: string;
}

export type EstateContactType = 'existing' | 'new';

export interface EstateContact {
  id: string;
  type: EstateContactType;
  existingContactId?: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

export type AssetInputMode = 'simple' | 'structured';

export interface Beneficiary {
  id: string;
  contactId: string;
  percentage?: number;
  specificItems?: string;
  notes: string;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  inputMode: AssetInputMode;
  simpleDistribution: string;
  beneficiaries: Beneficiary[];
  location: string;
  estimatedValue: string;
  notes: string;
}

export interface WillTestamentsInfo {
  sensitivity: SensitivityLevel;
  willLocation: string;
  trustLocation: string;
  executor: string;
  executorContact: string;
  attorney: string;
  attorneyContact: string;
  accountant: string;
  accountantContact: string;
  estateContacts: EstateContact[];
  assets: Asset[];
  funeralPreferences: string;
  specialInstructions: string;
  generalNotes: string;
}

export interface BankAccount {
  id: string;
  institution: string;
  accountType: string;
  accountNumber: string;
  routingNumber: string;
  contactInfo: string;
  notes: string;
}

export interface Investment {
  id: string;
  type: string;
  institution: string;
  accountNumber: string;
  estimatedValue: string;
  beneficiaries: string;
  notes: string;
}

export interface RetirementAccount {
  id: string;
  type: string;
  institution: string;
  accountNumber: string;
  estimatedValue: string;
  beneficiaries: string;
  notes: string;
}

export interface InsurancePolicy {
  id: string;
  type: string;
  provider: string;
  policyNumber: string;
  coverageAmount: string;
  beneficiaries: string;
  notes: string;
}

export interface LoanDebt {
  id: string;
  type: string;
  lender: string;
  accountNumber: string;
  balance: string;
  paymentDetails: string;
  coSigners: string;
  notes: string;
}

export interface CreditCard {
  id: string;
  issuer: string;
  lastFourDigits: string;
  creditLimit: string;
  paymentInfo: string;
  notes: string;
}

export interface SafeDepositBox {
  id: string;
  bankLocation: string;
  boxNumber: string;
  keyLocation: string;
  contents: string;
  notes: string;
}

export interface FinancialAdvisor {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  servicesProvided: string;
  notes: string;
}

export interface Accountant {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  hasTaxHistoryAccess?: boolean;
  yearsServiced?: string;
  servicesProvided: string;
  notes: string;
}

export interface ResidualIncome {
  id: string;
  source?: string;
  sourceName?: string;
  frequency?: string;
  amount?: string;
  managementInfo?: string;
  platformPublisher?: string;
  paymentFrequency?: string;
  contactInfo?: string;
  accessDetails?: string;
  notes: string;
}

export interface CryptoCurrency {
  id: string;
  type?: string;
  platform?: string;
  holdings?: string;
  accessInfo?: string;
  currencyType?: string;
  exchangeWalletProvider?: string;
  accessInstructions?: string;
  trustedContact?: string;
  notes: string;
}

export interface TaxDocument {
  id: string;
  year: string;
  location: string;
  preparerName: string;
  preparerContact: string;
  notes: string;
}

export interface FinancialInfo {
  bankAccounts: BankAccount[];
  investments: Investment[];
  retirementAccounts: RetirementAccount[];
  insurancePolicies: InsurancePolicy[];
  loansDebts: LoanDebt[];
  creditCards: CreditCard[];
  safeDepositBoxes: SafeDepositBox[];
  financialAdvisors: FinancialAdvisor[];
  accountants: Accountant[];
  residualIncome: ResidualIncome[];
  cryptocurrency: CryptoCurrency[];
  taxDocuments: TaxDocument[];
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  dateCreated: string;
  dateModified: string;
  isPinned: boolean;
  color: string;
}

export interface Safe {
  id: string;
  type?: string;
  location: string;
  combinationAccessMethod?: string;
  accessMethod?: string;
  contents: string;
  notes: string;
}

export interface Cabinet {
  id: string;
  type: string;
  location: string;
  keyLocation: string;
  contents: string;
  notes: string;
}

export interface SecuritySystem {
  id: string;
  systemType: string;
  provider?: string;
  code: string;
  resetInstructions: string;
  notes: string;
}

export interface Key {
  id: string;
  keyType?: string;
  keyFor?: string;
  quantity?: string;
  location?: string;
  locations?: string;
  opensWhat?: string;
  notes: string;
}

export interface PhysicalSecurityInfo {
  safes: Safe[];
  cabinets: Cabinet[];
  securitySystems: SecuritySystem[];
  keys?: Key[];
  physicalKeys?: Key[];
}

export interface SecurityQuestion {
  id: string;
  account?: string;
  question?: string;
  answer?: string;
  answerHint?: string;
  notes: string;
}

export interface SecurityRecoveryInfo {
  securityQuestions: SecurityQuestion[];
  backupCodes?: string;
  recoveryNotes?: string;
}

export interface UserPreferences {
  showEncryptionWarning: boolean;
  autoLockMinutes: number;
}

export interface Plan {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  isEncrypted: boolean;
  preferences: UserPreferences;
  contacts: Contact[];
  notificationPlan: NotificationPlan;
  access: AccessInfo;
  accounts: AccountsInfo;
  documents: Document[];
  physicalSecurity: PhysicalSecurityInfo;
  emergency: EmergencyInfo;
  securityRecovery: SecurityRecoveryInfo;
  willTestaments: WillTestamentsInfo;
  financial: FinancialInfo;
  notes: Note[];
}

export interface EncryptedData {
  encrypted: string;
  iv: string;
  salt: string;
}
