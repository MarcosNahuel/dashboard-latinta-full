'use client';

import { useState } from 'react';
import { X, Sparkles, Wand2, ArrowRight } from 'lucide-react';

interface MagicEditModalProps {
  isOpen: boolean;
  sectionTitle: string;
  currentValue: string;
  onClose: () => void;
  onApply: (instruction: string) => void;
  isLoading: boolean;
  suggestion?: string;
}

const quickActions = [
  { label: 'Mas profesional', instruction: 'Reescribe esto de manera mas profesional y formal' },
  { label: 'Mas conciso', instruction: 'Hazlo mas corto y directo, manteniendo la esencia' },
  { label: 'Mas persuasivo', instruction: 'Hazlo mas persuasivo para ventas' },
  { label: 'Mas amigable', instruction: 'Hazlo mas cercano y amigable, estilo chileno' },
];

export default function MagicEditModal({
  isOpen,
  sectionTitle,
  currentValue,
  onClose,
  onApply,
  isLoading,
  suggestion,
}: MagicEditModalProps) {
  const [instruction, setInstruction] = useState('');

  if (!isOpen) return null;

  const handleApply = () => {
    if (instruction.trim()) {
      onApply(instruction);
    }
  };

  const handleQuickAction = (quickInstruction: string) => {
    setInstruction(quickInstruction);
    onApply(quickInstruction);
  };

  return (
    <div className="magic-modal-overlay" onClick={onClose}>
      <div className="magic-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Magic Edit</h3>
              <p className="text-xs text-gray-400">Mejorando: {sectionTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-2">Acciones rapidas:</p>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => handleQuickAction(action.instruction)}
                disabled={isLoading}
                className="px-3 py-1.5 text-xs rounded-full bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:border-[var(--playground-accent)] transition-all disabled:opacity-50"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Instruction */}
        <div className="mb-4">
          <label className="text-xs text-gray-400 mb-2 block">
            O escribe tu instruccion personalizada:
          </label>
          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="Ej: Hazlo mas agresivo en ventas, agrega urgencia..."
            className="w-full bg-black/30 border border-[var(--playground-border)] rounded-lg p-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[var(--playground-accent)] transition-colors resize-none"
            rows={3}
            disabled={isLoading}
          />
        </div>

        {/* Current Value Preview */}
        <div className="mb-4 p-3 rounded-lg bg-black/20 border border-[var(--playground-border)]">
          <p className="text-xs text-gray-400 mb-1">Texto actual:</p>
          <p className="text-sm text-gray-300 line-clamp-3">{currentValue}</p>
        </div>

        {/* Suggestion Preview */}
        {suggestion && (
          <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-green-400" />
              <p className="text-xs text-green-400 font-medium">Sugerencia de IA:</p>
            </div>
            <p className="text-sm text-gray-200">{suggestion}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mb-4 p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
            <div className="flex items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-purple-300">Gemini 2.0 Flash esta pensando...</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-[var(--playground-border)] text-gray-300 hover:bg-white/10 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleApply}
            disabled={isLoading || !instruction.trim()}
            className="flex-1 btn-accent flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                Aplicar
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
