import { AppLayout } from '~/components/AppLayout';
import { Card } from '~/components/Card';
import { Button } from '~/components/Button';
import { Modal } from '~/components/Modal';
import { Input } from '~/components/Input';
import { TextArea } from '~/components/TextArea';
import { useSession } from '~/lib/session-context';
import { useLanguage } from '~/lib/language-context';
import { useModalForm } from '~/hooks/useModalForm';
import { usePlanUpdater } from '~/hooks/usePlanUpdater';
import type { MeetingLocation, EmergencyContact, GrabListItem } from '~/types';
import { Edit2, Trash2 } from 'lucide-react';

export default function Emergency() {
  const { plan } = useSession();
  const { t } = useLanguage();
  const { updatePlan } = usePlanUpdater();

  const locationForm = useModalForm<Partial<MeetingLocation>>({ name: '', address: '', notes: '' });
  const contactForm = useModalForm<Partial<EmergencyContact>>({ name: '', relationship: '', phone: '', notes: '' });
  const grabForm = useModalForm<Partial<GrabListItem>>({ item: '', location: '', priority: 1 });

  const handleSaveLocation = async () => {
    if (!plan || !locationForm.formData.name) return;

    const updated = locationForm.editingItem
      ? plan.emergency.meetingLocations.map(l => l.id === locationForm.editingItem!.id ? { ...locationForm.formData, id: l.id } as MeetingLocation : l)
      : [...plan.emergency.meetingLocations, { ...locationForm.formData, id: crypto.randomUUID() } as MeetingLocation];

    const updatedPlan = { ...plan, emergency: { ...plan.emergency, meetingLocations: updated } };
    await updatePlan(updatedPlan, locationForm.editingItem ? t('emergency.locationUpdated') : t('emergency.locationAdded'));
    locationForm.closeModal();
  };

  const handleSaveContact = async () => {
    if (!plan || !contactForm.formData.name) return;

    const updated = contactForm.editingItem
      ? plan.emergency.emergencyContacts.map(c => c.id === contactForm.editingItem!.id ? { ...contactForm.formData, id: c.id } as EmergencyContact : c)
      : [...plan.emergency.emergencyContacts, { ...contactForm.formData, id: crypto.randomUUID() } as EmergencyContact];

    const updatedPlan = { ...plan, emergency: { ...plan.emergency, emergencyContacts: updated } };
    await updatePlan(updatedPlan, contactForm.editingItem ? t('emergency.contactUpdated') : t('emergency.contactAdded'));
    contactForm.closeModal();
  };

  const handleSaveGrab = async () => {
    if (!plan || !grabForm.formData.item) return;

    const updated = grabForm.editingItem
      ? plan.emergency.grabList.map(g => g.id === grabForm.editingItem!.id ? { ...grabForm.formData, id: g.id } as GrabListItem : g)
      : [...plan.emergency.grabList, { ...grabForm.formData, id: crypto.randomUUID() } as GrabListItem];

    const updatedPlan = { ...plan, emergency: { ...plan.emergency, grabList: updated } };
    await updatePlan(updatedPlan, grabForm.editingItem ? t('emergency.itemUpdated') : t('emergency.itemAdded'));
    grabForm.closeModal();
  };

  const handleDelete = async (type: 'location' | 'contact' | 'grab', id: string) => {
    if (!plan || !confirm(t('emergency.deleteItem'))) return;

    const updates: any = { ...plan.emergency };
    if (type === 'location') updates.meetingLocations = plan.emergency.meetingLocations.filter(l => l.id !== id);
    if (type === 'contact') updates.emergencyContacts = plan.emergency.emergencyContacts.filter(c => c.id !== id);
    if (type === 'grab') updates.grabList = plan.emergency.grabList.filter(g => g.id !== id);

    const updatedPlan = { ...plan, emergency: updates };
    await updatePlan(updatedPlan, t('emergency.itemDeleted'));
  };

  const handleUpdateNotes = async (field: 'utilityShutoffNotes' | 'generalNotes', value: string) => {
    if (!plan) return;

    const updatedPlan = { ...plan, emergency: { ...plan.emergency, [field]: value } };
    await updatePlan(updatedPlan, t('emergency.notesUpdated'));
  };

  return (
    <AppLayout>
      {plan && (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t('emergency.title')}</h1>
          <p className="text-sm sm:text-base text-gray-600">{t('emergency.description')}</p>
        </div>

        <Card title={t('emergency.meetingLocations')} action={<Button onClick={() => locationForm.openModal()}>{t('common.add')}</Button>}>
          <p className="text-sm text-gray-600 mb-4">{t('emergency.meetingLocationsDescription')}</p>
          <div className="space-y-3">
            {plan.emergency.meetingLocations.length === 0 ? (
              <p className="text-gray-500 text-sm italic">{t('emergency.noMeetingLocations')}</p>
            ) : (
              plan.emergency.meetingLocations.map(loc => (
                <div key={loc.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{loc.name}</div>
                    <div className="text-sm text-gray-600 mt-1">{loc.address}</div>
                    {loc.notes && <div className="text-sm text-gray-500 mt-1">{loc.notes}</div>}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button onClick={() => locationForm.openModal(loc)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete('location', loc.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card title={t('emergency.utilityShutoffs')}>
          <TextArea
            label={t('emergency.fields.shutoffLabel')}
            value={plan.emergency.utilityShutoffNotes}
            onChange={(e) => handleUpdateNotes('utilityShutoffNotes', e.target.value)}
            placeholder={t('emergency.fields.shutoffPlaceholder')}
            rows={6}
            helpText={t('emergency.fields.shutoffHelpText')}
          />
        </Card>

        <Card title={t('emergency.emergencyContacts')} action={<Button onClick={() => contactForm.openModal()}>{t('common.add')}</Button>}>
          <p className="text-sm text-gray-600 mb-4">{t('emergency.emergencyContactsDescription')}</p>
          <div className="space-y-3">
            {plan.emergency.emergencyContacts.length === 0 ? (
              <p className="text-gray-500 text-sm italic">{t('emergency.noEmergencyContacts')}</p>
            ) : (
              plan.emergency.emergencyContacts.map(contact => (
                <div key={contact.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{contact.name}</div>
                    <div className="text-sm text-gray-600">{contact.relationship}</div>
                    <div className="text-sm text-gray-700 mt-1">📞 {contact.phone}</div>
                    {contact.notes && <div className="text-sm text-gray-500 mt-1">{contact.notes}</div>}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button onClick={() => contactForm.openModal(contact)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete('contact', contact.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card title={t('emergency.grabList')} action={<Button onClick={() => grabForm.openModal()}>{t('common.add')}</Button>}>
          <p className="text-sm text-gray-600 mb-4">{t('emergency.grabListDescription')}</p>
          <div className="space-y-3">
            {plan.emergency.grabList.length === 0 ? (
              <p className="text-gray-500 text-sm italic">{t('emergency.noGrabListItems')}</p>
            ) : (
              plan.emergency.grabList.sort((a, b) => (a.priority || 99) - (b.priority || 99)).map(item => (
                <div key={item.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                    {item.priority}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.item}</div>
                    <div className="text-sm text-gray-600">{item.location}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => grabForm.openModal(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete('grab', item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card title={t('emergency.generalEmergencyNotes')}>
          <TextArea
            value={plan.emergency.generalNotes}
            onChange={(e) => handleUpdateNotes('generalNotes', e.target.value)}
            placeholder={t('emergency.fields.generalNotesPlaceholder')}
            rows={6}
          />
        </Card>

        <Modal isOpen={locationForm.isModalOpen} onClose={locationForm.closeModal} title={locationForm.editingItem ? t('emergency.editLocation') : t('emergency.addMeetingLocation')} footer={<><Button variant="secondary" onClick={locationForm.closeModal}>{t('common.cancel')}</Button><Button onClick={handleSaveLocation} disabled={!locationForm.formData.name?.trim()}>{t('common.save')}</Button></>}>
          <div className="space-y-4">
            <Input label={t('emergency.fields.locationName')} value={locationForm.formData.name || ''} onChange={(e) => locationForm.updateField('name', e.target.value)} placeholder={t('emergency.fields.locationNamePlaceholder')} required />
            <Input label={t('emergency.fields.address')} value={locationForm.formData.address || ''} onChange={(e) => locationForm.updateField('address', e.target.value)} placeholder={t('emergency.fields.addressPlaceholder')} />
            <TextArea label={t('contacts.notes')} value={locationForm.formData.notes || ''} onChange={(e) => locationForm.updateField('notes', e.target.value)} placeholder={t('emergency.fields.notesPlaceholder')} />
          </div>
        </Modal>

        <Modal isOpen={contactForm.isModalOpen} onClose={contactForm.closeModal} title={contactForm.editingItem ? t('emergency.editContact') : t('emergency.addEmergencyContact')} footer={<><Button variant="secondary" onClick={contactForm.closeModal}>{t('common.cancel')}</Button><Button onClick={handleSaveContact} disabled={!contactForm.formData.name?.trim() || !contactForm.formData.phone?.trim()}>{t('common.save')}</Button></>}>
          <div className="space-y-4">
            <Input label={t('emergency.fields.nameService')} value={contactForm.formData.name || ''} onChange={(e) => contactForm.updateField('name', e.target.value)} placeholder={t('emergency.fields.nameServicePlaceholder')} required />
            <Input label={t('emergency.fields.typeRelationship')} value={contactForm.formData.relationship || ''} onChange={(e) => contactForm.updateField('relationship', e.target.value)} placeholder={t('emergency.fields.typeRelationshipPlaceholder')} />
            <Input label={t('emergency.fields.phoneNumber')} type="tel" value={contactForm.formData.phone || ''} onChange={(e) => contactForm.updateField('phone', e.target.value)} required />
            <TextArea label={t('contacts.notes')} value={contactForm.formData.notes || ''} onChange={(e) => contactForm.updateField('notes', e.target.value)} placeholder={t('emergency.fields.notesPlaceholder2')} />
          </div>
        </Modal>

        <Modal isOpen={grabForm.isModalOpen} onClose={grabForm.closeModal} title={grabForm.editingItem ? t('emergency.editItem') : t('emergency.addGrabListItem')} footer={<><Button variant="secondary" onClick={grabForm.closeModal}>{t('common.cancel')}</Button><Button onClick={handleSaveGrab} disabled={!grabForm.formData.item?.trim()}>{t('common.save')}</Button></>}>
          <div className="space-y-4">
            <Input label={t('emergency.fields.item')} value={grabForm.formData.item || ''} onChange={(e) => grabForm.updateField('item', e.target.value)} placeholder={t('emergency.fields.itemPlaceholder')} required />
            <Input label={t('emergency.fields.location')} value={grabForm.formData.location || ''} onChange={(e) => grabForm.updateField('location', e.target.value)} placeholder={t('emergency.fields.locationPlaceholder')} />
            <Input label={t('emergency.fields.priority')} type="number" min="1" value={grabForm.formData.priority || 1} onChange={(e) => grabForm.updateField('priority', parseInt(e.target.value) || 1)} />
          </div>
        </Modal>
      </div>
      )}
    </AppLayout>
  );
}
