'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface PromptSectionProps {
  id: string;
  title: string;
  icon: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  onMagicEdit: (sectionId: string, currentValue: string) => void;
  isLoading?: boolean;
}

export default function PromptSection({
  id,
  title,
  icon,
  description,
  value,
  onChange,
  onMagicEdit,
  isLoading = false,
}: PromptSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="playground-section">
      <div
        className="playground-section-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h3 className="font-semibold text-white text-base">{title}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="playground-section-content">
          <div className="relative">
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="playground-textarea"
              rows={5}
              disabled={isLoading}
            />
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                <div className="flex items-center gap-2 text-[var(--playground-accent)]">
                  <Sparkles className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-medium">Mejorando con IA...</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gray-500">
              {value.length} caracteres
            </span>
            <button
              onClick={() => onMagicEdit(id, value)}
              disabled={isLoading}
              className="btn-magic"
            >
              <Sparkles className="w-4 h-4" />
              Mejorar con IA
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
