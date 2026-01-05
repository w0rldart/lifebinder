import { useState, useMemo } from 'react';
import { AppLayout } from '~/components/AppLayout';
import { Button } from '~/components/Button';
import { Modal } from '~/components/Modal';
import { Input } from '~/components/Input';
import { TextArea } from '~/components/TextArea';
import { EmptyState } from '~/components/EmptyState';
import { useSession } from '~/lib/session-context';
import { useModalForm } from '~/hooks/useModalForm';
import { usePlanUpdater } from '~/hooks/usePlanUpdater';
import type {
  BankAccount,
  Investment,
  RetirementAccount,
  InsurancePolicy,
  LoanDebt,
  CreditCard,
  SafeDepositBox,
  FinancialAdvisor,
  Accountant,
  ResidualIncome,
  CryptoCurrency,
  TaxDocument,
} from '~/types';
import { Edit2, Trash2 } from 'lucide-react';

type Category =
  | 'banks'
  | 'investments'
  | 'retirement'
  | 'insurance'
  | 'debts'
  | 'cards'
  | 'safety'
  | 'advisors'
  | 'accountants'
  | 'residual'
  | 'crypto'
  | 'taxes';

interface FinancialItem {
  id: string;
  category: Category;
  data: BankAccount | Investment | RetirementAccount | InsurancePolicy | LoanDebt | CreditCard | SafeDepositBox | FinancialAdvisor | Accountant | ResidualIncome | CryptoCurrency | TaxDocument;
  dateAdded?: string;
}

