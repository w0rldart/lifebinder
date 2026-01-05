import jsPDF from 'jspdf';
import type { Plan } from '~/types';

export function generatePDF(plan: Plan, includeHighSensitivity: boolean = false) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPosition = margin;

  const checkPageBreak = (requiredSpace: number = 30) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
  };

  doc.setFontSize(24);
  doc.text('Life Binder', margin, yPosition);
  yPosition += 12;

  doc.setFontSize(16);
  doc.text(plan.title, margin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPosition);
  yPosition += 15;

  doc.setTextColor(0);
  doc.setFontSize(18);
  doc.text('First 24 Hours Runbook', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(11);
  const first24Hours = getFirst24HoursChecklist(plan);
  if (first24Hours.length > 0) {
    first24Hours.forEach((item, i) => {
      checkPageBreak();
      doc.setFont('helvetica', 'bold');
      doc.text(`${i + 1}. ${item.title}`, margin + 5, yPosition);
      yPosition += 6;
      doc.setFont('helvetica', 'normal');
      const descLines = doc.splitTextToSize(item.description, contentWidth - 10);
      doc.text(descLines, margin + 10, yPosition);
      yPosition += descLines.length * 5 + 5;
    });
  } else {
    doc.setTextColor(150);
    doc.text('No actions configured yet', margin + 5, yPosition);
    yPosition += 10;
    doc.setTextColor(0);
  }

  yPosition += 10;
  checkPageBreak();
  doc.setFontSize(18);
  doc.text('Priority Contacts', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(11);
  const beforeSocialContacts = plan.contacts.filter(c => c.notifyBeforeSocial);
  if (beforeSocialContacts.length > 0) {
    beforeSocialContacts.forEach(contact => {
      checkPageBreak();
      doc.setFont('helvetica', 'bold');
      doc.text(`${contact.name} (${contact.relationship})`, margin + 5, yPosition);
      yPosition += 6;
      doc.setFont('helvetica', 'normal');
      if (contact.phone) {
        doc.text(`Phone: ${contact.phone}`, margin + 10, yPosition);
        yPosition += 5;
      }
      if (contact.email) {
        doc.text(`Email: ${contact.email}`, margin + 10, yPosition);
        yPosition += 5;
      }
      if (contact.notes) {
        const noteLines = doc.splitTextToSize(contact.notes, contentWidth - 15);
        doc.text(noteLines, margin + 10, yPosition);
        yPosition += noteLines.length * 5;
      }
      yPosition += 5;
    });
  } else {
    doc.setTextColor(150);
    doc.text('No priority contacts configured', margin + 5, yPosition);
    yPosition += 10;
    doc.setTextColor(0);
  }

  yPosition += 10;
  checkPageBreak();
  doc.setFontSize(18);
  doc.text('Access Information', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(11);
  if (plan.access.primaryEmails.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('Primary Email Accounts:', margin + 5, yPosition);
    yPosition += 6;
    doc.setFont('helvetica', 'normal');
    plan.access.primaryEmails.forEach(email => {
      checkPageBreak();
      doc.text(`• ${email.email} (${email.provider})`, margin + 10, yPosition);
      yPosition += 5;
    });
    yPosition += 5;
  }

  if (plan.access.passwordManagerNotes) {
    checkPageBreak();
    doc.setFont('helvetica', 'bold');
    doc.text('Password Manager:', margin + 5, yPosition);
    yPosition += 6;
    doc.setFont('helvetica', 'normal');
    const pmLines = doc.splitTextToSize(plan.access.passwordManagerNotes, contentWidth - 15);
    doc.text(pmLines, margin + 10, yPosition);
    yPosition += pmLines.length * 5 + 5;
  }

  if (plan.access.twoFANotes) {
    checkPageBreak();
    doc.setFont('helvetica', 'bold');
    doc.text('2FA Recovery:', margin + 5, yPosition);
    yPosition += 6;
    doc.setFont('helvetica', 'normal');
    const tfaLines = doc.splitTextToSize(plan.access.twoFANotes, contentWidth - 15);
    doc.text(tfaLines, margin + 10, yPosition);
    yPosition += tfaLines.length * 5 + 5;
  }

  if (plan.access.devices.length > 0) {
    checkPageBreak();
    doc.setFont('helvetica', 'bold');
    doc.text('Device Retention:', margin + 5, yPosition);
    yPosition += 6;
    doc.setFont('helvetica', 'normal');
    plan.access.devices.forEach(device => {
      checkPageBreak();
      doc.text(`• ${device.name} (${device.type})`, margin + 10, yPosition);
      yPosition += 5;
      if (device.retentionNotes) {
        const devLines = doc.splitTextToSize(device.retentionNotes, contentWidth - 20);
        doc.text(devLines, margin + 15, yPosition);
        yPosition += devLines.length * 5;
      }
      if (device.disposalPlan) {
        const dispLines = doc.splitTextToSize(`Disposal: ${device.disposalPlan}`, contentWidth - 20);
        doc.text(dispLines, margin + 15, yPosition);
        yPosition += dispLines.length * 5;
      }
      yPosition += 3;
    });
  }

  if (plan.access.networkInfrastructure?.length > 0) {
    checkPageBreak();
    doc.setFont('helvetica', 'bold');
    doc.text('Network Infrastructure:', margin + 5, yPosition);
    yPosition += 6;
    doc.setFont('helvetica', 'normal');
    plan.access.networkInfrastructure.forEach(network => {
      checkPageBreak();
      doc.text(`• ${network.name} (${network.type})`, margin + 10, yPosition);
      yPosition += 5;
      doc.text(`  Location: ${network.location}`, margin + 15, yPosition);
      yPosition += 5;
      if (network.accessInfo) {
        const accessLines = doc.splitTextToSize(`  Access: ${network.accessInfo}`, contentWidth - 20);
        doc.text(accessLines, margin + 15, yPosition);
        yPosition += accessLines.length * 5;
      }
      yPosition += 3;
    });
  }

  if (plan.access.iotDevices?.length > 0) {
    checkPageBreak();
    doc.setFont('helvetica', 'bold');
    doc.text('IoT & Smart Home Devices:', margin + 5, yPosition);
    yPosition += 6;
    doc.setFont('helvetica', 'normal');
    plan.access.iotDevices.forEach(iot => {
      checkPageBreak();
      doc.text(`• ${iot.name} (${iot.type})`, margin + 10, yPosition);
      yPosition += 5;
      if (iot.accountInfo) {
        const accountLines = doc.splitTextToSize(`  Account: ${iot.accountInfo}`, contentWidth - 20);
        doc.text(accountLines, margin + 15, yPosition);
        yPosition += accountLines.length * 5;
      }
      yPosition += 3;
    });
  }

  yPosition += 10;
  checkPageBreak();
  doc.setFontSize(18);
  doc.text('Critical Accounts', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(11);
  const criticalCloud = plan.accounts.cloudServices.filter(c => c.billingWarning);
  if (criticalCloud.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('Cloud Services (Billing Risk):', margin + 5, yPosition);
    yPosition += 6;
    doc.setFont('helvetica', 'normal');
    criticalCloud.forEach(cloud => {
      checkPageBreak();
      doc.text(`• ${cloud.name} (${cloud.provider}) - ${cloud.status}`, margin + 10, yPosition);
      yPosition += 5;
    });
    yPosition += 5;
  }

  if (plan.accounts.socialMedia?.length > 0) {
    checkPageBreak();
    doc.setFont('helvetica', 'bold');
    doc.text('Social Media Accounts:', margin + 5, yPosition);
    yPosition += 6;
    doc.setFont('helvetica', 'normal');
    plan.accounts.socialMedia.forEach(social => {
      checkPageBreak();
      doc.text(`• ${social.platform}: ${social.username} - ${social.status}`, margin + 10, yPosition);
      yPosition += 5;
    });
    yPosition += 5;
  }

  if (plan.accounts.domains.length > 0) {
    checkPageBreak();
    doc.setFont('helvetica', 'bold');
    doc.text('Domains:', margin + 5, yPosition);
    yPosition += 6;
    doc.setFont('helvetica', 'normal');
    plan.accounts.domains.forEach(domain => {
      checkPageBreak();
      doc.text(`• ${domain.name} (${domain.registrar})`, margin + 10, yPosition);
      yPosition += 5;
      if (domain.expirationDate) {
        doc.text(`  Expires: ${domain.expirationDate}`, margin + 15, yPosition);
        yPosition += 5;
      }
    });
    yPosition += 5;
  }

  yPosition += 10;
  checkPageBreak();
  doc.setFontSize(18);
  doc.text('Documents', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(11);
  const docs = includeHighSensitivity
    ? plan.documents
    : plan.documents.filter(d => d.sensitivity === 'normal');

  if (docs.length > 0) {
    docs.forEach(docItem => {
      checkPageBreak(40);
      doc.setFont('helvetica', 'bold');
      doc.text(docItem.title, margin + 5, yPosition);
      yPosition += 6;
      doc.setFont('helvetica', 'normal');
      doc.text(`Type: ${docItem.locationType}`, margin + 10, yPosition);
      yPosition += 5;
      doc.text(`Location: ${docItem.location}`, margin + 10, yPosition);
      yPosition += 5;
      if (docItem.details) {
        const detailLines = doc.splitTextToSize(docItem.details, contentWidth - 15);
        doc.text(detailLines, margin + 10, yPosition);
        yPosition += detailLines.length * 5;
      }
      yPosition += 5;
    });
  } else {
    doc.setTextColor(150);
    doc.text(includeHighSensitivity ? 'No documents configured' : 'No normal documents (high sensitivity excluded)', margin + 5, yPosition);
    yPosition += 10;
    doc.setTextColor(0);
  }

  yPosition += 10;
  checkPageBreak();
  doc.setFontSize(18);
  doc.text('Emergency Plan', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(11);
  if (plan.emergency.meetingLocations.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('Meeting Locations:', margin + 5, yPosition);
    yPosition += 6;
    doc.setFont('helvetica', 'normal');
    plan.emergency.meetingLocations.forEach(loc => {
      checkPageBreak();
      doc.text(`• ${loc.name}`, margin + 10, yPosition);
      yPosition += 5;
      doc.text(`  ${loc.address}`, margin + 15, yPosition);
      yPosition += 5;
    });
    yPosition += 5;
  }

  if (plan.emergency.utilityShutoffNotes) {
    checkPageBreak();
    doc.setFont('helvetica', 'bold');
    doc.text('Utility Shutoffs:', margin + 5, yPosition);
    yPosition += 6;
    doc.setFont('helvetica', 'normal');
    const utilLines = doc.splitTextToSize(plan.emergency.utilityShutoffNotes, contentWidth - 15);
    doc.text(utilLines, margin + 10, yPosition);
    yPosition += utilLines.length * 5 + 5;
  }

  if (plan.emergency.emergencyContacts.length > 0) {
    checkPageBreak();
    doc.setFont('helvetica', 'bold');
    doc.text('Emergency Contacts:', margin + 5, yPosition);
    yPosition += 6;
    doc.setFont('helvetica', 'normal');
    plan.emergency.emergencyContacts.forEach(contact => {
      checkPageBreak();
      doc.text(`• ${contact.name} - ${contact.phone}`, margin + 10, yPosition);
      yPosition += 5;
    });
  }

  if (plan.financial.accountants?.length > 0) {
    yPosition += 10;
    checkPageBreak();
    doc.setFontSize(18);
    doc.text('Financial Professionals', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Accountants:', margin + 5, yPosition);
    yPosition += 6;
    doc.setFont('helvetica', 'normal');
    plan.financial.accountants.forEach(accountant => {
      checkPageBreak();
      doc.text(`• ${accountant.name} - ${accountant.company}`, margin + 10, yPosition);
      yPosition += 5;
      doc.text(`  ${accountant.phone}`, margin + 15, yPosition);
      yPosition += 5;
    });
  }

  if (plan.financial.residualIncome?.length > 0) {
    yPosition += 10;
    checkPageBreak();
    doc.setFontSize(18);
    doc.text('Residual Income Sources', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    plan.financial.residualIncome.forEach(income => {
      checkPageBreak();
      doc.setFont('helvetica', 'bold');
      doc.text(`• ${income.source}`, margin + 10, yPosition);
      yPosition += 5;
      doc.setFont('helvetica', 'normal');
      doc.text(`  ${income.frequency}: ${income.amount}`, margin + 15, yPosition);
      yPosition += 5;
      if (income.managementInfo) {
        const mgmtLines = doc.splitTextToSize(income.managementInfo, contentWidth - 20);
        doc.text(mgmtLines, margin + 15, yPosition);
        yPosition += mgmtLines.length * 5;
      }
      yPosition += 3;
    });
  }

  if (plan.financial.cryptocurrency?.length > 0) {
    yPosition += 10;
    checkPageBreak();
    doc.setFontSize(18);
    doc.text('Cryptocurrency Holdings', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    plan.financial.cryptocurrency.forEach(crypto => {
      checkPageBreak();
      doc.setFont('helvetica', 'bold');
      doc.text(`• ${crypto.platform} (${crypto.type})`, margin + 10, yPosition);
      yPosition += 5;
      doc.setFont('helvetica', 'normal');
      doc.text(`  Holdings: ${crypto.holdings}`, margin + 15, yPosition);
      yPosition += 5;
      if (crypto.accessInfo) {
        const accessLines = doc.splitTextToSize(`  Access: ${crypto.accessInfo}`, contentWidth - 20);
        doc.text(accessLines, margin + 15, yPosition);
        yPosition += accessLines.length * 5;
      }
      yPosition += 3;
    });
  }

  if (plan.physicalSecurity?.safes?.length || plan.physicalSecurity?.physicalKeys?.length) {
    yPosition += 10;
    checkPageBreak();
    doc.setFontSize(18);
    doc.text('Physical Security', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    if (plan.physicalSecurity?.safes && plan.physicalSecurity.safes.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Safes:', margin + 5, yPosition);
      yPosition += 6;
      doc.setFont('helvetica', 'normal');
      plan.physicalSecurity.safes.forEach(safe => {
        checkPageBreak();
        doc.text(`• ${safe.type} - ${safe.location}`, margin + 10, yPosition);
        yPosition += 5;
        if (safe.contents) {
          const contentLines = doc.splitTextToSize(`  Contents: ${safe.contents}`, contentWidth - 20);
          doc.text(contentLines, margin + 15, yPosition);
          yPosition += contentLines.length * 5;
        }
        yPosition += 3;
      });
    }

    if (plan.physicalSecurity?.physicalKeys && plan.physicalSecurity.physicalKeys.length > 0) {
      yPosition += 5;
      checkPageBreak();
      doc.setFont('helvetica', 'bold');
      doc.text('Physical Keys:', margin + 5, yPosition);
      yPosition += 6;
      doc.setFont('helvetica', 'normal');
      plan.physicalSecurity.physicalKeys.forEach(key => {
        checkPageBreak();
        doc.text(`• ${key.keyFor} (${key.quantity})`, margin + 10, yPosition);
        yPosition += 5;
        if (key.locations) {
          const locLines = doc.splitTextToSize(`  Locations: ${key.locations}`, contentWidth - 20);
          doc.text(locLines, margin + 15, yPosition);
          yPosition += locLines.length * 5;
        }
        yPosition += 3;
      });
    }
  }

  if (plan.securityRecovery?.securityQuestions?.length > 0) {
    yPosition += 10;
    checkPageBreak();
    doc.setFontSize(18);
    doc.text('Security Recovery Information', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Security Questions:', margin + 5, yPosition);
    yPosition += 6;
    doc.setFont('helvetica', 'normal');
    plan.securityRecovery.securityQuestions.forEach(sq => {
      checkPageBreak();
      doc.text(`• ${sq.account}`, margin + 10, yPosition);
      yPosition += 5;
      if (sq.answerHint) {
        doc.text(`  Hint: ${sq.answerHint}`, margin + 15, yPosition);
        yPosition += 5;
      }
      yPosition += 3;
    });
  }

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `lifebinder-${timestamp}.pdf`;

  doc.save(filename);
}

function getFirst24HoursChecklist(plan: Plan) {
  const checklist: { title: string; description: string }[] = [];

  const beforeSocialContacts = plan.contacts.filter(c => c.notifyBeforeSocial);
  if (beforeSocialContacts.length > 0) {
    checklist.push({
      title: 'Notify Priority Contacts',
      description: `Contact these people privately: ${beforeSocialContacts.map(c => c.name).join(', ')}`,
    });
  }

  if (plan.access.primaryEmails.length > 0) {
    checklist.push({
      title: 'Secure Email Accounts',
      description: `Check for important messages in ${plan.access.primaryEmails.length} primary email accounts`,
    });
  }

  if (plan.access.passwordManagerNotes) {
    checklist.push({
      title: 'Locate Password Manager',
      description: plan.access.passwordManagerNotes,
    });
  }

  if (plan.accounts.cloudServices.some(s => s.billingWarning)) {
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
