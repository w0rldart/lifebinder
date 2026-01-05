import { useState } from 'react';

export function useModalForm<T extends Record<string, any>>(initialFormData: T) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<T>(initialFormData);
  const [editingItem, setEditingItem] = useState<(T & { id: string }) | null>(null);

  const openModal = (item?: T & { id: string }) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData(initialFormData);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData(initialFormData);
  };

  const updateField = <K extends keyof T>(field: K, value: T[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return {
    isModalOpen,
    formData,
    editingItem,
    openModal,
    closeModal,
    updateField,
    setFormData,
  };
}
