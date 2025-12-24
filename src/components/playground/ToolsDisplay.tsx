'use client';

import { FileText, Package, Brain, Headphones, Zap } from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'active' | 'inactive';
}

const tools: Tool[] = [
  {
    id: 'documento',
    name: 'Documento',
    description: 'Base de conocimiento del negocio',
    icon: <FileText className="w-5 h-5" />,
    status: 'active',
  },
  {
    id: 'productos',
    name: 'Productos',
    description: 'Consulta de precios y disponibilidad',
    icon: <Package className="w-5 h-5" />,
    status: 'active',
  },
  {
    id: 'memoria',
    name: 'Memoria',
    description: 'Historial de conversaciones',
    icon: <Brain className="w-5 h-5" />,
    status: 'active',
  },
  {
    id: 'soporte',
    name: 'Soporte',
    description: 'Escalado a agente humano',
    icon: <Headphones className="w-5 h-5" />,
    status: 'active',
  },
];

export default function ToolsDisplay() {
  return (
    <div className="playground-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--playground-accent)] to-[#ff6b6b] flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Herramientas Activas</h3>
          <p className="text-xs text-gray-400">Tools disponibles para el agente (solo lectura)</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {tools.map((tool) => (
          <div key={tool.id} className="tool-badge">
            <div className="text-[var(--playground-accent)]">
              {tool.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-white text-sm">{tool.name}</span>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </div>
              <p className="text-xs text-gray-400 truncate">{tool.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 rounded-lg bg-[var(--playground-secondary)] border border-[var(--playground-border)]">
        <p className="text-xs text-gray-400 text-center">
          Las herramientas se configuran en el workflow de n8n
        </p>
      </div>
    </div>
  );
}
