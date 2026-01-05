import { AppLayout } from '~/components/AppLayout';
import { Card } from '~/components/Card';
import { Button } from '~/components/Button';
import { Modal } from '~/components/Modal';
import { Input } from '~/components/Input';
import { TextArea } from '~/components/TextArea';
import { useSession } from '~/lib/session-context';
import { useModalForm } from '~/hooks/useModalForm';
import { usePlanUpdater } from '~/hooks/usePlanUpdater';
import type { MeetingLocation, EmergencyContact, GrabListItem } from '~/types';
import { Edit2, Trash2 } from 'lucide-react';

export default function Emergency() {
  const { plan } = useSession();
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
    await updatePlan(updatedPlan, locationForm.editingItem ? 'Location updated successfully' : 'Location added successfully');
    locationForm.closeModal();
  };

  const handleSaveContact = async () => {
    if (!plan || !contactForm.formData.name) return;

    const updated = contactForm.editingItem
      ? plan.emergency.emergencyContacts.map(c => c.id === contactForm.editingItem!.id ? { ...contactForm.formData, id: c.id } as EmergencyContact : c)
      : [...plan.emergency.emergencyContacts, { ...contactForm.formData, id: crypto.randomUUID() } as EmergencyContact];

    const updatedPlan = { ...plan, emergency: { ...plan.emergency, emergencyContacts: updated } };
    await updatePlan(updatedPlan, contactForm.editingItem ? 'Contact updated successfully' : 'Contact added successfully');
    contactForm.closeModal();
  };

  const handleSaveGrab = async () => {
    if (!plan || !grabForm.formData.item) return;

    const updated = grabForm.editingItem
      ? plan.emergency.grabList.map(g => g.id === grabForm.editingItem!.id ? { ...grabForm.formData, id: g.id } as GrabListItem : g)
      : [...plan.emergency.grabList, { ...grabForm.formData, id: crypto.randomUUID() } as GrabListItem];

    const updatedPlan = { ...plan, emergency: { ...plan.emergency, grabList: updated } };
    await updatePlan(updatedPlan, grabForm.editingItem ? 'Item updated successfully' : 'Item added successfully');
    grabForm.closeModal();
  };

  const handleDelete = async (type: 'location' | 'contact' | 'grab', id: string) => {
    if (!plan || !confirm('Delete this item?')) return;

    const updates: any = { ...plan.emergency };
    if (type === 'location') updates.meetingLocations = plan.emergency.meetingLocations.filter(l => l.id !== id);
    if (type === 'contact') updates.emergencyContacts = plan.emergency.emergencyContacts.filter(c => c.id !== id);
    if (type === 'grab') updates.grabList = plan.emergency.grabList.filter(g => g.id !== id);

    const updatedPlan = { ...plan, emergency: updates };
    await updatePlan(updatedPlan, 'Item deleted successfully');
  };

  const handleUpdateNotes = async (field: 'utilityShutoffNotes' | 'generalNotes', value: string) => {
    if (!plan) return;

    const updatedPlan = { ...plan, emergency: { ...plan.emergency, [field]: value } };
    await updatePlan(updatedPlan, 'Notes updated successfully');
  };

  return (
    <AppLayout>
      {plan && (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Emergency Information</h1>
          <p className="text-sm sm:text-base text-gray-600">Plan for crisis situations and emergencies</p>
        </div>

        <Card title="Meeting Locations" action={<Button onClick={() => locationForm.openModal()}>Add</Button>}>
          <p className="text-sm text-gray-600 mb-4">Where should family members gather in an emergency?</p>
          <div className="space-y-3">
            {plan.emergency.meetingLocations.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No meeting locations added</p>
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

        <Card title="Utility Shutoffs">
          <TextArea
            label="Shutoff Locations and Instructions"
            value={plan.emergency.utilityShutoffNotes}
            onChange={(e) => handleUpdateNotes('utilityShutoffNotes', e.target.value)}
            placeholder="Water main: Under front porch, turn clockwise&#10;Gas: Side of house near meter, needs wrench&#10;Electric: Breaker box in garage"
            rows={6}
            helpText="Document where and how to shut off utilities in an emergency"
          />
        </Card>

        <Card title="Emergency Contacts" action={<Button onClick={() => contactForm.openModal()}>Add</Button>}>
          <p className="text-sm text-gray-600 mb-4">911 services, poison control, nearest hospital, etc.</p>
          <div className="space-y-3">
            {plan.emergency.emergencyContacts.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No emergency contacts added</p>
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

        <Card title="Grab List" action={<Button onClick={() => grabForm.openModal()}>Add</Button>}>
          <p className="text-sm text-gray-600 mb-4">Important items to take in an evacuation</p>
          <div className="space-y-3">
            {plan.emergency.grabList.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No items added to grab list</p>
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

        <Card title="General Emergency Notes">
          <TextArea
            value={plan.emergency.generalNotes}
            onChange={(e) => handleUpdateNotes('generalNotes', e.target.value)}
            placeholder="Any other emergency information, procedures, or important details..."
            rows={6}
          />
        </Card>

        <Modal isOpen={locationForm.isModalOpen} onClose={locationForm.closeModal} title={locationForm.editingItem ? 'Edit Location' : 'Add Meeting Location'} footer={<><Button variant="secondary" onClick={locationForm.closeModal}>Cancel</Button><Button onClick={handleSaveLocation} disabled={!locationForm.formData.name?.trim()}>Save</Button></>}>
          <div className="space-y-4">
            <Input label="Location Name" value={locationForm.formData.name || ''} onChange={(e) => locationForm.updateField('name', e.target.value)} placeholder="e.g., City Park, Friend's House" required />
            <Input label="Address" value={locationForm.formData.address || ''} onChange={(e) => locationForm.updateField('address', e.target.value)} placeholder="Full address" />
            <TextArea label="Notes" value={locationForm.formData.notes || ''} onChange={(e) => locationForm.updateField('notes', e.target.value)} placeholder="Special instructions, landmarks, etc." />
          </div>
        </Modal>

        <Modal isOpen={contactForm.isModalOpen} onClose={contactForm.closeModal} title={contactForm.editingItem ? 'Edit Contact' : 'Add Emergency Contact'} footer={<><Button variant="secondary" onClick={contactForm.closeModal}>Cancel</Button><Button onClick={handleSaveContact} disabled={!contactForm.formData.name?.trim() || !contactForm.formData.phone?.trim()}>Save</Button></>}>
          <div className="space-y-4">
            <Input label="Name/Service" value={contactForm.formData.name || ''} onChange={(e) => contactForm.updateField('name', e.target.value)} placeholder="e.g., Poison Control, St. Mary's Hospital" required />
            <Input label="Type/Relationship" value={contactForm.formData.relationship || ''} onChange={(e) => contactForm.updateField('relationship', e.target.value)} placeholder="e.g., Hospital, Emergency Service, Family Doctor" />
            <Input label="Phone Number" type="tel" value={contactForm.formData.phone || ''} onChange={(e) => contactForm.updateField('phone', e.target.value)} required />
            <TextArea label="Notes" value={contactForm.formData.notes || ''} onChange={(e) => contactForm.updateField('notes', e.target.value)} placeholder="Address, hours, special instructions..." />
          </div>
        </Modal>

        <Modal isOpen={grabForm.isModalOpen} onClose={grabForm.closeModal} title={grabForm.editingItem ? 'Edit Item' : 'Add Grab List Item'} footer={<><Button variant="secondary" onClick={grabForm.closeModal}>Cancel</Button><Button onClick={handleSaveGrab} disabled={!grabForm.formData.item?.trim()}>Save</Button></>}>
          <div className="space-y-4">
            <Input label="Item" value={grabForm.formData.item || ''} onChange={(e) => grabForm.updateField('item', e.target.value)} placeholder="e.g., Important documents folder, Medications" required />
            <Input label="Location" value={grabForm.formData.location || ''} onChange={(e) => grabForm.updateField('location', e.target.value)} placeholder="Where to find this item" />
            <Input label="Priority (1=highest)" type="number" min="1" value={grabForm.formData.priority || 1} onChange={(e) => grabForm.updateField('priority', parseInt(e.target.value) || 1)} />
          </div>
        </Modal>
      </div>
      )}
    </AppLayout>
  );
}
