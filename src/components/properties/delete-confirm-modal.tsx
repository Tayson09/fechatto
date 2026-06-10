'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

interface DeleteConfirmModalProps {
  propertyId: string;
  address: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}

export function DeleteConfirmModal({
  propertyId,
  address,
  isOpen,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao arquivar imóvel');
      }

      onConfirm?.();
      onClose();
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-950">Arquivar Imóvel</h2>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <p className="text-sm text-slate-600">
          Tem certeza que deseja arquivar o imóvel <strong>"{address}"</strong>?
        </p>

        <p className="text-xs text-slate-500">
          O imóvel será removido da lista, mas os dados serão mantidos no banco para referência.
        </p>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Arquivando...' : 'Arquivar'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}