'use client';

import { FileText, Package, Brain, Headphones, Zap, Lock } from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'active' | 'inactive';
  trigger: string;
}

const tools: Tool[] = [
  {
    id: 'documento',
    name: 'DOCUMENTO',
    description: 'Fuente de verdad oficial (politicas, FAQs, scripts)',
    icon: <FileText className="w-5 h-5" />,
    status: 'active',
    trigger: 'Dudas, politicas, detalles tecnicos, texto oficial',
  },
  {
    id: 'productos',
    name: 'PRODUCTOS',
    description: 'Precios, tabla 60/110, tamanos, disponibilidad',
    icon: <Package className="w-5 h-5" />,
    status: 'active',
    trigger: '"¿Cuanto vale?", cotizaciones, precios',
  },
  {
    id: 'memoria',
    name: 'MEMORIA',
    description: 'Guarda datos del cliente (tipo, intencion, preferencias)',
    icon: <Brain className="w-5 h-5" />,
    status: 'active',
    trigger: 'Cliente confirma o entrega datos utiles',
  },
  {
    id: 'soporte',
    name: 'SOPORTE',
    description: 'Deriva a humano (Pablo)',
    icon: <Headphones className="w-5 h-5" />,
    status: 'active',
    trigger: 'Pide humano, enojo, 3 intentos fallidos, excepciones',
  },
];

export default function ToolsDisplay() {
  return (
    <div className="playground-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--playground-accent)] to-[#ff6b6b] flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Herramientas del Agente</h3>
            <p className="text-xs text-gray-400">Configuradas en n8n (no editables)</p>
          </div>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30">
          <Lock className="w-3 h-3 text-yellow-500" />
          <span className="text-xs text-yellow-500 font-medium">Solo lectura</span>
        </div>
      </div>

      <div className="space-y-3">
        {tools.map((tool) => (
          <div key={tool.id} className="tool-badge flex-col items-start gap-2">
            <div className="flex items-center gap-3 w-full">
              <div className="text-[var(--playground-accent)]">
                {tool.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-sm">{tool.name}</span>
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>
                <p className="text-xs text-gray-400">{tool.description}</p>
              </div>
            </div>
            <div className="w-full pl-8">
              <p className="text-xs text-gray-500 italic">
                <span className="text-gray-400">Gatillo:</span> {tool.trigger}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
        <p className="text-xs text-amber-200/70 text-center flex items-center justify-center gap-2">
          <Lock className="w-3 h-3" />
          Las herramientas se configuran en el workflow de n8n, no aqui
        </p>
      </div>
    </div>
  );
}
