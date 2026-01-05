import { useState } from 'react';

interface DeleteWarning {
  id: string;
  name: string;
  references?: string[];
}

export function useDeleteConfirmation() {
  const [deleteWarning, setDeleteWarning] = useState<DeleteWarning | null>(null);

  const confirmDelete = (id: string, name: string, references?: string[]) => {
    setDeleteWarning({ id, name, references });
  };

  const cancelDelete = () => {
    setDeleteWarning(null);
  };

  const executeDelete = async (deleteCallback: (id: string) => Promise<void>) => {
    if (!deleteWarning) return;

    try {
      await deleteCallback(deleteWarning.id);
      setDeleteWarning(null);
    } catch (error) {
      throw error;
    }
  };

  return {
    deleteWarning,
    confirmDelete,
    cancelDelete,
    executeDelete,
  };
}
