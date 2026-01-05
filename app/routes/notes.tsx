import { useState } from 'react';
import { AppLayout } from '~/components/AppLayout';
import { Card } from '~/components/Card';
import { Button } from '~/components/Button';
import { Modal } from '~/components/Modal';
import { Input } from '~/components/Input';
import { TextArea } from '~/components/TextArea';
import { EmptyState } from '~/components/EmptyState';
import { useSession } from '~/lib/session-context';
import { useModalForm } from '~/hooks/useModalForm';
import { usePlanUpdater } from '~/hooks/usePlanUpdater';
import type { Note } from '~/types';
import { Pin, Edit2, Trash2 } from 'lucide-react';

export default function Notes() {
  const { plan } = useSession();
  const { updatePlan } = usePlanUpdater();
  const [searchQuery, setSearchQuery] = useState('');

  const noteForm = useModalForm<Partial<Note>>({
    title: '',
    content: '',
    category: '',
    isPinned: false,
    color: '#ffffff',
  });

  const colorOptions = [
    { value: '#ffffff', label: 'White', color: '#ffffff' },
    { value: '#fef3c7', label: 'Yellow', color: '#fef3c7' },
    { value: '#dbeafe', label: 'Blue', color: '#dbeafe' },
    { value: '#fce7f3', label: 'Pink', color: '#fce7f3' },
    { value: '#f3e8ff', label: 'Purple', color: '#f3e8ff' },
    { value: '#e0e7ff', label: 'Indigo', color: '#e0e7ff' },
    { value: '#d1fae5', label: 'Green', color: '#d1fae5' },
    { value: '#fed7aa', label: 'Orange', color: '#fed7aa' },
  ];

  const handleSaveNote = async () => {
    if (!plan || !noteForm.formData.title?.trim()) return;

    const now = new Date().toISOString();
    const note: Note = {
      id: noteForm.editingItem?.id || crypto.randomUUID(),
      title: noteForm.formData.title || '',
      content: noteForm.formData.content || '',
      category: noteForm.formData.category || '',
      dateCreated: noteForm.editingItem?.dateCreated || now,
      dateModified: now,
      isPinned: noteForm.formData.isPinned || false,
      color: noteForm.formData.color || '#ffffff',
    };

    const updated = noteForm.editingItem
      ? plan.notes.map((n) => (n.id === noteForm.editingItem!.id ? note : n))
      : [...plan.notes, note];

    await updatePlan({ ...plan, notes: updated }, noteForm.editingItem ? 'Note updated' : 'Note added');
    noteForm.closeModal();
  };

  const handleDeleteNote = async (id: string) => {
    if (!plan) return;
    if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) return;
    const updated = plan.notes.filter((n) => n.id !== id);
    await updatePlan({ ...plan, notes: updated }, 'Note deleted');
  };

  const handleTogglePin = async (note: Note) => {
    if (!plan) return;
    const updated = plan.notes.map((n) => (n.id === note.id ? { ...n, isPinned: !n.isPinned } : n));
    await updatePlan({ ...plan, notes: updated }, note.isPinned ? 'Note unpinned' : 'Note pinned');
  };

  const filteredNotes = plan?.notes.filter((note) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query) ||
      note.category.toLowerCase().includes(query)
    );
  }) || [];

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned).sort((a, b) => new Date(b.dateModified).getTime() - new Date(a.dateModified).getTime());
  const unpinnedNotes = filteredNotes.filter((n) => !n.isPinned).sort((a, b) => new Date(b.dateModified).getTime() - new Date(a.dateModified).getTime());
  const sortedNotes = [...pinnedNotes, ...unpinnedNotes];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <AppLayout>
      {plan && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Notes</h1>
              <p className="text-sm sm:text-base text-gray-600">Quick notes, reminders, and miscellaneous information</p>
            </div>
            <Button onClick={() => noteForm.openModal()} className="sm:flex-shrink-0">Add Note</Button>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <Input
              label=""
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes by title, content, or category..."
            />
          </div>

          {sortedNotes.length === 0 ? (
            <EmptyState
              title={searchQuery ? 'No matching notes' : 'No notes yet'}
              description={
                searchQuery
                  ? 'Try a different search term'
                  : 'Create your first note to store quick information, reminders, or miscellaneous details'
              }
              actionLabel="Add Note"
              onAction={() => noteForm.openModal()}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {sortedNotes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
                  style={{ backgroundColor: note.color }}
                >
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-lg truncate">{note.title}</h3>
                        {note.category && (
                          <span className="inline-block mt-1 text-xs bg-gray-700 text-white px-2 py-1 rounded">
                            {note.category}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleTogglePin(note)}
                        className={`ml-2 p-1 rounded hover:bg-gray-200 transition-colors ${note.isPinned ? 'text-yellow-600' : 'text-gray-400'}`}
                        title={note.isPinned ? 'Unpin note' : 'Pin note'}
                      >
                        <Pin className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex-1 min-h-0">
                      {note.content && (
                        <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-6">{note.content}</p>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-300 flex items-center justify-between text-xs text-gray-500">
                      <span>{formatDate(note.dateModified)}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => noteForm.openModal(note)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit note"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete note"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Modal
            isOpen={noteForm.isModalOpen}
            onClose={noteForm.closeModal}
            title={noteForm.editingItem ? 'Edit Note' : 'Add Note'}
            footer={
              <>
                <Button variant="secondary" onClick={noteForm.closeModal}>
                  Cancel
                </Button>
                <Button onClick={handleSaveNote} disabled={!noteForm.formData.title?.trim()}>
                  Save
                </Button>
              </>
            }
          >
            <div className="space-y-4">
              <Input
                label="Title"
                value={noteForm.formData.title || ''}
                onChange={(e) => noteForm.updateField('title', e.target.value)}
                placeholder="Note title"
                required
              />

              <Input
                label="Category"
                value={noteForm.formData.category || ''}
                onChange={(e) => noteForm.updateField('category', e.target.value)}
                placeholder="e.g., Home, Work, Personal (optional)"
              />

              <TextArea
                label="Content"
                value={noteForm.formData.content || ''}
                onChange={(e) => noteForm.updateField('content', e.target.value)}
                placeholder="Write your note here..."
                rows={8}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Card Color</label>
                <div className="flex gap-2 flex-wrap">
                  {colorOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => noteForm.updateField('color', option.value)}
                      className={`w-12 h-12 rounded-lg border-2 transition-all ${
                        noteForm.formData.color === option.value ? 'border-blue-500 scale-110' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: option.color }}
                      title={option.label}
                    />
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={noteForm.formData.isPinned || false}
                  onChange={(e) => noteForm.updateField('isPinned', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Pin this note to the top</span>
              </label>
            </div>
          </Modal>
        </div>
      )}
    </AppLayout>
  );
}