export default function Financial() {
  const { plan } = useSession();
  const { updatePlan } = usePlanUpdater();
  const [selectedCategories, setSelectedCategories] = useState<Set<Category>>(
    new Set(['banks', 'investments', 'retirement', 'insurance', 'debts', 'cards', 'safety', 'advisors', 'accountants', 'residual', 'crypto', 'taxes'])
  );
  const [showAddModal, setShowAddModal] = useState(false);

  const bankForm = useModalForm<Partial<BankAccount>>({
    institution: '',
    accountType: '',
    accountNumber: '',
    routingNumber: '',
    contactInfo: '',
    notes: '',
  });

  const investmentForm = useModalForm<Partial<Investment>>({
    type: '',
    institution: '',
    accountNumber: '',
    estimatedValue: '',
    beneficiaries: '',
    notes: '',
  });

  const retirementForm = useModalForm<Partial<RetirementAccount>>({
    type: '',
    institution: '',
    accountNumber: '',
    estimatedValue: '',
    beneficiaries: '',
    notes: '',
  });

  const insuranceForm = useModalForm<Partial<InsurancePolicy>>({
    type: '',
    provider: '',
    policyNumber: '',
    coverageAmount: '',
    beneficiaries: '',
    notes: '',
  });

  const debtForm = useModalForm<Partial<LoanDebt>>({
    type: '',
    lender: '',
    accountNumber: '',
    balance: '',
    paymentDetails: '',
    coSigners: '',
    notes: '',
  });

  const cardForm = useModalForm<Partial<CreditCard>>({
    issuer: '',
    lastFourDigits: '',
    creditLimit: '',
    paymentInfo: '',
    notes: '',
  });

  const safetyForm = useModalForm<Partial<SafeDepositBox>>({
    bankLocation: '',
    boxNumber: '',
    keyLocation: '',
    contents: '',
    notes: '',
  });

  const advisorForm = useModalForm<Partial<FinancialAdvisor>>({
    name: '',
    company: '',
    phone: '',
    email: '',
    servicesProvided: '',
    notes: '',
  });

  const taxForm = useModalForm<Partial<TaxDocument>>({
    year: '',
    location: '',
    preparerName: '',
    preparerContact: '',
    notes: '',
  });

  const accountantForm = useModalForm<Partial<Accountant>>({
    name: '',
    company: '',
    phone: '',
    email: '',
    hasTaxHistoryAccess: false,
    yearsServiced: '',
    servicesProvided: '',
    notes: '',
  });

  const residualForm = useModalForm<Partial<ResidualIncome>>({
    sourceName: '',
    platformPublisher: '',
    paymentFrequency: '',
    contactInfo: '',
    accessDetails: '',
    notes: '',
  });

  const cryptoForm = useModalForm<Partial<CryptoCurrency>>({
    currencyType: '',
    exchangeWalletProvider: '',
    accessInstructions: '',
    trustedContact: '',
    notes: '',
  });

  const categories = [
    { id: 'banks' as Category, label: 'Bank Accounts', icon: '🏦', color: 'blue' },
    { id: 'investments' as Category, label: 'Investments', icon: '📈', color: 'green' },
    { id: 'retirement' as Category, label: 'Retirement', icon: '🎯', color: 'teal' },
    { id: 'insurance' as Category, label: 'Insurance', icon: '🛡️', color: 'orange' },
    { id: 'debts' as Category, label: 'Loans & Debts', icon: '📋', color: 'red' },
    { id: 'cards' as Category, label: 'Credit Cards', icon: '💳', color: 'gray' },
    { id: 'safety' as Category, label: 'Safe Deposit', icon: '🔐', color: 'slate' },
    { id: 'advisors' as Category, label: 'Financial Advisors', icon: '👔', color: 'cyan' },
    { id: 'accountants' as Category, label: 'Accountants', icon: '🧮', color: 'purple' },
    { id: 'residual' as Category, label: 'Residual Income', icon: '💰', color: 'emerald' },
    { id: 'crypto' as Category, label: 'Cryptocurrency', icon: '₿', color: 'yellow' },
    { id: 'taxes' as Category, label: 'Tax Documents', icon: '📑', color: 'amber' },
  ];

  const toggleCategory = (categoryId: Category) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId);
    } else {
      newSelected.add(categoryId);
    }
    setSelectedCategories(newSelected);
  };

  const toggleAll = () => {
    if (selectedCategories.size === categories.length) {
      setSelectedCategories(new Set());
    } else {
      setSelectedCategories(new Set(categories.map((c) => c.id)));
    }
  };

  const allItems = useMemo(() => {
    if (!plan) return [];
    const items: FinancialItem[] = [];

    plan.financial.bankAccounts.forEach((item) => items.push({ id: item.id, category: 'banks', data: item }));
    plan.financial.investments.forEach((item) => items.push({ id: item.id, category: 'investments', data: item }));
    plan.financial.retirementAccounts.forEach((item) => items.push({ id: item.id, category: 'retirement', data: item }));
    plan.financial.insurancePolicies.forEach((item) => items.push({ id: item.id, category: 'insurance', data: item }));
    plan.financial.loansDebts.forEach((item) => items.push({ id: item.id, category: 'debts', data: item }));
    plan.financial.creditCards.forEach((item) => items.push({ id: item.id, category: 'cards', data: item }));
    plan.financial.safeDepositBoxes.forEach((item) => items.push({ id: item.id, category: 'safety', data: item }));
    plan.financial.financialAdvisors.forEach((item) => items.push({ id: item.id, category: 'advisors', data: item }));
    plan.financial.accountants.forEach((item) => items.push({ id: item.id, category: 'accountants', data: item }));
    plan.financial.residualIncome.forEach((item) => items.push({ id: item.id, category: 'residual', data: item }));
    plan.financial.cryptocurrency.forEach((item) => items.push({ id: item.id, category: 'crypto', data: item }));
    plan.financial.taxDocuments.forEach((item) => items.push({ id: item.id, category: 'taxes', data: item }));

    return items
      .filter((item) => selectedCategories.has(item.category))
      .sort((a, b) => b.id.localeCompare(a.id));
  }, [plan, selectedCategories]);

  const getCategoryInfo = (category: Category) => {
    return categories.find((c) => c.id === category)!;
  };

  const getCategoryCount = (categoryId: Category) => {
    if (!plan) return 0;
    const counts = {
      banks: plan.financial.bankAccounts.length,
      investments: plan.financial.investments.length,
      retirement: plan.financial.retirementAccounts.length,
      insurance: plan.financial.insurancePolicies.length,
      debts: plan.financial.loansDebts.length,
      cards: plan.financial.creditCards.length,
      safety: plan.financial.safeDepositBoxes.length,
      advisors: plan.financial.financialAdvisors.length,
      accountants: plan.financial.accountants.length,
      residual: plan.financial.residualIncome.length,
      crypto: plan.financial.cryptocurrency.length,
      taxes: plan.financial.taxDocuments.length,
    };
    return counts[categoryId];
  };

  const handleSaveBank = async () => {
    if (!plan || !bankForm.formData.institution) return;
    const item: BankAccount = {
      id: bankForm.editingItem?.id || crypto.randomUUID(),
      institution: bankForm.formData.institution || '',
      accountType: bankForm.formData.accountType || '',
      accountNumber: bankForm.formData.accountNumber || '',
      routingNumber: bankForm.formData.routingNumber || '',
      contactInfo: bankForm.formData.contactInfo || '',
      notes: bankForm.formData.notes || '',
    };
    const updated = bankForm.editingItem
      ? plan.financial.bankAccounts.map((b) => (b.id === bankForm.editingItem!.id ? item : b))
      : [...plan.financial.bankAccounts, item];
    await updatePlan({ ...plan, financial: { ...plan.financial, bankAccounts: updated } }, 'Bank account saved');
    bankForm.closeModal();
  };

  const handleDeleteBank = async (id: string) => {
    if (!plan) return;
    if (!confirm('Are you sure you want to delete this bank account? This action cannot be undone.')) return;
    const updated = plan.financial.bankAccounts.filter((b) => b.id !== id);
    await updatePlan({ ...plan, financial: { ...plan.financial, bankAccounts: updated } }, 'Bank account deleted');
  };

  const handleSaveInvestment = async () => {
    if (!plan || !investmentForm.formData.type) return;
    const item: Investment = {
      id: investmentForm.editingItem?.id || crypto.randomUUID(),
      type: investmentForm.formData.type || '',
      institution: investmentForm.formData.institution || '',
      accountNumber: investmentForm.formData.accountNumber || '',
      estimatedValue: investmentForm.formData.estimatedValue || '',
      beneficiaries: investmentForm.formData.beneficiaries || '',
      notes: investmentForm.formData.notes || '',
    };
    const updated = investmentForm.editingItem
      ? plan.financial.investments.map((i) => (i.id === investmentForm.editingItem!.id ? item : i))
      : [...plan.financial.investments, item];
    await updatePlan({ ...plan, financial: { ...plan.financial, investments: updated } }, 'Investment saved');
    investmentForm.closeModal();
  };

  const handleDeleteInvestment = async (id: string) => {
    if (!plan) return;
    if (!confirm('Are you sure you want to delete this investment? This action cannot be undone.')) return;
    const updated = plan.financial.investments.filter((i) => i.id !== id);
    await updatePlan({ ...plan, financial: { ...plan.financial, investments: updated } }, 'Investment deleted');
  };

  const handleSaveRetirement = async () => {
    if (!plan || !retirementForm.formData.type) return;
    const item: RetirementAccount = {
      id: retirementForm.editingItem?.id || crypto.randomUUID(),
      type: retirementForm.formData.type || '',
      institution: retirementForm.formData.institution || '',
      accountNumber: retirementForm.formData.accountNumber || '',
      estimatedValue: retirementForm.formData.estimatedValue || '',
      beneficiaries: retirementForm.formData.beneficiaries || '',
      notes: retirementForm.formData.notes || '',
    };
    const updated = retirementForm.editingItem
      ? plan.financial.retirementAccounts.map((r) => (r.id === retirementForm.editingItem!.id ? item : r))
      : [...plan.financial.retirementAccounts, item];
    await updatePlan({ ...plan, financial: { ...plan.financial, retirementAccounts: updated } }, 'Retirement account saved');
    retirementForm.closeModal();
  };

  const handleDeleteRetirement = async (id: string) => {
    if (!plan) return;
    if (!confirm('Are you sure you want to delete this retirement account? This action cannot be undone.')) return;
    const updated = plan.financial.retirementAccounts.filter((r) => r.id !== id);
    await updatePlan({ ...plan, financial: { ...plan.financial, retirementAccounts: updated } }, 'Retirement account deleted');
  };

  const handleSaveInsurance = async () => {
    if (!plan || !insuranceForm.formData.type) return;
    const item: InsurancePolicy = {
      id: insuranceForm.editingItem?.id || crypto.randomUUID(),
      type: insuranceForm.formData.type || '',
      provider: insuranceForm.formData.provider || '',
      policyNumber: insuranceForm.formData.policyNumber || '',
      coverageAmount: insuranceForm.formData.coverageAmount || '',
      beneficiaries: insuranceForm.formData.beneficiaries || '',
      notes: insuranceForm.formData.notes || '',
    };
    const updated = insuranceForm.editingItem
      ? plan.financial.insurancePolicies.map((i) => (i.id === insuranceForm.editingItem!.id ? item : i))
      : [...plan.financial.insurancePolicies, item];
    await updatePlan({ ...plan, financial: { ...plan.financial, insurancePolicies: updated } }, 'Insurance policy saved');
    insuranceForm.closeModal();
  };

  const handleDeleteInsurance = async (id: string) => {
    if (!plan) return;
    if (!confirm('Are you sure you want to delete this insurance policy? This action cannot be undone.')) return;
    const updated = plan.financial.insurancePolicies.filter((i) => i.id !== id);
    await updatePlan({ ...plan, financial: { ...plan.financial, insurancePolicies: updated } }, 'Insurance policy deleted');
  };

  const handleSaveDebt = async () => {
    if (!plan || !debtForm.formData.type) return;
    const item: LoanDebt = {
      id: debtForm.editingItem?.id || crypto.randomUUID(),
      type: debtForm.formData.type || '',
      lender: debtForm.formData.lender || '',
      accountNumber: debtForm.formData.accountNumber || '',
      balance: debtForm.formData.balance || '',
      paymentDetails: debtForm.formData.paymentDetails || '',
      coSigners: debtForm.formData.coSigners || '',
      notes: debtForm.formData.notes || '',
    };
    const updated = debtForm.editingItem
      ? plan.financial.loansDebts.map((d) => (d.id === debtForm.editingItem!.id ? item : d))
      : [...plan.financial.loansDebts, item];
    await updatePlan({ ...plan, financial: { ...plan.financial, loansDebts: updated } }, 'Debt saved');
    debtForm.closeModal();
  };

  const handleDeleteDebt = async (id: string) => {
    if (!plan) return;
    if (!confirm('Are you sure you want to delete this debt? This action cannot be undone.')) return;
    const updated = plan.financial.loansDebts.filter((d) => d.id !== id);
    await updatePlan({ ...plan, financial: { ...plan.financial, loansDebts: updated } }, 'Debt deleted');
  };

  const handleSaveCard = async () => {
    if (!plan || !cardForm.formData.issuer) return;
    const item: CreditCard = {
      id: cardForm.editingItem?.id || crypto.randomUUID(),
      issuer: cardForm.formData.issuer || '',
      lastFourDigits: cardForm.formData.lastFourDigits || '',
      creditLimit: cardForm.formData.creditLimit || '',
      paymentInfo: cardForm.formData.paymentInfo || '',
      notes: cardForm.formData.notes || '',
    };
    const updated = cardForm.editingItem
      ? plan.financial.creditCards.map((c) => (c.id === cardForm.editingItem!.id ? item : c))
      : [...plan.financial.creditCards, item];
    await updatePlan({ ...plan, financial: { ...plan.financial, creditCards: updated } }, 'Credit card saved');
    cardForm.closeModal();
  };

  const handleDeleteCard = async (id: string) => {
    if (!plan) return;
    if (!confirm('Are you sure you want to delete this credit card? This action cannot be undone.')) return;
    const updated = plan.financial.creditCards.filter((c) => c.id !== id);
    await updatePlan({ ...plan, financial: { ...plan.financial, creditCards: updated } }, 'Credit card deleted');
  };

  const handleSaveSafety = async () => {
    if (!plan || !safetyForm.formData.bankLocation) return;
    const item: SafeDepositBox = {
      id: safetyForm.editingItem?.id || crypto.randomUUID(),
      bankLocation: safetyForm.formData.bankLocation || '',
      boxNumber: safetyForm.formData.boxNumber || '',
      keyLocation: safetyForm.formData.keyLocation || '',
      contents: safetyForm.formData.contents || '',
      notes: safetyForm.formData.notes || '',
    };
    const updated = safetyForm.editingItem
      ? plan.financial.safeDepositBoxes.map((s) => (s.id === safetyForm.editingItem!.id ? item : s))
      : [...plan.financial.safeDepositBoxes, item];
    await updatePlan({ ...plan, financial: { ...plan.financial, safeDepositBoxes: updated } }, 'Safe deposit box saved');
    safetyForm.closeModal();
  };

  const handleDeleteSafety = async (id: string) => {
    if (!plan) return;
    if (!confirm('Are you sure you want to delete this safe deposit box? This action cannot be undone.')) return;
    const updated = plan.financial.safeDepositBoxes.filter((s) => s.id !== id);
    await updatePlan({ ...plan, financial: { ...plan.financial, safeDepositBoxes: updated } }, 'Safe deposit box deleted');
  };

  const handleSaveAdvisor = async () => {
    if (!plan || !advisorForm.formData.name) return;
    const item: FinancialAdvisor = {
      id: advisorForm.editingItem?.id || crypto.randomUUID(),
      name: advisorForm.formData.name || '',
      company: advisorForm.formData.company || '',
      phone: advisorForm.formData.phone || '',
      email: advisorForm.formData.email || '',
      servicesProvided: advisorForm.formData.servicesProvided || '',
      notes: advisorForm.formData.notes || '',
    };
    const updated = advisorForm.editingItem
      ? plan.financial.financialAdvisors.map((a) => (a.id === advisorForm.editingItem!.id ? item : a))
      : [...plan.financial.financialAdvisors, item];
    await updatePlan({ ...plan, financial: { ...plan.financial, financialAdvisors: updated } }, 'Financial advisor saved');
    advisorForm.closeModal();
  };

  const handleDeleteAdvisor = async (id: string) => {
    if (!plan) return;
    if (!confirm('Are you sure you want to delete this financial advisor? This action cannot be undone.')) return;
    const updated = plan.financial.financialAdvisors.filter((a) => a.id !== id);
    await updatePlan({ ...plan, financial: { ...plan.financial, financialAdvisors: updated } }, 'Financial advisor deleted');
  };

  const handleSaveTax = async () => {
    if (!plan || !taxForm.formData.year) return;
    const item: TaxDocument = {
      id: taxForm.editingItem?.id || crypto.randomUUID(),
      year: taxForm.formData.year || '',
      location: taxForm.formData.location || '',
      preparerName: taxForm.formData.preparerName || '',
      preparerContact: taxForm.formData.preparerContact || '',
      notes: taxForm.formData.notes || '',
    };
    const updated = taxForm.editingItem
      ? plan.financial.taxDocuments.map((t) => (t.id === taxForm.editingItem!.id ? item : t))
      : [...plan.financial.taxDocuments, item];
    await updatePlan({ ...plan, financial: { ...plan.financial, taxDocuments: updated } }, 'Tax document saved');
    taxForm.closeModal();
  };

  const handleDeleteTax = async (id: string) => {
    if (!plan) return;
    if (!confirm('Are you sure you want to delete this tax document? This action cannot be undone.')) return;
    const updated = plan.financial.taxDocuments.filter((t) => t.id !== id);
    await updatePlan({ ...plan, financial: { ...plan.financial, taxDocuments: updated } }, 'Tax document deleted');
  };

  const handleSaveAccountant = async () => {
    if (!plan || !accountantForm.formData.name) return;
    const item: Accountant = {
      id: accountantForm.editingItem?.id || crypto.randomUUID(),
      name: accountantForm.formData.name || '',
      company: accountantForm.formData.company || '',
      phone: accountantForm.formData.phone || '',
      email: accountantForm.formData.email || '',
      hasTaxHistoryAccess: accountantForm.formData.hasTaxHistoryAccess || false,
      yearsServiced: accountantForm.formData.yearsServiced || '',
      servicesProvided: accountantForm.formData.servicesProvided || '',
      notes: accountantForm.formData.notes || '',
    };
    const updated = accountantForm.editingItem
      ? plan.financial.accountants.map((a) => (a.id === accountantForm.editingItem!.id ? item : a))
      : [...plan.financial.accountants, item];
    await updatePlan({ ...plan, financial: { ...plan.financial, accountants: updated } }, 'Accountant saved');
    accountantForm.closeModal();
  };

  const handleDeleteAccountant = async (id: string) => {
    if (!plan) return;
    if (!confirm('Are you sure you want to delete this accountant? This action cannot be undone.')) return;
    const updated = plan.financial.accountants.filter((a) => a.id !== id);
    await updatePlan({ ...plan, financial: { ...plan.financial, accountants: updated } }, 'Accountant deleted');
  };

  const handleSaveResidual = async () => {
    if (!plan || !residualForm.formData.sourceName) return;
    const item: ResidualIncome = {
      id: residualForm.editingItem?.id || crypto.randomUUID(),
      sourceName: residualForm.formData.sourceName || '',
      platformPublisher: residualForm.formData.platformPublisher || '',
      paymentFrequency: residualForm.formData.paymentFrequency || '',
      contactInfo: residualForm.formData.contactInfo || '',
      accessDetails: residualForm.formData.accessDetails || '',
      notes: residualForm.formData.notes || '',
    };
    const updated = residualForm.editingItem
      ? plan.financial.residualIncome.map((r) => (r.id === residualForm.editingItem!.id ? item : r))
      : [...plan.financial.residualIncome, item];
    await updatePlan({ ...plan, financial: { ...plan.financial, residualIncome: updated } }, 'Residual income saved');
    residualForm.closeModal();
  };

  const handleDeleteResidual = async (id: string) => {
    if (!plan) return;
    if (!confirm('Are you sure you want to delete this residual income source? This action cannot be undone.')) return;
    const updated = plan.financial.residualIncome.filter((r) => r.id !== id);
    await updatePlan({ ...plan, financial: { ...plan.financial, residualIncome: updated } }, 'Residual income deleted');
  };

  const handleSaveCrypto = async () => {
    if (!plan || !cryptoForm.formData.currencyType) return;
    const item: CryptoCurrency = {
      id: cryptoForm.editingItem?.id || crypto.randomUUID(),
      currencyType: cryptoForm.formData.currencyType || '',
      exchangeWalletProvider: cryptoForm.formData.exchangeWalletProvider || '',
      accessInstructions: cryptoForm.formData.accessInstructions || '',
      trustedContact: cryptoForm.formData.trustedContact || '',
      notes: cryptoForm.formData.notes || '',
    };
    const updated = cryptoForm.editingItem
      ? plan.financial.cryptocurrency.map((c) => (c.id === cryptoForm.editingItem!.id ? item : c))
      : [...plan.financial.cryptocurrency, item];
    await updatePlan({ ...plan, financial: { ...plan.financial, cryptocurrency: updated } }, 'Cryptocurrency saved');
    cryptoForm.closeModal();
  };

  const handleDeleteCrypto = async (id: string) => {
    if (!plan) return;
    if (!confirm('Are you sure you want to delete this cryptocurrency holding? This action cannot be undone.')) return;
    const updated = plan.financial.cryptocurrency.filter((c) => c.id !== id);
    await updatePlan({ ...plan, financial: { ...plan.financial, cryptocurrency: updated } }, 'Cryptocurrency deleted');
  };

  const renderCard = (item: FinancialItem) => {
    const categoryInfo = getCategoryInfo(item.category);
    const colorClasses = {
      blue: 'bg-blue-100 text-blue-700',
      green: 'bg-green-100 text-green-700',
      teal: 'bg-teal-100 text-teal-700',
      orange: 'bg-orange-100 text-orange-700',
      red: 'bg-red-100 text-red-700',
      gray: 'bg-gray-200 text-gray-700',
      slate: 'bg-slate-100 text-slate-700',
      cyan: 'bg-cyan-100 text-cyan-700',
      purple: 'bg-purple-100 text-purple-700',
      emerald: 'bg-emerald-100 text-emerald-700',
      yellow: 'bg-yellow-100 text-yellow-700',
      amber: 'bg-amber-100 text-amber-700',
    };

    const getTitle = () => {
      const data = item.data as any;
      switch (item.category) {
        case 'banks': return data.institution;
        case 'investments': return data.institution;
        case 'retirement': return data.institution;
        case 'insurance': return data.provider;
        case 'debts': return data.lender;
        case 'cards': return data.issuer;
        case 'safety': return data.bankLocation;
        case 'advisors': return data.name;
        case 'accountants': return data.name;
        case 'residual': return data.sourceName;
        case 'crypto': return data.currencyType;
        case 'taxes': return `Tax Year ${data.year}`;
        default: return 'Unknown';
      }
    };

    const getSubtitle = () => {
      const data = item.data as any;
      switch (item.category) {
        case 'banks': return data.accountType;
        case 'investments': return data.type;
        case 'retirement': return data.type;
        case 'insurance': return data.type;
        case 'debts': return data.type;
        case 'cards': return `****${data.lastFourDigits}`;
        case 'safety': return `Box ${data.boxNumber}`;
        case 'advisors': return data.company;
        case 'accountants': return data.company;
        case 'residual': return data.platformPublisher;
        case 'crypto': return data.exchangeWalletProvider;
        case 'taxes': return data.location;
        default: return '';
      }
    };

    const handleEdit = () => {
      switch (item.category) {
        case 'banks': bankForm.openModal(item.data as BankAccount); break;
        case 'investments': investmentForm.openModal(item.data as Investment); break;
        case 'retirement': retirementForm.openModal(item.data as RetirementAccount); break;
        case 'insurance': insuranceForm.openModal(item.data as InsurancePolicy); break;
        case 'debts': debtForm.openModal(item.data as LoanDebt); break;
        case 'cards': cardForm.openModal(item.data as CreditCard); break;
        case 'safety': safetyForm.openModal(item.data as SafeDepositBox); break;
        case 'advisors': advisorForm.openModal(item.data as FinancialAdvisor); break;
        case 'accountants': accountantForm.openModal(item.data as Accountant); break;
        case 'residual': residualForm.openModal(item.data as ResidualIncome); break;
        case 'crypto': cryptoForm.openModal(item.data as CryptoCurrency); break;
        case 'taxes': taxForm.openModal(item.data as TaxDocument); break;
      }
    };

    const handleDelete = () => {
      switch (item.category) {
        case 'banks': handleDeleteBank(item.id); break;
        case 'investments': handleDeleteInvestment(item.id); break;
        case 'retirement': handleDeleteRetirement(item.id); break;
        case 'insurance': handleDeleteInsurance(item.id); break;
        case 'debts': handleDeleteDebt(item.id); break;
        case 'cards': handleDeleteCard(item.id); break;
        case 'safety': handleDeleteSafety(item.id); break;
        case 'advisors': handleDeleteAdvisor(item.id); break;
        case 'accountants': handleDeleteAccountant(item.id); break;
        case 'residual': handleDeleteResidual(item.id); break;
        case 'crypto': handleDeleteCrypto(item.id); break;
        case 'taxes': handleDeleteTax(item.id); break;
      }
    };

    return (
      <div key={item.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-xl">{categoryInfo.icon}</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{getTitle()}</h3>
              {getSubtitle() && (
                <span className={`inline-block mt-1 text-xs px-2 py-1 rounded ${colorClasses[categoryInfo.color as keyof typeof colorClasses]}`}>
                  {getSubtitle()}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-1 ml-2">
            <button onClick={handleEdit} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors">
              <Edit2 className="w-4 h-4" />
            </button>
            <button onClick={handleDelete} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-600 space-y-1">
          {item.category === 'banks' && (
            <>
              <p>Account: {(item.data as BankAccount).accountNumber}</p>
              {(item.data as BankAccount).routingNumber && <p>Routing: {(item.data as BankAccount).routingNumber}</p>}
              {(item.data as BankAccount).contactInfo && <p>Contact: {(item.data as BankAccount).contactInfo}</p>}
            </>
          )}
          {item.category === 'investments' && (
            <>
              <p>Account: {(item.data as Investment).accountNumber}</p>
              {(item.data as Investment).estimatedValue && <p>Value: {(item.data as Investment).estimatedValue}</p>}
              {(item.data as Investment).beneficiaries && <p>Beneficiaries: {(item.data as Investment).beneficiaries}</p>}
            </>
          )}
          {item.category === 'retirement' && (
            <>
              <p>Account: {(item.data as RetirementAccount).accountNumber}</p>
              {(item.data as RetirementAccount).estimatedValue && <p>Value: {(item.data as RetirementAccount).estimatedValue}</p>}
              {(item.data as RetirementAccount).beneficiaries && <p>Beneficiaries: {(item.data as RetirementAccount).beneficiaries}</p>}
            </>
          )}
          {item.category === 'insurance' && (
            <>
              <p>Policy: {(item.data as InsurancePolicy).policyNumber}</p>
              {(item.data as InsurancePolicy).coverageAmount && <p>Coverage: {(item.data as InsurancePolicy).coverageAmount}</p>}
              {(item.data as InsurancePolicy).beneficiaries && <p>Beneficiaries: {(item.data as InsurancePolicy).beneficiaries}</p>}
            </>
          )}
          {item.category === 'debts' && (
            <>
              <p>Account: {(item.data as LoanDebt).accountNumber}</p>
              {(item.data as LoanDebt).balance && <p>Balance: {(item.data as LoanDebt).balance}</p>}
              {(item.data as LoanDebt).paymentDetails && <p>Payment: {(item.data as LoanDebt).paymentDetails}</p>}
            </>
          )}
          {item.category === 'cards' && (
            <>
              {(item.data as CreditCard).creditLimit && <p>Limit: {(item.data as CreditCard).creditLimit}</p>}
              {(item.data as CreditCard).paymentInfo && <p>Payment: {(item.data as CreditCard).paymentInfo}</p>}
            </>
          )}
          {item.category === 'safety' && (
            <>
              {(item.data as SafeDepositBox).keyLocation && <p>Key: {(item.data as SafeDepositBox).keyLocation}</p>}
              {(item.data as SafeDepositBox).contents && <p>Contents: {(item.data as SafeDepositBox).contents}</p>}
            </>
          )}
          {item.category === 'advisors' && (
            <>
              {(item.data as FinancialAdvisor).phone && <p>Phone: {(item.data as FinancialAdvisor).phone}</p>}
              {(item.data as FinancialAdvisor).email && <p>Email: {(item.data as FinancialAdvisor).email}</p>}
            </>
          )}
          {item.category === 'taxes' && (
            <>
              {(item.data as TaxDocument).preparerName && <p>Preparer: {(item.data as TaxDocument).preparerName}</p>}
              {(item.data as TaxDocument).preparerContact && <p>Contact: {(item.data as TaxDocument).preparerContact}</p>}
            </>
          )}
        </div>

        {(item.data as any).notes && (
          <p className="text-sm text-gray-500 mt-2 pt-2 border-t border-gray-200">{(item.data as any).notes}</p>
        )}
      </div>
    );
  };

  return (
    <AppLayout>
      {plan && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Financial Information</h1>
              <p className="text-sm sm:text-base text-gray-600">
                Track bank accounts, investments, retirement plans, insurance, debts, and more
              </p>
            </div>
            <Button onClick={() => setShowAddModal(true)} className="sm:flex-shrink-0">Add Item</Button>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={toggleAll}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  selectedCategories.size === categories.length
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {categories.map((category) => {
                const isSelected = selectedCategories.has(category.id);
                const count = getCategoryCount(category.id);
                return (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>{category.icon}</span>
                    <span>{category.label}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${isSelected ? 'bg-blue-700' : 'bg-gray-200'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {allItems.length === 0 ? (
            <EmptyState
              title="No financial items yet"
              description={
                selectedCategories.size === 0
                  ? 'Select at least one category to view items'
                  : 'Add your first financial item to get started'
              }
              actionLabel="Add Item"
              onAction={() => setShowAddModal(true)}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {allItems.map((item) => renderCard(item))}
            </div>
          )}

          <Modal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            title="Add Financial Item"
          >
            <div className="space-y-2">
              <p className="text-sm text-gray-600 mb-4">Select the type of financial item you want to add:</p>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setShowAddModal(false);
                    switch (category.id) {
                      case 'banks': bankForm.openModal(); break;
                      case 'investments': investmentForm.openModal(); break;
                      case 'retirement': retirementForm.openModal(); break;
                      case 'insurance': insuranceForm.openModal(); break;
                      case 'debts': debtForm.openModal(); break;
                      case 'cards': cardForm.openModal(); break;
                      case 'safety': safetyForm.openModal(); break;
                      case 'advisors': advisorForm.openModal(); break;
                      case 'taxes': taxForm.openModal(); break;
                    }
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-2xl">{category.icon}</span>
                  <span className="font-medium text-gray-900">{category.label}</span>
                </button>
              ))}
            </div>
          </Modal>

          <Modal
            isOpen={bankForm.isModalOpen}
            onClose={bankForm.closeModal}
            title={bankForm.editingItem ? 'Edit Bank Account' : 'Add Bank Account'}
            footer={
              <>
                <Button variant="secondary" onClick={bankForm.closeModal}>Cancel</Button>
                <Button onClick={handleSaveBank} disabled={!bankForm.formData.institution?.trim()}>Save</Button>
              </>
            }
          >
            <div className="space-y-4">
              <Input label="Institution" value={bankForm.formData.institution || ''} onChange={(e) => bankForm.updateField('institution', e.target.value)} required />
              <Input label="Account Type" value={bankForm.formData.accountType || ''} onChange={(e) => bankForm.updateField('accountType', e.target.value)} placeholder="Checking, Savings, etc." />
              <Input label="Account Number" value={bankForm.formData.accountNumber || ''} onChange={(e) => bankForm.updateField('accountNumber', e.target.value)} placeholder="Last 4 digits or masked number" />
              <Input label="Routing Number" value={bankForm.formData.routingNumber || ''} onChange={(e) => bankForm.updateField('routingNumber', e.target.value)} />
              <Input label="Contact Info" value={bankForm.formData.contactInfo || ''} onChange={(e) => bankForm.updateField('contactInfo', e.target.value)} placeholder="Phone or website" />
              <TextArea label="Notes" value={bankForm.formData.notes || ''} onChange={(e) => bankForm.updateField('notes', e.target.value)} rows={3} />
            </div>
          </Modal>

          <Modal
            isOpen={investmentForm.isModalOpen}
            onClose={investmentForm.closeModal}
            title={investmentForm.editingItem ? 'Edit Investment' : 'Add Investment'}
            footer={
              <>
                <Button variant="secondary" onClick={investmentForm.closeModal}>Cancel</Button>
                <Button onClick={handleSaveInvestment} disabled={!investmentForm.formData.type?.trim()}>Save</Button>
              </>
            }
          >
            <div className="space-y-4">
              <Input label="Type" value={investmentForm.formData.type || ''} onChange={(e) => investmentForm.updateField('type', e.target.value)} placeholder="Brokerage, Mutual Fund, Stocks, etc." required />
              <Input label="Institution" value={investmentForm.formData.institution || ''} onChange={(e) => investmentForm.updateField('institution', e.target.value)} />
              <Input label="Account Number" value={investmentForm.formData.accountNumber || ''} onChange={(e) => investmentForm.updateField('accountNumber', e.target.value)} />
              <Input label="Estimated Value" value={investmentForm.formData.estimatedValue || ''} onChange={(e) => investmentForm.updateField('estimatedValue', e.target.value)} placeholder="$50,000" />
              <Input label="Beneficiaries" value={investmentForm.formData.beneficiaries || ''} onChange={(e) => investmentForm.updateField('beneficiaries', e.target.value)} />
              <TextArea label="Notes" value={investmentForm.formData.notes || ''} onChange={(e) => investmentForm.updateField('notes', e.target.value)} rows={3} />
            </div>
          </Modal>

          <Modal
            isOpen={retirementForm.isModalOpen}
            onClose={retirementForm.closeModal}
            title={retirementForm.editingItem ? 'Edit Retirement Account' : 'Add Retirement Account'}
            footer={
              <>
                <Button variant="secondary" onClick={retirementForm.closeModal}>Cancel</Button>
                <Button onClick={handleSaveRetirement} disabled={!retirementForm.formData.type?.trim()}>Save</Button>
              </>
            }
          >
            <div className="space-y-4">
              <Input label="Type" value={retirementForm.formData.type || ''} onChange={(e) => retirementForm.updateField('type', e.target.value)} placeholder="401(k), IRA, Roth IRA, 3rd Pillar, Pension, etc." required />
              <Input label="Institution" value={retirementForm.formData.institution || ''} onChange={(e) => retirementForm.updateField('institution', e.target.value)} />
              <Input label="Account Number" value={retirementForm.formData.accountNumber || ''} onChange={(e) => retirementForm.updateField('accountNumber', e.target.value)} />
              <Input label="Estimated Value" value={retirementForm.formData.estimatedValue || ''} onChange={(e) => retirementForm.updateField('estimatedValue', e.target.value)} placeholder="$250,000" />
              <Input label="Beneficiaries" value={retirementForm.formData.beneficiaries || ''} onChange={(e) => retirementForm.updateField('beneficiaries', e.target.value)} />
              <TextArea label="Notes" value={retirementForm.formData.notes || ''} onChange={(e) => retirementForm.updateField('notes', e.target.value)} rows={3} />
            </div>
          </Modal>

          <Modal
            isOpen={insuranceForm.isModalOpen}
            onClose={insuranceForm.closeModal}
            title={insuranceForm.editingItem ? 'Edit Insurance Policy' : 'Add Insurance Policy'}
            footer={
              <>
                <Button variant="secondary" onClick={insuranceForm.closeModal}>Cancel</Button>
                <Button onClick={handleSaveInsurance} disabled={!insuranceForm.formData.type?.trim()}>Save</Button>
              </>
            }
          >
            <div className="space-y-4">
              <Input label="Type" value={insuranceForm.formData.type || ''} onChange={(e) => insuranceForm.updateField('type', e.target.value)} placeholder="Life, Auto, Home, Health, etc." required />
              <Input label="Provider" value={insuranceForm.formData.provider || ''} onChange={(e) => insuranceForm.updateField('provider', e.target.value)} />
              <Input label="Policy Number" value={insuranceForm.formData.policyNumber || ''} onChange={(e) => insuranceForm.updateField('policyNumber', e.target.value)} />
              <Input label="Coverage Amount" value={insuranceForm.formData.coverageAmount || ''} onChange={(e) => insuranceForm.updateField('coverageAmount', e.target.value)} placeholder="$500,000" />
              <Input label="Beneficiaries" value={insuranceForm.formData.beneficiaries || ''} onChange={(e) => insuranceForm.updateField('beneficiaries', e.target.value)} />
              <TextArea label="Notes" value={insuranceForm.formData.notes || ''} onChange={(e) => insuranceForm.updateField('notes', e.target.value)} rows={3} />
            </div>
          </Modal>

          <Modal
            isOpen={debtForm.isModalOpen}
            onClose={debtForm.closeModal}
            title={debtForm.editingItem ? 'Edit Loan/Debt' : 'Add Loan/Debt'}
            footer={
              <>
                <Button variant="secondary" onClick={debtForm.closeModal}>Cancel</Button>
                <Button onClick={handleSaveDebt} disabled={!debtForm.formData.type?.trim()}>Save</Button>
              </>
            }
          >
            <div className="space-y-4">
              <Input label="Type" value={debtForm.formData.type || ''} onChange={(e) => debtForm.updateField('type', e.target.value)} placeholder="Mortgage, Personal Loan, Student Loan, etc." required />
              <Input label="Lender" value={debtForm.formData.lender || ''} onChange={(e) => debtForm.updateField('lender', e.target.value)} />
              <Input label="Account Number" value={debtForm.formData.accountNumber || ''} onChange={(e) => debtForm.updateField('accountNumber', e.target.value)} />
              <Input label="Balance" value={debtForm.formData.balance || ''} onChange={(e) => debtForm.updateField('balance', e.target.value)} placeholder="$25,000" />
              <Input label="Payment Details" value={debtForm.formData.paymentDetails || ''} onChange={(e) => debtForm.updateField('paymentDetails', e.target.value)} placeholder="$500/month, 5% APR" />
              <Input label="Co-Signers" value={debtForm.formData.coSigners || ''} onChange={(e) => debtForm.updateField('coSigners', e.target.value)} />
              <TextArea label="Notes" value={debtForm.formData.notes || ''} onChange={(e) => debtForm.updateField('notes', e.target.value)} rows={3} />
            </div>
          </Modal>

          <Modal
            isOpen={cardForm.isModalOpen}
            onClose={cardForm.closeModal}
            title={cardForm.editingItem ? 'Edit Credit Card' : 'Add Credit Card'}
            footer={
              <>
                <Button variant="secondary" onClick={cardForm.closeModal}>Cancel</Button>
                <Button onClick={handleSaveCard} disabled={!cardForm.formData.issuer?.trim()}>Save</Button>
              </>
            }
          >
            <div className="space-y-4">
              <Input label="Issuer" value={cardForm.formData.issuer || ''} onChange={(e) => cardForm.updateField('issuer', e.target.value)} placeholder="Chase, Amex, etc." required />
              <Input label="Last 4 Digits" value={cardForm.formData.lastFourDigits || ''} onChange={(e) => cardForm.updateField('lastFourDigits', e.target.value)} maxLength={4} />
              <Input label="Credit Limit" value={cardForm.formData.creditLimit || ''} onChange={(e) => cardForm.updateField('creditLimit', e.target.value)} placeholder="$10,000" />
              <Input label="Payment Info" value={cardForm.formData.paymentInfo || ''} onChange={(e) => cardForm.updateField('paymentInfo', e.target.value)} placeholder="Autopay setup, due date, etc." />
              <TextArea label="Notes" value={cardForm.formData.notes || ''} onChange={(e) => cardForm.updateField('notes', e.target.value)} rows={3} />
            </div>
          </Modal>

          <Modal
            isOpen={safetyForm.isModalOpen}
            onClose={safetyForm.closeModal}
            title={safetyForm.editingItem ? 'Edit Safe Deposit Box' : 'Add Safe Deposit Box'}
            footer={
              <>
                <Button variant="secondary" onClick={safetyForm.closeModal}>Cancel</Button>
                <Button onClick={handleSaveSafety} disabled={!safetyForm.formData.bankLocation?.trim()}>Save</Button>
              </>
            }
          >
            <div className="space-y-4">
              <Input label="Bank Location" value={safetyForm.formData.bankLocation || ''} onChange={(e) => safetyForm.updateField('bankLocation', e.target.value)} placeholder="First National Bank, Downtown Branch" required />
              <Input label="Box Number" value={safetyForm.formData.boxNumber || ''} onChange={(e) => safetyForm.updateField('boxNumber', e.target.value)} />
              <Input label="Key Location" value={safetyForm.formData.keyLocation || ''} onChange={(e) => safetyForm.updateField('keyLocation', e.target.value)} placeholder="Home office desk drawer" />
              <TextArea label="Contents" value={safetyForm.formData.contents || ''} onChange={(e) => safetyForm.updateField('contents', e.target.value)} placeholder="List important items stored in the box" rows={3} />
              <TextArea label="Notes" value={safetyForm.formData.notes || ''} onChange={(e) => safetyForm.updateField('notes', e.target.value)} rows={2} />
            </div>
          </Modal>

          <Modal
            isOpen={advisorForm.isModalOpen}
            onClose={advisorForm.closeModal}
            title={advisorForm.editingItem ? 'Edit Financial Advisor' : 'Add Financial Advisor'}
            footer={
              <>
                <Button variant="secondary" onClick={advisorForm.closeModal}>Cancel</Button>
                <Button onClick={handleSaveAdvisor} disabled={!advisorForm.formData.name?.trim()}>Save</Button>
              </>
            }
          >
            <div className="space-y-4">
              <Input label="Name" value={advisorForm.formData.name || ''} onChange={(e) => advisorForm.updateField('name', e.target.value)} required />
              <Input label="Company" value={advisorForm.formData.company || ''} onChange={(e) => advisorForm.updateField('company', e.target.value)} />
              <Input label="Phone" type="tel" value={advisorForm.formData.phone || ''} onChange={(e) => advisorForm.updateField('phone', e.target.value)} />
              <Input label="Email" type="email" value={advisorForm.formData.email || ''} onChange={(e) => advisorForm.updateField('email', e.target.value)} />
              <Input label="Services Provided" value={advisorForm.formData.servicesProvided || ''} onChange={(e) => advisorForm.updateField('servicesProvided', e.target.value)} placeholder="Investment management, tax planning, etc." />
              <TextArea label="Notes" value={advisorForm.formData.notes || ''} onChange={(e) => advisorForm.updateField('notes', e.target.value)} rows={3} />
            </div>
          </Modal>

          <Modal
            isOpen={taxForm.isModalOpen}
            onClose={taxForm.closeModal}
            title={taxForm.editingItem ? 'Edit Tax Document' : 'Add Tax Document'}
            footer={
              <>
                <Button variant="secondary" onClick={taxForm.closeModal}>Cancel</Button>
                <Button onClick={handleSaveTax} disabled={!taxForm.formData.year?.trim()}>Save</Button>
              </>
            }
          >
            <div className="space-y-4">
              <Input label="Tax Year" value={taxForm.formData.year || ''} onChange={(e) => taxForm.updateField('year', e.target.value)} placeholder="2023" required />
              <Input label="Location" value={taxForm.formData.location || ''} onChange={(e) => taxForm.updateField('location', e.target.value)} placeholder="~/Documents/Taxes/2023/" />
              <Input label="Preparer Name" value={taxForm.formData.preparerName || ''} onChange={(e) => taxForm.updateField('preparerName', e.target.value)} />
              <Input label="Preparer Contact" value={taxForm.formData.preparerContact || ''} onChange={(e) => taxForm.updateField('preparerContact', e.target.value)} placeholder="Phone or email" />
              <TextArea label="Notes" value={taxForm.formData.notes || ''} onChange={(e) => taxForm.updateField('notes', e.target.value)} placeholder="Filed date, refund/owed amount, special circumstances" rows={3} />
            </div>
          </Modal>

          <Modal
            isOpen={accountantForm.isModalOpen}
            onClose={accountantForm.closeModal}
            title={accountantForm.editingItem ? 'Edit Accountant' : 'Add Accountant'}
            footer={
              <>
                <Button variant="secondary" onClick={accountantForm.closeModal}>Cancel</Button>
                <Button onClick={handleSaveAccountant} disabled={!accountantForm.formData.name?.trim()}>Save</Button>
              </>
            }
          >
            <div className="space-y-4">
              <Input label="Name" value={accountantForm.formData.name || ''} onChange={(e) => accountantForm.updateField('name', e.target.value)} required />
              <Input label="Company" value={accountantForm.formData.company || ''} onChange={(e) => accountantForm.updateField('company', e.target.value)} />
              <Input label="Phone" type="tel" value={accountantForm.formData.phone || ''} onChange={(e) => accountantForm.updateField('phone', e.target.value)} />
              <Input label="Email" type="email" value={accountantForm.formData.email || ''} onChange={(e) => accountantForm.updateField('email', e.target.value)} />
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={accountantForm.formData.hasTaxHistoryAccess || false} onChange={(e) => accountantForm.updateField('hasTaxHistoryAccess', e.target.checked)} className="rounded border-gray-300" />
                <span className="text-sm text-gray-700">Has access to tax history</span>
              </label>
              <Input label="Years Serviced" value={accountantForm.formData.yearsServiced || ''} onChange={(e) => accountantForm.updateField('yearsServiced', e.target.value)} placeholder="e.g., 2020-2024" />
              <Input label="Services Provided" value={accountantForm.formData.servicesProvided || ''} onChange={(e) => accountantForm.updateField('servicesProvided', e.target.value)} placeholder="Tax prep, bookkeeping, etc." />
              <TextArea label="Notes" value={accountantForm.formData.notes || ''} onChange={(e) => accountantForm.updateField('notes', e.target.value)} rows={3} />
            </div>
          </Modal>

          <Modal
            isOpen={residualForm.isModalOpen}
            onClose={residualForm.closeModal}
            title={residualForm.editingItem ? 'Edit Residual Income' : 'Add Residual Income'}
            footer={
              <>
                <Button variant="secondary" onClick={residualForm.closeModal}>Cancel</Button>
                <Button onClick={handleSaveResidual} disabled={!residualForm.formData.sourceName?.trim()}>Save</Button>
              </>
            }
          >
            <div className="space-y-4">
              <Input label="Source Name" value={residualForm.formData.sourceName || ''} onChange={(e) => residualForm.updateField('sourceName', e.target.value)} placeholder="e.g., Book Royalties, Stock Photos" required />
              <Input label="Platform/Publisher" value={residualForm.formData.platformPublisher || ''} onChange={(e) => residualForm.updateField('platformPublisher', e.target.value)} placeholder="e.g., Amazon KDP, Getty Images" />
              <Input label="Payment Frequency" value={residualForm.formData.paymentFrequency || ''} onChange={(e) => residualForm.updateField('paymentFrequency', e.target.value)} placeholder="e.g., Monthly, Quarterly" />
              <Input label="Contact Information" value={residualForm.formData.contactInfo || ''} onChange={(e) => residualForm.updateField('contactInfo', e.target.value)} placeholder="Support email or phone" />
              <TextArea label="Access Details" value={residualForm.formData.accessDetails || ''} onChange={(e) => residualForm.updateField('accessDetails', e.target.value)} placeholder="How to access the account and payment history" rows={3} />
              <TextArea label="Notes" value={residualForm.formData.notes || ''} onChange={(e) => residualForm.updateField('notes', e.target.value)} rows={2} />
            </div>
          </Modal>

          <Modal
            isOpen={cryptoForm.isModalOpen}
            onClose={cryptoForm.closeModal}
            title={cryptoForm.editingItem ? 'Edit Cryptocurrency' : 'Add Cryptocurrency'}
            footer={
              <>
                <Button variant="secondary" onClick={cryptoForm.closeModal}>Cancel</Button>
                <Button onClick={handleSaveCrypto} disabled={!cryptoForm.formData.currencyType?.trim()}>Save</Button>
              </>
            }
          >
            <div className="space-y-4">
              <Input label="Currency Type" value={cryptoForm.formData.currencyType || ''} onChange={(e) => cryptoForm.updateField('currencyType', e.target.value)} placeholder="e.g., Bitcoin, Ethereum" required />
              <Input label="Exchange/Wallet Provider" value={cryptoForm.formData.exchangeWalletProvider || ''} onChange={(e) => cryptoForm.updateField('exchangeWalletProvider', e.target.value)} placeholder="e.g., Coinbase, Hardware Wallet" />
              <TextArea label="Access Instructions" value={cryptoForm.formData.accessInstructions || ''} onChange={(e) => cryptoForm.updateField('accessInstructions', e.target.value)} placeholder="How to access the wallet or exchange account" rows={3} />
              <Input label="Trusted Contact for Assistance" value={cryptoForm.formData.trustedContact || ''} onChange={(e) => cryptoForm.updateField('trustedContact', e.target.value)} placeholder="Someone familiar with crypto who can help" />
              <TextArea label="Notes" value={cryptoForm.formData.notes || ''} onChange={(e) => cryptoForm.updateField('notes', e.target.value)} rows={2} />
            </div>
          </Modal>
        </div>
      )}
    </AppLayout>
  );
}
