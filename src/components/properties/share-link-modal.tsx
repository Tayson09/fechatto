'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

interface ShareLinkModalProps {
  propertyId: string;
  isOpen: boolean;
  onClose: () => void;
  shareToken?: string | null;
  shareEnabled?: boolean;
  shareViews?: number;
}

export function ShareLinkModal({
  propertyId,
  isOpen,
  onClose,
  shareToken,
  shareEnabled,
  shareViews,
}: ShareLinkModalProps) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shareUrl = shareToken
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/p/${shareToken}`
    : '';

  const handleToggleShare = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/properties/${propertyId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !shareEnabled }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar link compartilhado');
      }

      // Recarregar página para atualizar dados
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Erro ao copiar link');
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-950">Link Compartilhável</h2>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {shareEnabled && shareToken ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Este imóvel está sendo compartilhado publicamente. Visualizações: <strong>{shareViews ?? 0}</strong>
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm bg-slate-50 font-mono"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleCopyLink}
                disabled={loading}
              >
                {copied ? '✓ Copiado' : 'Copiar'}
              </Button>
            </div>

            <Button
              type="button"
              variant="destructive"
              onClick={handleToggleShare}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Desativando...' : 'Desativar Compartilhamento'}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Ative o compartilhamento para gerar um link público para este imóvel.
            </p>

            <Button
              type="button"
              onClick={handleToggleShare}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Ativando...' : 'Ativar Compartilhamento'}
            </Button>
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="w-full"
        >
          Fechar
        </Button>
      </div>
    </Modal>
  );
}